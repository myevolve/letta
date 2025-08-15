from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from letta.schemas.api_key import ApiKey
from letta.schemas.user import User
from letta.server.rest_api.dependencies import get_current_active_user
from letta.services.api_key_manager import ApiKeyManager

router = APIRouter(prefix="/api-keys", tags=["api-keys"])

class ApiKeyCreate(BaseModel):
    name: str

@router.post("/", response_model=ApiKey)
async def create_api_key(
    api_key_create: ApiKeyCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new API key for the authenticated user.
    """
    api_key_manager = ApiKeyManager()
    api_key = await api_key_manager.create_api_key_async(
        user_id=current_user.id, name=api_key_create.name
    )
    return api_key

@router.get("/", response_model=List[ApiKey])
async def list_api_keys(
    current_user: User = Depends(get_current_active_user),
):
    """
    List all API keys for the authenticated user.
    """
    api_key_manager = ApiKeyManager()
    api_keys = await api_key_manager.list_api_keys_async(user_id=current_user.id)
    return api_keys

@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete an API key.
    """
    api_key_manager = ApiKeyManager()
    await api_key_manager.delete_api_key_async(key_id=key_id, user_id=current_user.id)
    return {"message": "API key deleted successfully"}
