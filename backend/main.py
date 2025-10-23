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

source_file = os.path.join(os.path.dirname(__file__), "tasks.json")
destination_file = os.path.join(os.path.dirname(__file__), "tasks_copy.json")

def save_tasks(tasks: List[Task]):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=4)

# --------- ROUTES ---------
@app.post("/task_list", response_model=Task)
def create_task(task: Task):
    tasks = list_tasks()
    task.id = max((t["id"] for t in tasks), default=-1) + 1
    tasks.append(task.model_dump())
    save_tasks(tasks)
    return task


# get full task list
@app.get("/task_list", response_model=list[Task])
def list_tasks():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Construct the copy command based on the operating system
        if os.name == 'posix':  # Unix-like systems (Linux, macOS)
            command = f"cp {destination_file} {source_file}"
        elif os.name == 'nt':  # Windows
            command = f"copy {destination_file} {source_file}"
        else:
            print("Unsupported operating system for direct shell command copying.")
            exit()

        # Execute the command
        os.system(command)

        return []

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
