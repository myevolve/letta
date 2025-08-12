from typing import TYPE_CHECKING, List

from sqlalchemy.orm import Mapped, mapped_column, relationship

from letta.orm.mixins import OrganizationMixin
from letta.orm.sqlalchemy_base import SqlalchemyBase
from letta.schemas.user import User as PydanticUser

if TYPE_CHECKING:
    from letta.orm import Job, Organization
    from letta.orm.api_key import ApiKey


class User(SqlalchemyBase, OrganizationMixin):
    """User ORM class"""

    __tablename__ = "users"
    __pydantic_model__ = PydanticUser

    name: Mapped[str] = mapped_column(nullable=False, doc="The display name of the user.")
    email: Mapped[str] = mapped_column(nullable=False, unique=True, doc="The email of the user.", server_default='')
    password: Mapped[str] = mapped_column(nullable=False, doc="The hashed password of the user.", server_default='')
    role: Mapped[str] = mapped_column(nullable=False, doc="The role of the user.", server_default='User')

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")
    jobs: Mapped[List["Job"]] = relationship(
        "Job", back_populates="user", doc="the jobs associated with this user.", cascade="all, delete-orphan"
    )

    api_keys: Mapped[List["ApiKey"]] = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")
