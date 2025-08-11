from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from letta.server.rest_api.utils import get_session
from letta.schemas.user import UserCreate, User
from letta.services.user_manager import UserManager
from letta.server.rest_api.utils.password import get_password_hash

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=User)
async def signup(
    user_create: UserCreate,
    db: Session = Depends(get_session),
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
