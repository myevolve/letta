from fastapi.testclient import TestClient
import pytest
from letta.server.rest_api.app import app
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

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    """Clear all related tables before each test."""
    with db_registry.session() as session:
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


def test_signup():
    response = client.post(
        "/api/v1/auth/signup",
        json={"name": "testuser", "email": "test@example.com", "password": "password", "organization_id": "org_123"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data # Make sure password is not returned
