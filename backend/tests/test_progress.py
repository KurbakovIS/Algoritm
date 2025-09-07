import pytest
from fastapi.testclient import TestClient
from app.models import RoadmapNode, Progress
import json

def test_update_progress_new(client, auth_headers, test_user, db_session):
    """Test updating progress for a new node."""
    # Create a test node
    node = RoadmapNode(
        direction="frontend",
        title="HTML Basics",
        description="Learn HTML",
        resources=json.dumps([]),
        checkpoint=True
    )
    db_session.add(node)
    db_session.commit()
    db_session.refresh(node)
    
    response = client.post("/progress/update", 
        headers=auth_headers,
        json={
            "node_id": node.id,
            "status": "completed",
            "score": 85
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == test_user.id
    assert data["node_id"] == node.id
    assert data["status"] == "completed"
    assert data["score"] == 85
    
    # Check progress was created in database
    progress = db_session.query(Progress).filter(
        Progress.user_id == test_user.id,
        Progress.node_id == node.id
    ).first()
    assert progress is not None
    assert progress.status == "completed"
    assert progress.score == 85

def test_update_progress_existing(client, auth_headers, test_user, db_session):
    """Test updating existing progress."""
    # Create a test node
    node = RoadmapNode(
        direction="frontend",
        title="HTML Basics",
        description="Learn HTML",
        resources=json.dumps([]),
        checkpoint=False
    )
    db_session.add(node)
    db_session.commit()
    db_session.refresh(node)
    
    # Create initial progress
    progress = Progress(
        user_id=test_user.id,
        node_id=node.id,
        status="in_progress",
        score=50
    )
    db_session.add(progress)
    db_session.commit()
    
    # Update progress
    response = client.post("/progress/update",
        headers=auth_headers,
        json={
            "node_id": node.id,
            "status": "completed",
            "score": 90
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["score"] == 90

def test_update_progress_nonexistent_node(client, auth_headers):
    """Test updating progress for nonexistent node fails."""
    response = client.post("/progress/update",
        headers=auth_headers,
        json={
            "node_id": 999,
            "status": "completed",
            "score": 85
        }
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_update_progress_unauthorized(client, db_session):
    """Test updating progress without authentication fails."""
    # Create a test node
    node = RoadmapNode(
        direction="frontend",
        title="HTML Basics",
        description="Learn HTML",
        resources=json.dumps([]),
        checkpoint=False
    )
    db_session.add(node)
    db_session.commit()
    db_session.refresh(node)
    
    response = client.post("/progress/update",
        json={
            "node_id": node.id,
            "status": "completed",
            "score": 85
        }
    )
    
    assert response.status_code == 401

def test_get_my_progress(client, auth_headers, test_user, db_session):
    """Test getting user's progress."""
    # Create test nodes
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
        checkpoint=True
    )
    
    db_session.add(node1)
    db_session.add(node2)
    db_session.commit()
    db_session.refresh(node1)
    db_session.refresh(node2)
    
    # Create progress records
    progress1 = Progress(
        user_id=test_user.id,
        node_id=node1.id,
        status="completed",
        score=85
    )
    progress2 = Progress(
        user_id=test_user.id,
        node_id=node2.id,
        status="in_progress",
        score=0
    )
    
    db_session.add(progress1)
    db_session.add(progress2)
    db_session.commit()
    
    response = client.get("/progress/mine", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Check progress structure
    progress = data[0]
    assert "user_id" in progress
    assert "node_id" in progress
    assert "status" in progress
    assert "score" in progress

def test_get_my_progress_unauthorized(client):
    """Test getting progress without authentication fails."""
    response = client.get("/progress/mine")
    
    assert response.status_code == 401
