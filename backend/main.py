from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json, os
from threading import Lock

# Run with: uvicorn backend.main:app --reload
app = FastAPI()
file_lock = Lock()

# Allow CORS from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Models =====
class Task(BaseModel):
    id: int | None = None
    name: str = ''
    description: str = ''
    priority: str = ''
    status: str = ''
    due_date: str = ''
    created_at: str = ''
    updated_at: str = ''

# ===== File setup =====
DATA_FILE = os.path.join(os.path.dirname(__file__), "tasks.json")
BACKUP_FILE = os.path.join(os.path.dirname(__file__), "tasks_copy.json")

# ===== Helper functions =====
def read_tasks() -> List[dict]:
    """Read tasks safely from JSON file."""
    with file_lock:
        if not os.path.exists(DATA_FILE):
            # if missing, restore from backup if available
            if os.path.exists(BACKUP_FILE):
                os.system(f"cp {BACKUP_FILE} {DATA_FILE}" if os.name != "nt" else f"copy {BACKUP_FILE} {DATA_FILE}")
            else:
                return []
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []

def save_tasks(tasks: List[dict]):
    """Write tasks safely to file."""
    with file_lock:
        with open(DATA_FILE, "w") as f:
            json.dump(tasks, f, indent=4)

# ===== Routes =====
@app.get("/task_list", response_model=List[Task])
def list_tasks():
    """Return all tasks."""
    return read_tasks()

@app.post("/task_list", response_model=Task)
def create_task(task: Task):
    """Add a new task."""
    tasks = read_tasks()
    task.id = max((t["id"] for t in tasks), default=-1) + 1
    tasks.append(task.model_dump())
    save_tasks(tasks)
    return task

@app.get("/task_list/{task_id}", response_model=Task)
def get_task(task_id: int):
    """Return a specific task by ID."""
    tasks = read_tasks()
    for t in tasks:
        if t["id"] == task_id:
            return t
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/task_list/{task_id}", response_model=Task)
def delete_task(task_id: int):
    """Delete a specific task by ID."""
    tasks = read_tasks()
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            deleted = tasks.pop(i)
            save_tasks(tasks)
            return deleted
    raise HTTPException(status_code=404, detail="Task not found")
