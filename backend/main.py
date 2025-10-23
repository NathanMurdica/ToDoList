from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum
from typing import List
import json, os


# Run with: uvicorn backend.main:app --reload
app = FastAPI()

# Allow CORS from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# class Priority(Enum):
#     LOW = 'low'
#     MEDIUM = 'medium'
#     HIGH = 'high'

# class Status(Enum):
#     TODO = 'todo'
#     IN_PROGRESS = 'in_progress'
#     DONE = 'done'

class Task(BaseModel):
    id: int = None
    name: str = ''
    description: str = ''
    priority: str = ''
    status: str = ''
    due_date: str = ''
    created_at: str = ''
    updated_at: str = ''

DATA_FILE = os.path.join(os.path.dirname(__file__), "tasks.json")

def save_tasks(tasks: List[Task]):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=4)

# --------- ROUTES ---------
@app.post("/task_list", response_model=Task)
def create_task(task: Task):
    """Add a new task."""
    tasks = list_tasks()
    # Ensure unique ID
    if any(t["id"] == task.id for t in tasks):
        raise HTTPException(status_code=400, detail="Task ID already exists")
    tasks.append(task.dict())
    save_tasks(tasks)
    return task

# get full task list
@app.get("/task_list", response_model=list[Task])
def list_tasks():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

# get specific task by id
@app.get("/task_list/{task_id}", response_model=Task)
def get_task(task_id: int):
    """Return a specific task by ID."""
    tasks = list_tasks()
    if (len(tasks) > 0):
        for t in tasks:
            if t["id"] == task_id:
                return t
        raise HTTPException(status_code=404, detail="Task not found")
    else:
        raise HTTPException(status_code=404, detail="No tasks found")

@app.delete("/task_list/{task_id}", response_model=Task)
def delete_task(task_id: int):
    """Delete a task by ID."""
    tasks = list_tasks()
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            deleted = tasks.pop(i)
            save_tasks(tasks)
            return deleted
    raise HTTPException(status_code=404, detail="Task not found")
