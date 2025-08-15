from letta.schemas.letta_base import LettaBase

class ApiKeyBase(LettaBase):
    __id_prefix__ = "key"

class ApiKey(ApiKeyBase):
    id: str = ApiKeyBase.generate_id_field()
    key: str
    name: str
    user_id: str
