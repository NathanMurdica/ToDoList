from fastapi.testclient import TestClient
from main import app, DATA_FILE, BACKUP_FILE
import os, pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_data_file():
    """Ensure a fresh tasks.json before each test."""
    if os.path.exists(DATA_FILE):
        # Construct the copy command based on the operating system
        if os.name == 'posix':  # Unix-like systems (Linux, macOS)
            command = f"cp {source_file} {destination_file}"
        elif os.name == 'nt':  # Windows
            command = f"copy {DATA_FILE} {BACKUP_FILE}"
        else:
            print("Unsupported operating system for direct shell command copying.")
            exit()

        # Execute the command
        os.system(command)
        os.remove(DATA_FILE)
    yield
    if os.path.exists(DATA_FILE):
        os.remove(DATA_FILE)


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
    assert data["id"] >= 0 # ID should be assigned by backend
    assert data["name"] == "Test Task"


def test_get_task_by_id():
    # Create a task first
    client.post("/task_list", json={
        "id": 5,
        "name": "Fetch Me",
        "description": "To fetch or not to fetch, that is the question",
        "priority": "high",
        "status": "todo",
        "due_date": "2025-10-23",
        "created_at": "2025-10-23T10:00:00",
        "updated_at": "2025-10-23T10:00:00"
    })
    # Get the task ID from the previous response
    task_list = client.get("/task_list").json()
    task_id = next((t["id"] for t in task_list if t.get("name") == "Fetch Me"), None)
    assert task_id is not None, "Task 'Fetch Me' not found in task list"
    response = client.get(f"/task_list/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
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
    # Get the task ID from the previous response
    task_list = client.get("/task_list").json()
    # Find task with name "Delete Me"
    task_id = next((t["id"] for t in task_list if t.get("name") == "Delete Me"), None)
    assert task_id is not None, "Task 'Delete Me' not found in task list"
    response = client.delete(f"/task_list/{task_id}")
    assert response.status_code == 200
    assert response.json()["id"] == task_id

    # Verify it's gone
    response = client.get(f"/task_list/{task_id}")
    assert response.status_code == 404
