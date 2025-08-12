import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from letta.orm.sqlalchemy_base import SqlalchemyBase
from letta.schemas.api_key import ApiKey as PydanticApiKey

if TYPE_CHECKING:
    from letta.orm.user import User


class ApiKey(SqlalchemyBase):
    """API Key ORM class"""

    __tablename__ = "api_keys"
    __pydantic_model__ = PydanticApiKey

    key: Mapped[str] = mapped_column(String, unique=True, nullable=False, default=lambda: f"sk-{uuid.uuid4().hex}")
    name: Mapped[str] = mapped_column(String, nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="api_keys")
