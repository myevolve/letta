from fastapi.testclient import TestClient
import pytest
import uuid
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
        default_org = Organization(id="org_123", name="Default Org", privileged_tools=False)
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
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": "org_123"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data

def test_signup_existing_email(client):
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": "org_123"},
    )
    response = client.post(
        "/v1/auth/signup",
        json={"name": "testuser2", "email": "test@example.com", "password": "password2", "organization_id": "org_123"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login(client):
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": "org_123"},
    )
    response = client.post(
        "/v1/auth/login/token",
        data={"username": "test@example.com", "password": "password"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_incorrect_password(client):
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": "org_123"},
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
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": "org_123"},
    )
    login_response = client.post(
        "/v1/auth/login/token",
        data={"username": "test@example.com", "password": "password"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/v1/admin/users/", headers=headers)
    assert response.status_code == 403

def test_admin_endpoint_admin_token(client):
    # Create an admin user directly in the database for this test
    with db_registry.session() as session:
        from letta.server.rest_api.auth_utils.password import get_password_hash
        from letta.schemas.user import User as PydanticUser
        admin_user = User(id=PydanticUser.generate_id(), name="admin", email="admin@example.com", password=get_password_hash("adminpassword"), role="Admin", organization_id="org_123")
        session.add(admin_user)
        session.commit()

    login_response = client.post(
        "/v1/auth/login/token",
        data={"username": "admin@example.com", "password": "adminpassword"},
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/v1/admin/users/", headers=headers)
    assert response.status_code == 200
