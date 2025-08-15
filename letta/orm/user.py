from typing import TYPE_CHECKING, List

from sqlalchemy.orm import Mapped, mapped_column, relationship

from letta.orm.mixins import OrganizationMixin
from letta.orm.sqlalchemy_base import SqlalchemyBase
from letta.schemas.user import User as PydanticUser

if TYPE_CHECKING:
    from letta.orm import Job, Organization


class User(SqlalchemyBase, OrganizationMixin):
    """User ORM class"""

    __tablename__ = "users"
    __pydantic_model__ = PydanticUser

    name: Mapped[str] = mapped_column(nullable=False, doc="The display name of the user.")
    email: Mapped[str] = mapped_column(nullable=False, unique=True, doc="The email of the user.")
    hashed_password: Mapped[str] = mapped_column(nullable=False, doc="The hashed password of the user.")
    role: Mapped[str] = mapped_column(nullable=False, default="User", doc="The role of the user (e.g., 'Admin', 'User').")

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="users")
    jobs: Mapped[List["Job"]] = relationship(
        "Job", back_populates="user", doc="the jobs associated with this user.", cascade="all, delete-orphan"
    )

    # TODO: Add this back later potentially
    # tokens: Mapped[List["Token"]] = relationship("Token", back_populates="user", doc="the tokens associated with this user.")
