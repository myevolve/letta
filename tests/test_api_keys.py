from fastapi.testclient import TestClient
import pytest
from letta.server.rest_api.app import create_application
from letta.orm.user import User
from letta.orm.organization import Organization
from letta.orm.api_key import ApiKey
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

def get_auth_headers(client, email, password):
    client.post(
        "/v1/auth/signup",
        json={"name": "testuser", "email": email, "password": password, "organization_id": "org_123"},
    )
    response = client.post(
        "/v1/auth/login/token",
        data={"username": email, "password": password},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_api_key(client):
    headers = get_auth_headers(client, "test@example.com", "password")
    response = client.post(
        "/v1/api-keys/",
        json={"name": "test-key"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test-key"
    assert "key" in data

def test_list_api_keys(client):
    headers = get_auth_headers(client, "test@example.com", "password")
    client.post("/v1/api-keys/", json={"name": "test-key-1"}, headers=headers)
    client.post("/v1/api-keys/", json={"name": "test-key-2"}, headers=headers)

    response = client.get("/v1/api-keys/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3 # 1 default + 2 created
    assert data[0]["name"] == "default"
    assert data[1]["name"] == "test-key-1"
    assert data[2]["name"] == "test-key-2"

def test_delete_api_key(client):
    headers = get_auth_headers(client, "test@example.com", "password")
    create_response = client.post("/v1/api-keys/", json={"name": "test-key"}, headers=headers)
    key_id = create_response.json()["id"]

    delete_response = client.delete(f"/v1/api-keys/{key_id}", headers=headers)
    assert delete_response.status_code == 200

    list_response = client.get("/v1/api-keys/", headers=headers)
    assert len(list_response.json()) == 1
