from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from letta.orm.agent import Agent as AgentModel
from letta.orm.errors import NoResultFound
from letta.orm.group import Group as GroupModel
from letta.orm.message import Message as MessageModel
from letta.otel.tracing import trace_method
from letta.schemas.group import Group as PydanticGroup
from letta.schemas.group import GroupCreate, GroupUpdate, ManagerType
from letta.schemas.letta_message import LettaMessage
from letta.schemas.message import Message as PydanticMessage
from letta.schemas.user import User as PydanticUser
from letta.server.db import db_registry
from letta.utils import enforce_types


class GroupManager:
    @enforce_types
    @trace_method
    def list_groups(
        self,
        actor: PydanticUser,
        project_id: Optional[str] = None,
        manager_type: Optional[ManagerType] = None,
        before: Optional[str] = None,
        after: Optional[str] = None,
        limit: Optional[int] = 50,
    ) -> list[PydanticGroup]:
        with db_registry.session() as session:
            filters = {"organization_id": actor.organization_id}
            if project_id:
                filters["project_id"] = project_id
            if manager_type:
                filters["manager_type"] = manager_type
            groups = GroupModel.list(
                db_session=session,
                before=before,
                after=after,
                limit=limit,
                **filters,
            )
            return [group.to_pydantic() for group in groups]

    @enforce_types
    @trace_method
    def retrieve_group(self, group_id: str, actor: PydanticUser) -> PydanticGroup:
        with db_registry.session() as session:
            group = GroupModel.read(db_session=session, identifier=group_id, actor=actor)
            return group.to_pydantic()

    @enforce_types
    @trace_method
    async def retrieve_group_async(self, group_id: str, actor: PydanticUser) -> PydanticGroup:
        async with db_registry.async_session() as session:
            group = await GroupModel.read_async(db_session=session, identifier=group_id, actor=actor)
            return group.to_pydantic()

    @enforce_types
    @trace_method
    def create_group(self, group: GroupCreate, actor: PydanticUser) -> PydanticGroup:
        with db_registry.session() as session:
            new_group = GroupModel()
            new_group.organization_id = actor.organization_id
            new_group.description = group.description

            match group.manager_config.manager_type:
                case ManagerType.round_robin:
                    new_group.manager_type = ManagerType.round_robin
                    new_group.max_turns = group.manager_config.max_turns
                case ManagerType.dynamic:
                    new_group.manager_type = ManagerType.dynamic
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                    new_group.max_turns = group.manager_config.max_turns
                    new_group.termination_token = group.manager_config.termination_token
                case ManagerType.supervisor:
                    new_group.manager_type = ManagerType.supervisor
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                case ManagerType.sleeptime:
                    new_group.manager_type = ManagerType.sleeptime
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                    new_group.sleeptime_agent_frequency = group.manager_config.sleeptime_agent_frequency
                    if new_group.sleeptime_agent_frequency:
                        new_group.turns_counter = -1
                case ManagerType.voice_sleeptime:
                    new_group.manager_type = ManagerType.voice_sleeptime
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                    max_message_buffer_length = group.manager_config.max_message_buffer_length
                    min_message_buffer_length = group.manager_config.min_message_buffer_length
                    # Safety check for buffer length range
                    self.ensure_buffer_length_range_valid(max_value=max_message_buffer_length, min_value=min_message_buffer_length)
                    new_group.max_message_buffer_length = max_message_buffer_length
                    new_group.min_message_buffer_length = min_message_buffer_length
                case _:
                    raise ValueError(f"Unsupported manager type: {group.manager_config.manager_type}")

            self._process_agent_relationship(session=session, group=new_group, agent_ids=group.agent_ids, allow_partial=False)

            if group.shared_block_ids:
                self._process_shared_block_relationship(session=session, group=new_group, block_ids=group.shared_block_ids)

            new_group.create(session, actor=actor)
            return new_group.to_pydantic()

    @enforce_types
    async def create_group_async(self, group: GroupCreate, actor: PydanticUser) -> PydanticGroup:
        async with db_registry.async_session() as session:
            new_group = GroupModel()
            new_group.organization_id = actor.organization_id
            new_group.description = group.description

            match group.manager_config.manager_type:
                case ManagerType.round_robin:
                    new_group.manager_type = ManagerType.round_robin
                    new_group.max_turns = group.manager_config.max_turns
                case ManagerType.dynamic:
                    new_group.manager_type = ManagerType.dynamic
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                    new_group.max_turns = group.manager_config.max_turns
                    new_group.termination_token = group.manager_config.termination_token
                case ManagerType.supervisor:
                    new_group.manager_type = ManagerType.supervisor
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                case ManagerType.sleeptime:
                    new_group.manager_type = ManagerType.sleeptime
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                    new_group.sleeptime_agent_frequency = group.manager_config.sleeptime_agent_frequency
                    if new_group.sleeptime_agent_frequency:
                        new_group.turns_counter = -1
                case ManagerType.voice_sleeptime:
                    new_group.manager_type = ManagerType.voice_sleeptime
                    new_group.manager_agent_id = group.manager_config.manager_agent_id
                    max_message_buffer_length = group.manager_config.max_message_buffer_length
                    min_message_buffer_length = group.manager_config.min_message_buffer_length
                    # Safety check for buffer length range
                    self.ensure_buffer_length_range_valid(max_value=max_message_buffer_length, min_value=min_message_buffer_length)
                    new_group.max_message_buffer_length = max_message_buffer_length
                    new_group.min_message_buffer_length = min_message_buffer_length
                case _:
                    raise ValueError(f"Unsupported manager type: {group.manager_config.manager_type}")

            await self._process_agent_relationship_async(session=session, group=new_group, agent_ids=group.agent_ids, allow_partial=False)

            if group.shared_block_ids:
                await self._process_shared_block_relationship_async(session=session, group=new_group, block_ids=group.shared_block_ids)

            await new_group.create_async(session, actor=actor)
            return new_group.to_pydantic()

    @enforce_types
    @trace_method
    async def modify_group_async(self, group_id: str, group_update: GroupUpdate, actor: PydanticUser) -> PydanticGroup:
        async with db_registry.async_session() as session:
            group = await GroupModel.read_async(db_session=session, identifier=group_id, actor=actor)

            sleeptime_agent_frequency = None
            max_message_buffer_length = None
            min_message_buffer_length = None
            max_turns = None
            termination_token = None
            manager_agent_id = None
            if group_update.manager_config:
                if group_update.manager_config.manager_type != group.manager_type:
                    raise ValueError("Cannot change group pattern after creation")
                match group_update.manager_config.manager_type:
                    case ManagerType.round_robin:
                        max_turns = group_update.manager_config.max_turns
                    case ManagerType.dynamic:
                        manager_agent_id = group_update.manager_config.manager_agent_id
                        max_turns = group_update.manager_config.max_turns
                        termination_token = group_update.manager_config.termination_token
                    case ManagerType.supervisor:
                        manager_agent_id = group_update.manager_config.manager_agent_id
                    case ManagerType.sleeptime:
                        manager_agent_id = group_update.manager_config.manager_agent_id
                        sleeptime_agent_frequency = group_update.manager_config.sleeptime_agent_frequency
                        if sleeptime_agent_frequency and group.turns_counter is None:
                            group.turns_counter = -1
                    case ManagerType.voice_sleeptime:
                        manager_agent_id = group_update.manager_config.manager_agent_id
                        max_message_buffer_length = group_update.manager_config.max_message_buffer_length or group.max_message_buffer_length
                        min_message_buffer_length = group_update.manager_config.min_message_buffer_length or group.min_message_buffer_length
                        if sleeptime_agent_frequency and group.turns_counter is None:
                            group.turns_counter = -1
                    case _:
                        raise ValueError(f"Unsupported manager type: {group_update.manager_config.manager_type}")

            # Safety check for buffer length range
            self.ensure_buffer_length_range_valid(max_value=max_message_buffer_length, min_value=min_message_buffer_length)

            if sleeptime_agent_frequency:
                group.sleeptime_agent_frequency = sleeptime_agent_frequency
            if max_message_buffer_length:
                group.max_message_buffer_length = max_message_buffer_length
            if min_message_buffer_length:
                group.min_message_buffer_length = min_message_buffer_length
            if max_turns:
                group.max_turns = max_turns
            if termination_token:
                group.termination_token = termination_token
            if manager_agent_id:
                group.manager_agent_id = manager_agent_id
            if group_update.description:
                group.description = group_update.description
            if group_update.agent_ids:
                await self._process_agent_relationship_async(
                    session=session, group=group, agent_ids=group_update.agent_ids, allow_partial=False, replace=True
                )

            await group.update_async(session, actor=actor)
            return group.to_pydantic()

    @enforce_types
    @trace_method
    def delete_group(self, group_id: str, actor: PydanticUser) -> None:
        with db_registry.session() as session:
            # Retrieve the agent
            group = GroupModel.read(db_session=session, identifier=group_id, actor=actor)
            group.hard_delete(session)

    @enforce_types
    @trace_method
    async def delete_group_async(self, group_id: str, actor: PydanticUser) -> None:
        async with db_registry.async_session() as session:
            group = await GroupModel.read_async(db_session=session, identifier=group_id, actor=actor)
            await group.hard_delete_async(session)

    @enforce_types
    @trace_method
    def list_group_messages(
        self,
        actor: PydanticUser,
        group_id: Optional[str] = None,
        before: Optional[str] = None,
        after: Optional[str] = None,
        limit: Optional[int] = 50,
        use_assistant_message: bool = True,
        assistant_message_tool_name: str = "send_message",
        assistant_message_tool_kwarg: str = "message",
    ) -> list[LettaMessage]:
        with db_registry.session() as session:
            filters = {
                "organization_id": actor.organization_id,
                "group_id": group_id,
            }
            messages = MessageModel.list(
                db_session=session,
                before=before,
                after=after,
                limit=limit,
                **filters,
            )

            messages = PydanticMessage.to_letta_messages_from_list(
                messages=[msg.to_pydantic() for msg in messages],
                use_assistant_message=use_assistant_message,
                assistant_message_tool_name=assistant_message_tool_name,
                assistant_message_tool_kwarg=assistant_message_tool_kwarg,
            )

            # TODO: filter messages to return a clean conversation history

            return messages

    @enforce_types
    @trace_method
    def reset_messages(self, group_id: str, actor: PydanticUser) -> None:
        with db_registry.session() as session:
            # Ensure group is loadable by user
            group = GroupModel.read(db_session=session, identifier=group_id, actor=actor)

            # Delete all messages in the group
            session.query(MessageModel).filter(
                MessageModel.organization_id == actor.organization_id, MessageModel.group_id == group_id
            ).delete(synchronize_session=False)

            session.commit()

    @enforce_types
    @trace_method
    def bump_turns_counter(self, group_id: str, actor: PydanticUser) -> int:
        with db_registry.session() as session:
            # Ensure group is loadable by user
            group = GroupModel.read(db_session=session, identifier=group_id, actor=actor)

            # Update turns counter
            group.turns_counter = (group.turns_counter + 1) % group.sleeptime_agent_frequency
            group.update(session, actor=actor)
            return group.turns_counter

    @enforce_types
    @trace_method
    async def bump_turns_counter_async(self, group_id: str, actor: PydanticUser) -> int:
        async with db_registry.async_session() as session:
            # Ensure group is loadable by user
            group = await GroupModel.read_async(session, identifier=group_id, actor=actor)

            # Update turns counter
            group.turns_counter = (group.turns_counter + 1) % group.sleeptime_agent_frequency
            await group.update_async(session, actor=actor)
            return group.turns_counter

    @enforce_types
    def get_last_processed_message_id_and_update(self, group_id: str, last_processed_message_id: str, actor: PydanticUser) -> str:
        with db_registry.session() as session:
            # Ensure group is loadable by user
            group = GroupModel.read(db_session=session, identifier=group_id, actor=actor)

            # Update last processed message id
            prev_last_processed_message_id = group.last_processed_message_id
            group.last_processed_message_id = last_processed_message_id
            group.update(session, actor=actor)

            return prev_last_processed_message_id

    @enforce_types
    @trace_method
    async def get_last_processed_message_id_and_update_async(
        self, group_id: str, last_processed_message_id: str, actor: PydanticUser
    ) -> str:
        async with db_registry.async_session() as session:
            # Ensure group is loadable by user
            group = await GroupModel.read_async(session, identifier=group_id, actor=actor)

            # Update last processed message id
            prev_last_processed_message_id = group.last_processed_message_id
            group.last_processed_message_id = last_processed_message_id
            await group.update_async(session, actor=actor)

            return prev_last_processed_message_id

    @enforce_types
    def size(
        self,
        actor: PydanticUser,
    ) -> int:
        """
        Get the total count of groups for the given user.
        """
        with db_registry.session() as session:
            return GroupModel.size(db_session=session, actor=actor)

    def _process_agent_relationship(self, session: Session, group: GroupModel, agent_ids: List[str], allow_partial=False, replace=True):
        if not agent_ids:
            if replace:
                setattr(group, "agents", [])
                setattr(group, "agent_ids", [])
            return

        if group.manager_type == ManagerType.dynamic and len(agent_ids) != len(set(agent_ids)):
            raise ValueError("Duplicate agent ids found in list")

        # Retrieve models for the provided IDs
        found_items = session.query(AgentModel).filter(AgentModel.id.in_(agent_ids)).all()

        # Validate all items are found if allow_partial is False
        if not allow_partial and len(found_items) != len(agent_ids):
            missing = set(agent_ids) - {item.id for item in found_items}
            raise NoResultFound(f"Items not found in agents: {missing}")

        if group.manager_type == ManagerType.dynamic:
            names = [item.name for item in found_items]
            if len(names) != len(set(names)):
                raise ValueError("Duplicate agent names found in the provided agent IDs.")

        if replace:
            # Replace the relationship
            setattr(group, "agents", found_items)
            setattr(group, "agent_ids", agent_ids)
        else:
            raise ValueError("Extend relationship is not supported for groups.")

    async def _process_agent_relationship_async(self, session, group: GroupModel, agent_ids: List[str], allow_partial=False, replace=True):
        if not agent_ids:
            if replace:
                setattr(group, "agents", [])
                setattr(group, "agent_ids", [])
            return

        if group.manager_type == ManagerType.dynamic and len(agent_ids) != len(set(agent_ids)):
            raise ValueError("Duplicate agent ids found in list")

        # Retrieve models for the provided IDs
        query = select(AgentModel).where(AgentModel.id.in_(agent_ids))
        result = await session.execute(query)
        found_items = result.scalars().all()

        # Validate all items are found if allow_partial is False
        if not allow_partial and len(found_items) != len(agent_ids):
            missing = set(agent_ids) - {item.id for item in found_items}
            raise NoResultFound(f"Items not found in agents: {missing}")

        if group.manager_type == ManagerType.dynamic:
            names = [item.name for item in found_items]
            if len(names) != len(set(names)):
                raise ValueError("Duplicate agent names found in the provided agent IDs.")

        if replace:
            # Replace the relationship
            setattr(group, "agents", found_items)
            setattr(group, "agent_ids", agent_ids)
        else:
            raise ValueError("Extend relationship is not supported for groups.")

    def _process_shared_block_relationship(
        self,
        session: Session,
        group: GroupModel,
        block_ids: List[str],
    ):
        """Process shared block relationships for a group and its agents."""
        from letta.orm import Agent, Block, BlocksAgents

        # Add blocks to group
        blocks = session.query(Block).filter(Block.id.in_(block_ids)).all()
        group.shared_blocks = blocks

        # Add blocks to all agents
        if group.agent_ids:
            agents = session.query(Agent).filter(Agent.id.in_(group.agent_ids)).all()
            for agent in agents:
                for block in blocks:
                    session.add(BlocksAgents(agent_id=agent.id, block_id=block.id, block_label=block.label))

        # Add blocks to manager agent if exists
        if group.manager_agent_id:
            manager_agent = session.query(Agent).filter(Agent.id == group.manager_agent_id).first()
            if manager_agent:
                for block in blocks:
                    session.add(BlocksAgents(agent_id=manager_agent.id, block_id=block.id, block_label=block.label))

    async def _process_shared_block_relationship_async(
        self,
        session,
        group: GroupModel,
        block_ids: List[str],
    ):
        """Process shared block relationships for a group and its agents."""
        from letta.orm import Agent, Block, BlocksAgents

        # Add blocks to group
        query = select(Block).where(Block.id.in_(block_ids))
        result = await session.execute(query)
        blocks = result.scalars().all()
        group.shared_blocks = blocks

        # Add blocks to all agents
        if group.agent_ids:
            query = select(Agent).where(Agent.id.in_(group.agent_ids))
            result = await session.execute(query)
            agents = result.scalars().all()
            for agent in agents:
                for block in blocks:
                    session.add(BlocksAgents(agent_id=agent.id, block_id=block.id, block_label=block.label))

        # Add blocks to manager agent if exists
        if group.manager_agent_id:
            query = select(Agent).where(Agent.id == group.manager_agent_id)
            result = await session.execute(query)
            manager_agent = result.scalar_one_or_none()
            if manager_agent:
                for block in blocks:
                    session.add(BlocksAgents(agent_id=manager_agent.id, block_id=block.id, block_label=block.label))

    @staticmethod
    def ensure_buffer_length_range_valid(
        max_value: Optional[int],
        min_value: Optional[int],
        max_name: str = "max_message_buffer_length",
        min_name: str = "min_message_buffer_length",
    ) -> None:
        """
        1) Both-or-none: if one is set, the other must be set.
        2) Both must be ints > 4.
        3) max_value must be strictly greater than min_value.
        """
        # 1) require both-or-none
        if (max_value is None) != (min_value is None):
            raise ValueError(
                f"Both '{max_name}' and '{min_name}' must be provided together (got {max_name}={max_value}, {min_name}={min_value})"
            )

        # no further checks if neither is provided
        if max_value is None:
            return

        # 2) type & lower‐bound checks
        if not isinstance(max_value, int) or not isinstance(min_value, int):
            raise ValueError(
                f"Both '{max_name}' and '{min_name}' must be integers "
                f"(got {max_name}={type(max_value).__name__}, {min_name}={type(min_value).__name__})"
            )
        if max_value <= 4 or min_value <= 4:
            raise ValueError(
                f"Both '{max_name}' and '{min_name}' must be greater than 4 (got {max_name}={max_value}, {min_name}={min_value})"
            )

        # 3) ordering
        if max_value <= min_value:
            raise ValueError(f"'{max_name}' must be greater than '{min_name}' (got {max_name}={max_value} <= {min_name}={min_value})")
