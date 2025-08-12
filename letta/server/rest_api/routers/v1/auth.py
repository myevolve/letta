from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from letta.schemas.user import UserCreate, User, UserOut
from letta.services.user_manager import UserManager
from letta.services.api_key_manager import ApiKeyManager
from letta.server.rest_api.auth_utils.password import get_password_hash, verify_password
from letta.server.rest_api.auth_utils.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserOut)
async def signup(
    user_create: UserCreate,
):
    """
    Create a new user.
    """
    user_manager = UserManager()
    db_user = await user_manager.get_actor_by_email_async(email=user_create.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_create.password)
    user_in = User(
        name=user_create.name,
        email=user_create.email,
        password=hashed_password,
        organization_id=user_create.organization_id,
    )

    user = await user_manager.create_actor_async(user_in)
    return user

@router.post("/login/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_manager = UserManager()
    user = await user_manager.get_actor_by_email_async(email=form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    api_key_manager = ApiKeyManager()
    api_keys = await api_key_manager.list_api_keys_async(user_id=user.id)
    if not api_keys:
        await api_key_manager.create_api_key_async(user_id=user.id, name="default")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "name": user.name}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
