from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from letta.schemas.user import UserCreate, User, UserOut, ForgotPasswordRequest, ResetPasswordRequest
from letta.services.user_manager import UserManager
from letta.services.api_key_manager import ApiKeyManager
from letta.server.rest_api.auth_utils.password import get_password_hash, verify_password
from letta.server.rest_api.auth_utils.jwt import create_access_token, decode_reset_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=dict)
async def signup(
    user_create: UserCreate,
):
    """
    Create a new user and return an access token.
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
        role="User", # Default role
    )

    user = await user_manager.create_actor_async(user_in)

    # Create a default API key for the new user
    api_key_manager = ApiKeyManager()
    await api_key_manager.create_api_key_async(user_id=user.id, name="default")

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "name": user.name, "id": user.id},
        expires_delta=access_token_expires
    )

    # Manually create the UserOut object for the response
    user_out = UserOut.from_orm(user)

    return {"access_token": access_token, "token_type": "bearer", "user": user_out.dict()}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Send a password reset email to the user.
    In dev, we'll just return the token.
    """
    user_manager = UserManager()
    user = await user_manager.get_actor_by_email_async(email=request.email)
    if not user:
        # Don't reveal that the user doesn't exist
        return {"message": "If an account with that email exists, a password reset link has been sent."}

    # Generate a short-lived token for password reset
    reset_token_expires = timedelta(minutes=15) # 15 minute expiry
    reset_token = create_access_token(
        data={"sub": user.email, "scope": "password_reset"},
        expires_delta=reset_token_expires,
    )

    reset_link = f"http://localhost:3000/reset-password/{reset_token}"
    print(f"Password Reset Link (for dev): {reset_link}")

    return {
        "message": "If an account with that email exists, a password reset link has been sent.",
        "reset_token_dev": reset_token # For easier testing in dev
    }

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest):
    """
    Reset the user's password using a valid token.
    """
    email = decode_reset_token(request.token)

    user_manager = UserManager()
    user = await user_manager.get_actor_by_email_async(email=email)
    if not user:
        # This case should ideally not be reached if token is valid
        # but as a safeguard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    hashed_password = get_password_hash(request.new_password)
    await user_manager.update_user_password_async(user_id=user.id, new_password=hashed_password)

    return {"message": "Password has been reset successfully."}


@router.post("/login/token", response_model=dict)
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
        data={"sub": user.email, "role": user.role, "name": user.name, "id": user.id},
        expires_delta=access_token_expires
    )

    # Manually create the UserOut object for the response
    user_out = UserOut.from_orm(user)

    return {"access_token": access_token, "token_type": "bearer", "user": user_out.dict()}
