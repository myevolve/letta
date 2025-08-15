from typing import List, Optional
from uuid import uuid4

from sqlalchemy import select

from letta.orm.api_key import ApiKey as ApiKeyModel
from letta.schemas.api_key import ApiKey as PydanticApiKey
from letta.server.db import db_registry


class ApiKeyManager:
    @staticmethod
    async def create_api_key_async(user_id: str, name: str) -> PydanticApiKey:
        async with db_registry.async_session() as session:
            new_key = ApiKeyModel(id=PydanticApiKey.generate_id(), user_id=user_id, name=name)
            await new_key.create_async(session)
            return new_key.to_pydantic()

    @staticmethod
    async def list_api_keys_async(user_id: str) -> List[PydanticApiKey]:
        async with db_registry.async_session() as session:
            stmt = select(ApiKeyModel).where(ApiKeyModel.user_id == user_id)
            result = await session.execute(stmt)
            keys = result.scalars().all()
            return [key.to_pydantic() for key in keys]

    @staticmethod
    async def delete_api_key_async(key_id: str, user_id: str) -> None:
        async with db_registry.async_session() as session:
            stmt = select(ApiKeyModel).where(ApiKeyModel.id == key_id, ApiKeyModel.user_id == user_id)
            result = await session.execute(stmt)
            key = result.scalar_one_or_none()
            if key:
                await key.hard_delete_async(session)
