import json
import random
import time
from typing import List, Optional, Union

import requests

from letta.constants import CLI_WARNING_PREFIX, LETTA_MODEL_ENDPOINT
from letta.errors import LettaConfigurationError, RateLimitExceededError
from letta.llm_api.anthropic import (
    anthropic_bedrock_chat_completions_request,
    anthropic_chat_completions_process_stream,
    anthropic_chat_completions_request,
)
from letta.llm_api.aws_bedrock import has_valid_aws_credentials
from letta.llm_api.azure_openai import azure_openai_chat_completions_request
from letta.llm_api.deepseek import build_deepseek_chat_completions_request, convert_deepseek_response_to_chatcompletion
from letta.llm_api.helpers import add_inner_thoughts_to_functions, unpack_all_inner_thoughts_from_kwargs
from letta.llm_api.openai import (
    build_openai_chat_completions_request,
    openai_chat_completions_process_stream,
    openai_chat_completions_request,
    prepare_openai_payload,
)
from letta.local_llm.chat_completion_proxy import get_chat_completion
from letta.local_llm.constants import INNER_THOUGHTS_KWARG, INNER_THOUGHTS_KWARG_DESCRIPTION
from letta.local_llm.utils import num_tokens_from_functions, num_tokens_from_messages
from letta.orm.user import User
from letta.otel.tracing import log_event, trace_method
from letta.schemas.enums import ProviderCategory
from letta.schemas.llm_config import LLMConfig
from letta.schemas.message import Message
from letta.schemas.openai.chat_completion_request import ChatCompletionRequest, cast_message_to_subtype
from letta.schemas.openai.chat_completion_response import ChatCompletionResponse
from letta.schemas.provider_trace import ProviderTraceCreate
from letta.services.telemetry_manager import TelemetryManager
from letta.settings import ModelSettings
from letta.streaming_interface import AgentChunkStreamingInterface, AgentRefreshStreamingInterface

LLM_API_PROVIDER_OPTIONS = ["openai", "azure", "anthropic", "google_ai", "cohere", "local", "groq", "deepseek"]


def retry_with_exponential_backoff(
    func,
    initial_delay: float = 1,
    exponential_base: float = 2,
    jitter: bool = True,
    max_retries: int = 20,
    # List of OpenAI error codes: https://github.com/openai/openai-python/blob/17ac6779958b2b74999c634c4ea4c7b74906027a/src/openai/_client.py#L227-L250
    # 429 = rate limit
    error_codes: tuple = (429,),
):
    """Retry a function with exponential backoff."""

    def wrapper(*args, **kwargs):
        pass

        # Initialize variables
        num_retries = 0
        delay = initial_delay

        # Loop until a successful response or max_retries is hit or an exception is raised
        while True:
            try:
                return func(*args, **kwargs)
            except KeyboardInterrupt:
                # Stop retrying if user hits Ctrl-C
                raise KeyboardInterrupt("User intentionally stopped thread. Stopping...")
            except requests.exceptions.HTTPError as http_err:
                if not hasattr(http_err, "response") or not http_err.response:
                    raise

                # Retry on specified errors
                if http_err.response.status_code in error_codes:
                    # Increment retries
                    num_retries += 1
                    log_event(
                        "llm_retry_attempt",
                        {
                            "attempt": num_retries,
                            "delay": delay,
                            "status_code": http_err.response.status_code,
                            "error_type": type(http_err).__name__,
                            "error": str(http_err),
                        },
                    )

                    # Check if max retries has been reached
                    if num_retries > max_retries:
                        log_event(
                            "llm_max_retries_exceeded",
                            {
                                "max_retries": max_retries,
                                "status_code": http_err.response.status_code,
                                "error_type": type(http_err).__name__,
                                "error": str(http_err),
                            },
                        )
                        raise RateLimitExceededError("Maximum number of retries exceeded", max_retries=max_retries)

                    # Increment the delay
                    delay *= exponential_base * (1 + jitter * random.random())

                    # Sleep for the delay
                    # printd(f"Got a rate limit error ('{http_err}') on LLM backend request, waiting {int(delay)}s then retrying...")
                    print(
                        f"{CLI_WARNING_PREFIX}Got a rate limit error ('{http_err}') on LLM backend request, waiting {int(delay)}s then retrying..."
                    )
                    time.sleep(delay)
                else:
                    # For other HTTP errors, re-raise the exception
                    log_event(
                        "llm_non_retryable_error",
                        {"status_code": http_err.response.status_code, "error_type": type(http_err).__name__, "error": str(http_err)},
                    )
                    raise

            # Raise exceptions for any errors not specified
            except Exception as e:
                log_event("llm_unexpected_error", {"error_type": type(e).__name__, "error": str(e)})
                raise e

    return wrapper


@trace_method
@retry_with_exponential_backoff
def create(
    # agent_state: AgentState,
    llm_config: LLMConfig,
    messages: List[Message],
    user_id: Optional[str] = None,  # option UUID to associate request with
    functions: Optional[list] = None,
    functions_python: Optional[dict] = None,
    function_call: Optional[str] = None,  # see: https://platform.openai.com/docs/api-reference/chat/create#chat-create-tool_choice
    # hint
    first_message: bool = False,
    force_tool_call: Optional[str] = None,  # Force a specific tool to be called
    # use tool naming?
    # if false, will use deprecated 'functions' style
    use_tool_naming: bool = True,
    # streaming?
    stream: bool = False,
    stream_interface: Optional[Union[AgentRefreshStreamingInterface, AgentChunkStreamingInterface]] = None,
    model_settings: Optional[dict] = None,  # TODO: eventually pass from server
    put_inner_thoughts_first: bool = True,
    name: Optional[str] = None,
    telemetry_manager: Optional[TelemetryManager] = None,
    step_id: Optional[str] = None,
    actor: Optional[User] = None,
) -> ChatCompletionResponse:
    """Return response to chat completion with backoff"""
    from letta.utils import printd

    # Count the tokens first, if there's an overflow exit early by throwing an error up the stack
    # NOTE: we want to include a specific substring in the error message to trigger summarization
    messages_oai_format = [m.to_openai_dict() for m in messages]
    prompt_tokens = num_tokens_from_messages(messages=messages_oai_format, model=llm_config.model)
    function_tokens = num_tokens_from_functions(functions=functions, model=llm_config.model) if functions else 0
    if prompt_tokens + function_tokens > llm_config.context_window:
        raise Exception(f"Request exceeds maximum context length ({prompt_tokens + function_tokens} > {llm_config.context_window} tokens)")

    if not model_settings:
        from letta.settings import model_settings

        model_settings = model_settings
        assert isinstance(model_settings, ModelSettings)

    printd(f"Using model {llm_config.model_endpoint_type}, endpoint: {llm_config.model_endpoint}")

    if function_call and not functions:
        printd("unsetting function_call because functions is None")
        function_call = None

    # openai
    if llm_config.model_endpoint_type == "openai":
        if model_settings.openai_api_key is None and llm_config.model_endpoint == "https://api.openai.com/v1":
            # only is a problem if we are *not* using an openai proxy
            raise LettaConfigurationError(message="OpenAI key is missing from letta config file", missing_fields=["openai_api_key"])
        elif llm_config.provider_category == ProviderCategory.byok:
            from letta.services.provider_manager import ProviderManager
            from letta.services.user_manager import UserManager

            actor = UserManager().get_user_or_default(user_id=user_id)
            api_key = ProviderManager().get_override_key(llm_config.provider_name, actor=actor)
        elif model_settings.openai_api_key is None:
            # the openai python client requires a dummy API key
            api_key = "DUMMY_API_KEY"
        else:
            api_key = model_settings.openai_api_key

        if function_call is None and functions is not None and len(functions) > 0:
            # force function calling for reliability, see https://platform.openai.com/docs/api-reference/chat/create#chat-create-tool_choice
            # TODO(matt) move into LLMConfig
            # TODO: This vllm checking is very brittle and is a patch at most
            if llm_config.model_endpoint == LETTA_MODEL_ENDPOINT or (llm_config.handle and "vllm" in llm_config.handle):
                function_call = "auto"  # TODO change to "required" once proxy supports it
            else:
                function_call = "required"

        data = build_openai_chat_completions_request(
            llm_config,
            messages,
            user_id,
            functions,
            function_call,
            use_tool_naming,
            put_inner_thoughts_first=put_inner_thoughts_first,
            use_structured_output=True,  # NOTE: turn on all the time for OpenAI API
        )

        if stream:  # Client requested token streaming
            data.stream = True
            assert isinstance(stream_interface, AgentChunkStreamingInterface) or isinstance(
                stream_interface, AgentRefreshStreamingInterface
            ), type(stream_interface)
            response = openai_chat_completions_process_stream(
                url=llm_config.model_endpoint,
                api_key=api_key,
                chat_completion_request=data,
                stream_interface=stream_interface,
                name=name,
                # NOTE: needs to be true for OpenAI proxies that use the `reasoning_content` field
                # For example, DeepSeek, or LM Studio
                expect_reasoning_content=False,
            )
        else:  # Client did not request token streaming (expect a blocking backend response)
            data.stream = False
            if isinstance(stream_interface, AgentChunkStreamingInterface):
                stream_interface.stream_start()
            try:
                response = openai_chat_completions_request(
                    url=llm_config.model_endpoint,
                    api_key=api_key,
                    chat_completion_request=data,
                )
            finally:
                if isinstance(stream_interface, AgentChunkStreamingInterface):
                    stream_interface.stream_end()

        telemetry_manager.create_provider_trace(
            actor=actor,
            provider_trace_create=ProviderTraceCreate(
                request_json=prepare_openai_payload(data),
                response_json=response.model_json_schema(),
                step_id=step_id,
                organization_id=actor.organization_id,
            ),
        )

        if llm_config.put_inner_thoughts_in_kwargs:
            response = unpack_all_inner_thoughts_from_kwargs(response=response, inner_thoughts_key=INNER_THOUGHTS_KWARG)

        return response

    elif llm_config.model_endpoint_type == "xai":
        api_key = model_settings.xai_api_key

        if function_call is None and functions is not None and len(functions) > 0:
            # force function calling for reliability, see https://platform.openai.com/docs/api-reference/chat/create#chat-create-tool_choice
            function_call = "required"

        data = build_openai_chat_completions_request(
            llm_config,
            messages,
            user_id,
            functions,
            function_call,
            use_tool_naming,
            put_inner_thoughts_first=put_inner_thoughts_first,
            use_structured_output=False,  # NOTE: not supported atm for xAI
        )

        # Specific bug for the mini models (as of Apr 14, 2025)
        # 400 - {'code': 'Client specified an invalid argument', 'error': 'Argument not supported on this model: presencePenalty'}
        # 400 - {'code': 'Client specified an invalid argument', 'error': 'Argument not supported on this model: frequencyPenalty'}
        if "grok-3-mini-" in llm_config.model:
            data.presence_penalty = None
            data.frequency_penalty = None

        if stream:  # Client requested token streaming
            data.stream = True
            assert isinstance(stream_interface, AgentChunkStreamingInterface) or isinstance(
                stream_interface, AgentRefreshStreamingInterface
            ), type(stream_interface)
            response = openai_chat_completions_process_stream(
                url=llm_config.model_endpoint,
                api_key=api_key,
                chat_completion_request=data,
                stream_interface=stream_interface,
                name=name,
                # TODO turn on to support reasoning content from xAI reasoners:
                # https://docs.x.ai/docs/guides/reasoning#reasoning
                expect_reasoning_content=False,
            )
        else:  # Client did not request token streaming (expect a blocking backend response)
            data.stream = False
            if isinstance(stream_interface, AgentChunkStreamingInterface):
                stream_interface.stream_start()
            try:
                response = openai_chat_completions_request(
                    url=llm_config.model_endpoint,
                    api_key=api_key,
                    chat_completion_request=data,
                )
            finally:
                if isinstance(stream_interface, AgentChunkStreamingInterface):
                    stream_interface.stream_end()

        if llm_config.put_inner_thoughts_in_kwargs:
            response = unpack_all_inner_thoughts_from_kwargs(response=response, inner_thoughts_key=INNER_THOUGHTS_KWARG)

        return response

    # azure
    elif llm_config.model_endpoint_type == "azure":
        if stream:
            raise NotImplementedError(f"Streaming not yet implemented for {llm_config.model_endpoint_type}")

        if model_settings.azure_api_key is None:
            raise LettaConfigurationError(
                message="Azure API key is missing. Did you set AZURE_API_KEY in your env?", missing_fields=["azure_api_key"]
            )

        if model_settings.azure_base_url is None:
            raise LettaConfigurationError(
                message="Azure base url is missing. Did you set AZURE_BASE_URL in your env?", missing_fields=["azure_base_url"]
            )

        if model_settings.azure_api_version is None:
            raise LettaConfigurationError(
                message="Azure API version is missing. Did you set AZURE_API_VERSION in your env?", missing_fields=["azure_api_version"]
            )

        # Set the llm config model_endpoint from model_settings
        # For Azure, this model_endpoint is required to be configured via env variable, so users don't need to provide it in the LLM config
        llm_config.model_endpoint = model_settings.azure_base_url
        chat_completion_request = build_openai_chat_completions_request(
            llm_config, messages, user_id, functions, function_call, use_tool_naming
        )

        response = azure_openai_chat_completions_request(
            model_settings=model_settings,
            llm_config=llm_config,
            chat_completion_request=chat_completion_request,
        )

        if llm_config.put_inner_thoughts_in_kwargs:
            response = unpack_all_inner_thoughts_from_kwargs(response=response, inner_thoughts_key=INNER_THOUGHTS_KWARG)

        return response

    elif llm_config.model_endpoint_type == "anthropic":
        if not use_tool_naming:
            raise NotImplementedError("Only tool calling supported on Anthropic API requests")

        if llm_config.enable_reasoner:
            llm_config.put_inner_thoughts_in_kwargs = False

        # Force tool calling
        tool_call = None
        if functions is None:
            # Special case for summarization path
            tools = None
            tool_choice = None
        elif force_tool_call is not None:
            # tool_call = {"type": "function", "function": {"name": force_tool_call}}
            tool_choice = {"type": "tool", "name": force_tool_call}
            tools = [{"type": "function", "function": f} for f in functions if f["name"] == force_tool_call]
            assert functions is not None

            # need to have this setting to be able to put inner thoughts in kwargs
            llm_config.put_inner_thoughts_in_kwargs = True
        else:
            if llm_config.put_inner_thoughts_in_kwargs:
                # tool_choice_type other than "auto" only plays nice if thinking goes inside the tool calls
                tool_choice = {"type": "any", "disable_parallel_tool_use": True}
            else:
                tool_choice = {"type": "auto", "disable_parallel_tool_use": True}
            tools = [{"type": "function", "function": f} for f in functions] if functions is not None else None

        chat_completion_request = ChatCompletionRequest(
            model=llm_config.model,
            messages=[cast_message_to_subtype(m.to_openai_dict()) for m in messages],
            tools=tools,
            tool_choice=tool_choice,
            max_tokens=llm_config.max_tokens,  # Note: max_tokens is required for Anthropic API
            temperature=llm_config.temperature,
            stream=stream,
        )

        # Handle streaming
        if stream:  # Client requested token streaming
            assert isinstance(stream_interface, (AgentChunkStreamingInterface, AgentRefreshStreamingInterface)), type(stream_interface)

            stream_interface.inner_thoughts_in_kwargs = True
            response = anthropic_chat_completions_process_stream(
                chat_completion_request=chat_completion_request,
                put_inner_thoughts_in_kwargs=llm_config.put_inner_thoughts_in_kwargs,
                stream_interface=stream_interface,
                extended_thinking=llm_config.enable_reasoner,
                max_reasoning_tokens=llm_config.max_reasoning_tokens,
                provider_name=llm_config.provider_name,
                provider_category=llm_config.provider_category,
                name=name,
                user_id=user_id,
            )

        else:
            # Client did not request token streaming (expect a blocking backend response)
            response = anthropic_chat_completions_request(
                data=chat_completion_request,
                put_inner_thoughts_in_kwargs=llm_config.put_inner_thoughts_in_kwargs,
                extended_thinking=llm_config.enable_reasoner,
                max_reasoning_tokens=llm_config.max_reasoning_tokens,
                provider_name=llm_config.provider_name,
                provider_category=llm_config.provider_category,
                user_id=user_id,
            )

        if llm_config.put_inner_thoughts_in_kwargs:
            response = unpack_all_inner_thoughts_from_kwargs(response=response, inner_thoughts_key=INNER_THOUGHTS_KWARG)

        telemetry_manager.create_provider_trace(
            actor=actor,
            provider_trace_create=ProviderTraceCreate(
                request_json=chat_completion_request.model_json_schema(),
                response_json=response.model_json_schema(),
                step_id=step_id,
                organization_id=actor.organization_id,
            ),
        )

        return response

    # elif llm_config.model_endpoint_type == "cohere":
    #     if stream:
    #         raise NotImplementedError(f"Streaming not yet implemented for {llm_config.model_endpoint_type}")
    #     if not use_tool_naming:
    #         raise NotImplementedError("Only tool calling supported on Cohere API requests")
    #
    #     if functions is not None:
    #         tools = [{"type": "function", "function": f} for f in functions]
    #         tools = [Tool(**t) for t in tools]
    #     else:
    #         tools = None
    #
    #     return cohere_chat_completions_request(
    #         # url=llm_config.model_endpoint,
    #         url="https://api.cohere.ai/v1",  # TODO
    #         api_key=os.getenv("COHERE_API_KEY"),  # TODO remove
    #         chat_completion_request=ChatCompletionRequest(
    #             model="command-r-plus",  # TODO
    #             messages=[cast_message_to_subtype(m.to_openai_dict()) for m in messages],
    #             tools=tools,
    #             tool_choice=function_call,
    #             # user=str(user_id),
    #             # NOTE: max_tokens is required for Anthropic API
    #             # max_tokens=1024,  # TODO make dynamic
    #         ),
    #     )
    elif llm_config.model_endpoint_type == "groq":
        if stream:
            raise NotImplementedError("Streaming not yet implemented for Groq.")

        if model_settings.groq_api_key is None and llm_config.model_endpoint == "https://api.groq.com/openai/v1/chat/completions":
            raise LettaConfigurationError(message="Groq key is missing from letta config file", missing_fields=["groq_api_key"])

        # force to true for groq, since they don't support 'content' is non-null
        if llm_config.put_inner_thoughts_in_kwargs:
            functions = add_inner_thoughts_to_functions(
                functions=functions,
                inner_thoughts_key=INNER_THOUGHTS_KWARG,
                inner_thoughts_description=INNER_THOUGHTS_KWARG_DESCRIPTION,
            )

        tools = [{"type": "function", "function": f} for f in functions] if functions is not None else None
        data = ChatCompletionRequest(
            model=llm_config.model,
            messages=[m.to_openai_dict(put_inner_thoughts_in_kwargs=llm_config.put_inner_thoughts_in_kwargs) for m in messages],
            tools=tools,
            tool_choice=function_call,
            user=str(user_id),
        )

        # https://console.groq.com/docs/openai
        # "The following fields are currently not supported and will result in a 400 error (yikes) if they are supplied:"
        assert data.top_logprobs is None
        assert data.logit_bias is None
        assert data.logprobs == False
        assert data.n == 1
        # They mention that none of the messages can have names, but it seems to not error out (for now)

        data.stream = False
        if isinstance(stream_interface, AgentChunkStreamingInterface):
            stream_interface.stream_start()
        try:
            # groq uses the openai chat completions API, so this component should be reusable
            response = openai_chat_completions_request(
                url=llm_config.model_endpoint,
                api_key=model_settings.groq_api_key,
                chat_completion_request=data,
            )
        finally:
            if isinstance(stream_interface, AgentChunkStreamingInterface):
                stream_interface.stream_end()

        if llm_config.put_inner_thoughts_in_kwargs:
            response = unpack_all_inner_thoughts_from_kwargs(response=response, inner_thoughts_key=INNER_THOUGHTS_KWARG)

        return response

    elif llm_config.model_endpoint_type == "together":
        """TogetherAI endpoint that goes via /completions instead of /chat/completions"""

        if stream:
            raise NotImplementedError("Streaming not yet implemented for TogetherAI (via the /completions endpoint).")

        if model_settings.together_api_key is None and (
            llm_config.model_endpoint == "https://api.together.ai/v1/completions"
            or llm_config.model_endpoint == "https://api.together.xyz/v1/completions"
        ):
            raise LettaConfigurationError(message="TogetherAI key is missing from letta config file", missing_fields=["together_api_key"])

        return get_chat_completion(
            model=llm_config.model,
            messages=messages,
            functions=functions,
            functions_python=functions_python,
            function_call=function_call,
            context_window=llm_config.context_window,
            endpoint=llm_config.model_endpoint,
            endpoint_type="vllm",  # NOTE: use the vLLM path through /completions
            wrapper=llm_config.model_wrapper,
            user=str(user_id),
            # hint
            first_message=first_message,
            # auth-related
            auth_type="bearer_token",  # NOTE: Together expects bearer token auth
            auth_key=model_settings.together_api_key,
        )

    elif llm_config.model_endpoint_type == "bedrock":
        """Anthropic endpoint that goes via /embeddings instead of /chat/completions"""

        if stream:
            raise NotImplementedError("Streaming not yet implemented for Anthropic (via the /embeddings endpoint).")
        if not use_tool_naming:
            raise NotImplementedError("Only tool calling supported on Anthropic API requests")

        if not has_valid_aws_credentials():
            raise LettaConfigurationError(message="Invalid or missing AWS credentials. Please configure valid AWS credentials.")

        tool_call = None
        if force_tool_call is not None:
            tool_call = {"type": "function", "function": {"name": force_tool_call}}
            assert functions is not None

        return anthropic_bedrock_chat_completions_request(
            data=ChatCompletionRequest(
                model=llm_config.model,
                messages=[cast_message_to_subtype(m.to_openai_dict()) for m in messages],
                tools=[{"type": "function", "function": f} for f in functions] if functions else None,
                tool_choice=tool_call,
                # user=str(user_id),
                # NOTE: max_tokens is required for Anthropic API
                max_tokens=llm_config.max_tokens,
            ),
            provider_name=llm_config.provider_name,
            provider_category=llm_config.provider_category,
            user_id=user_id,
        )

    elif llm_config.model_endpoint_type == "deepseek":
        if model_settings.deepseek_api_key is None and llm_config.model_endpoint == "":
            # only is a problem if we are *not* using an openai proxy
            raise LettaConfigurationError(message="DeepSeek key is missing from letta config file", missing_fields=["deepseek_api_key"])

        data = build_deepseek_chat_completions_request(
            llm_config,
            messages,
            user_id,
            functions,
            function_call,
            use_tool_naming,
            llm_config.max_tokens,
        )
        if stream:  # Client requested token streaming
            data.stream = True
            assert isinstance(stream_interface, AgentChunkStreamingInterface) or isinstance(
                stream_interface, AgentRefreshStreamingInterface
            ), type(stream_interface)
            response = openai_chat_completions_process_stream(
                url=llm_config.model_endpoint,
                api_key=model_settings.deepseek_api_key,
                chat_completion_request=data,
                stream_interface=stream_interface,
                name=name,
                # TODO should we toggle for R1 vs V3?
                expect_reasoning_content=True,
            )
        else:  # Client did not request token streaming (expect a blocking backend response)
            data.stream = False
            if isinstance(stream_interface, AgentChunkStreamingInterface):
                stream_interface.stream_start()
            try:
                response = openai_chat_completions_request(
                    url=llm_config.model_endpoint,
                    api_key=model_settings.deepseek_api_key,
                    chat_completion_request=data,
                )
            finally:
                if isinstance(stream_interface, AgentChunkStreamingInterface):
                    stream_interface.stream_end()
        """
        if llm_config.put_inner_thoughts_in_kwargs:
            response = unpack_all_inner_thoughts_from_kwargs(response=response, inner_thoughts_key=INNER_THOUGHTS_KWARG)
        """
        response = convert_deepseek_response_to_chatcompletion(response)
        return response

    # local model
    else:
        if stream:
            raise NotImplementedError(f"Streaming not yet implemented for {llm_config.model_endpoint_type}")

        if "DeepSeek-R1".lower() in llm_config.model.lower():  # TODO: move this to the llm_config.
            messages[0].content[0].text += f"<available functions> {''.join(json.dumps(f) for f in functions)} </available functions>"
            messages[0].content[
                0
            ].text += 'Select best function to call simply by responding with a single json block with the keys "function" and "params". Use double quotes around the arguments.'
        return get_chat_completion(
            model=llm_config.model,
            messages=messages,
            functions=functions,
            functions_python=functions_python,
            function_call=function_call,
            context_window=llm_config.context_window,
            endpoint=llm_config.model_endpoint,
            endpoint_type=llm_config.model_endpoint_type,
            wrapper=llm_config.model_wrapper,
            user=str(user_id),
            # hint
            first_message=first_message,
            # auth-related
            auth_type=model_settings.openllm_auth_type,
            auth_key=model_settings.openllm_api_key,
        )
