from fastapi.testclient import TestClient
import pytest
import uuid
from datetime import datetime
from letta.server.rest_api.app import create_application
from letta.orm.api_key import ApiKey
from letta.orm.user import User
from letta.orm.organization import Organization
from letta.orm.tool import Tool
from letta.orm.block import Block
from letta.orm.sandbox_config import SandboxConfig, SandboxEnvironmentVariable, AgentEnvironmentVariable
from letta.orm.agent import Agent
from letta.orm.source import Source
from letta.orm.message import Message
from letta.orm.passage import SourcePassage, ArchivalPassage
from letta.orm.archive import Archive
from letta.orm.provider import Provider
from letta.orm.identity import Identity
from letta.orm.group import Group
from letta.orm.llm_batch_job import LLMBatchJob
from letta.orm.llm_batch_items import LLMBatchItem
from sqlalchemy import delete
from letta.server.db import db_registry
from letta.constants import DEFAULT_ORG_ID, DEFAULT_ORG_NAME

@pytest.fixture(scope="module")
def client():
    app = create_application()
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def setup_and_teardown():
    """Clear all related tables before each test."""
    with db_registry.session() as session:
        session.execute(delete(ApiKey))
        session.execute(delete(User))
        session.execute(delete(Tool))
        session.execute(delete(Block))
        session.execute(delete(SandboxConfig))
        session.execute(delete(SandboxEnvironmentVariable))
        session.execute(delete(AgentEnvironmentVariable))
        session.execute(delete(Agent))
        session.execute(delete(Source))
        session.execute(delete(Message))
        session.execute(delete(SourcePassage))
        session.execute(delete(ArchivalPassage))
        session.execute(delete(Archive))
        session.execute(delete(Provider))
        session.execute(delete(Identity))
        session.execute(delete(Group))
        session.execute(delete(LLMBatchJob))
        session.execute(delete(LLMBatchItem))
        session.execute(delete(Organization))
        session.commit()
        # Create a default organization
        default_org = Organization(id=DEFAULT_ORG_ID, name=DEFAULT_ORG_NAME, privileged_tools=False)
        session.add(default_org)
        session.commit()

    yield

    with db_registry.session() as session:
        session.execute(delete(ApiKey))
        session.execute(delete(User))
        session.execute(delete(Tool))
        session.execute(delete(Block))
        session.execute(delete(SandboxConfig))
        session.execute(delete(SandboxEnvironmentVariable))
        session.execute(delete(AgentEnvironmentVariable))
        session.execute(delete(Agent))
        session.execute(delete(Source))
        session.execute(delete(Message))
        session.execute(delete(SourcePassage))
        session.execute(delete(ArchivalPassage))
        session.execute(delete(Archive))
        session.execute(delete(Provider))
        session.execute(delete(Identity))
        session.execute(delete(Group))
        session.execute(delete(LLMBatchJob))
        session.execute(delete(LLMBatchItem))
        session.execute(delete(Organization))
        session.commit()


def test_signup(client):
    response = client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": DEFAULT_ORG_ID},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert "user" in data
    assert data["user"]["email"] == "test@example.com"
    assert "id" in data["user"]
    assert "password" not in data["user"]

def test_signup_existing_email(client):
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": DEFAULT_ORG_ID},
    )
    response = client.post(
        "/v1/auth/signup",
        json={"name": "testuser2", "email": "test@example.com", "password": "password2", "organization_id": DEFAULT_ORG_ID},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login(client):
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": DEFAULT_ORG_ID},
    )
    response = client.post(
        "/v1/auth/login/token",
        data={"username": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == "test@example.com"

def test_login_incorrect_password(client):
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": DEFAULT_ORG_ID},
    )
    response = client.post(
        "/v1/auth/login/token",
        data={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_login_non_existent_email(client):
    response = client.post(
        "/v1/auth/login/token",
        data={"username": "test@example.com", "password": "password"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_admin_endpoint_no_token(client):
    response = client.get("/v1/admin/users/")
    assert response.status_code == 401

def test_admin_endpoint_non_admin_token(client):
    signup_response = client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": DEFAULT_ORG_ID},
    )
    token = signup_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/v1/admin/users/", headers=headers)
    assert response.status_code == 403

def test_admin_endpoint_admin_token(client):
    # Create an admin user directly in the database for this test
    with db_registry.session() as session:
        from letta.server.rest_api.auth_utils.password import get_password_hash
        from letta.schemas.user import User as PydanticUser
        now = datetime.utcnow()
        admin_user = User(id=PydanticUser.generate_id(), name="admin", email="admin@example.com", password=get_password_hash("adminpassword"), role="Admin", organization_id=DEFAULT_ORG_ID, created_at=now, updated_at=now)
        session.add(admin_user)
        session.commit()

    login_response = client.post(
        "/v1/auth/login/token",
        data={"username": "admin@example.com", "password": "adminpassword"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/v1/admin/users/", headers=headers)
    assert response.status_code == 200


def test_forgot_password(client):
    # First, create a user to request a password reset for
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": DEFAULT_ORG_ID},
    )

    # Request a password reset
    response = client.post(
        "/v1/auth/forgot-password",
        json={"email": "test@example.com"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "reset_token_dev" in data
    assert data["message"] == "If an account with that email exists, a password reset link has been sent."

def test_reset_password(client):
    # Create user
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": DEFAULT_ORG_ID},
    )

    # Get reset token
    forgot_response = client.post("/v1/auth/forgot-password", json={"email": "test@example.com"})
    reset_token = forgot_response.json()["reset_token_dev"]

    # Reset the password
    reset_response = client.post(
        "/v1/auth/reset-password",
        json={"token": reset_token, "new_password": "newpassword123"},
    )
    assert reset_response.status_code == 200
    assert reset_response.json()["message"] == "Password has been reset successfully."

    # Try to log in with the new password
    login_response_new = client.post(
        "/v1/auth/login/token",
        data={"username": "test@example.com", "password": "newpassword123"},
    )
    assert login_response_new.status_code == 200

    # Try to log in with the old password (should fail)
    login_response_old = client.post(
        "/v1/auth/login/token",
        data={"username": "test@example.com", "password": "password"},
    )
    assert login_response_old.status_code == 401
