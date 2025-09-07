import pytest
from fastapi.testclient import TestClient
from app.models import RoadmapNode
import json

def test_get_all_roadmap_nodes(client, db_session):
    """Test getting all roadmap nodes."""
    # Create test nodes
    node1 = RoadmapNode(
        direction="frontend",
        title="HTML Basics",
        description="Learn HTML fundamentals",
        resources=json.dumps(["https://example.com"]),
        checkpoint=True
    )
    node2 = RoadmapNode(
        direction="backend",
        title="Python Basics",
        description="Learn Python fundamentals",
        resources=json.dumps(["https://python.org"]),
        checkpoint=False
    )
    
    db_session.add(node1)
    db_session.add(node2)
    db_session.commit()
    
    response = client.get("/roadmap/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Check node structure
    node = data[0]
    assert "id" in node
    assert "title" in node
    assert "description" in node
    assert "direction" in node
    assert "resources" in node
    assert "checkpoint" in node

def test_get_roadmap_directions(client, db_session):
    """Test getting all roadmap directions."""
    # Create test nodes with different directions
    node1 = RoadmapNode(
        direction="frontend",
        title="HTML Basics",
        description="Learn HTML",
        resources=json.dumps([]),
        checkpoint=False
    )
    node2 = RoadmapNode(
        direction="backend",
        title="Python Basics",
        description="Learn Python",
        resources=json.dumps([]),
        checkpoint=False
    )
    
    db_session.add(node1)
    db_session.add(node2)
    db_session.commit()
    
    response = client.get("/roadmap/directions")
    
    assert response.status_code == 200
    data = response.json()
    assert "frontend" in data
    assert "backend" in data

def test_get_nodes_by_direction(client, db_session):
    """Test getting nodes by specific direction."""
    # Create test nodes
    frontend_node = RoadmapNode(
        direction="frontend",
        title="HTML Basics",
        description="Learn HTML",
        resources=json.dumps([]),
        checkpoint=False
    )
    backend_node = RoadmapNode(
        direction="backend",
        title="Python Basics",
        description="Learn Python",
        resources=json.dumps([]),
        checkpoint=False
    )
    
    db_session.add(frontend_node)
    db_session.add(backend_node)
    db_session.commit()
    
    response = client.get("/roadmap/directions/frontend")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["direction"] == "frontend"
    assert data[0]["title"] == "HTML Basics"

def test_get_specific_node(client, db_session):
    """Test getting a specific node by ID."""
    node = RoadmapNode(
        direction="frontend",
        title="HTML Basics",
        description="Learn HTML fundamentals",
        resources=json.dumps(["https://example.com"]),
        checkpoint=True
    )
    
    db_session.add(node)
    db_session.commit()
    db_session.refresh(node)
    
    response = client.get(f"/roadmap/node/{node.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == node.id
    assert data["title"] == "HTML Basics"
    assert data["direction"] == "frontend"
    assert data["checkpoint"] is True
    assert "https://example.com" in data["resources"]

def test_get_nonexistent_node(client):
    """Test getting nonexistent node returns 404."""
    response = client.get("/roadmap/node/999")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
