from datetime import datetime
from typing import Optional

from pydantic import Field

from letta.constants import DEFAULT_ORG_ID
from letta.schemas.letta_base import LettaBase


class UserBase(LettaBase):
    __id_prefix__ = "user"


class User(UserBase):
    """
    Representation of a user.

    Parameters:
        id (str): The unique identifier of the user.
        name (str): The name of the user.
        created_at (datetime): The creation date of the user.
    """

    id: str = UserBase.generate_id_field()
    organization_id: Optional[str] = Field(DEFAULT_ORG_ID, description="The organization id of the user")
    name: str = Field(..., description="The name of the user.")
    email: str = Field(..., description="The email of the user.")
    password: str = Field(..., description="The hashed password of the user.")
    role: str = Field("User", description="The role of the user.")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="The creation date of the user.")
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="The update date of the user.")
    is_deleted: bool = Field(False, description="Whether this user is deleted or not.")


class UserOut(UserBase):
    id: str
    name: str
    email: str
    role: str
    organization_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        orm_mode = True


class UserCreate(UserBase):
    name: str = Field(..., description="The name of the user.")
    email: str = Field(..., description="The email of the user.")
    password: str = Field(..., description="The password of the user.")
    organization_id: str = Field(..., description="The organization id of the user.")


class UserUpdate(UserBase):
    id: str = Field(..., description="The id of the user to update.")
    name: Optional[str] = Field(None, description="The new name of the user.")
    email: Optional[str] = Field(None, description="The new email of the user.")
    role: Optional[str] = Field(None, description="The new role of the user.")
    organization_id: Optional[str] = Field(None, description="The new organization id of the user.")


class ForgotPasswordRequest(LettaBase):
    email: str = Field(..., description="The email of the user who forgot their password.")


class ResetPasswordRequest(LettaBase):
    token: str = Field(..., description="The password reset token.")
    new_password: str = Field(..., description="The new password.")
