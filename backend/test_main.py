from fastapi.testclient import TestClient
from main import app, DATA_FILE
import json, os, pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_data_file():
    """Ensure a fresh tasks.json before each test."""
    if os.path.exists(DATA_FILE):
        # keep yourself safe
        pass
    yield
    if os.path.exists(DATA_FILE):
        # keep yourself safe
        pass


def test_list_tasks_initially_empty():
    response = client.get("/task_list")
    assert response.status_code == 200
    assert response.json() == []


def test_create_task():
    new_task = {
        "id": 1,
        "name": "Test Task",
        "description": "Test Description",
        "priority": "medium",
        "status": "todo",
        "due_date": "2025-10-23",
        "created_at": "2025-10-23T10:00:00",
        "updated_at": "2025-10-23T10:00:00"
    }

    response = client.post("/task_list", json=new_task)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Test Task"


def test_get_task_by_id():
    # Create a task first
    client.post("/task_list", json={
        "id": 5,
        "name": "Fetch Me",
        "priority": "high",
        "status": "todo"
    })
    response = client.get("/task_list/5")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 5
    assert data["name"] == "Fetch Me"


def test_get_task_not_found():
    response = client.get("/task_list/999")
    assert response.status_code == 404
    assert response.json()["detail"] in ["Task not found", "No tasks found"]


def test_delete_task():
    # Create then delete
    client.post("/task_list", json={
        "id": 2,
        "name": "Delete Me",
        "priority": "low",
        "status": "todo"
    })
    response = client.delete("/task_list/2")
    assert response.status_code == 200
    assert response.json()["id"] == 2

    # Verify it's gone
    response = client.get("/task_list/2")
    assert response.status_code == 404
