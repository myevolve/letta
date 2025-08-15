from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# from letta.server.rest_api.utils import get_session # This is not used
from letta.services.user_manager import UserManager
from letta.server.rest_api.auth_utils.jwt import verify_token, TokenData
from letta.schemas.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login/token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    user_manager = UserManager()
    user = await user_manager.get_actor_by_email_async(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    # In the future, we could add a check here to see if the user is active.
    # For now, we'll just return the user.
    return current_user
