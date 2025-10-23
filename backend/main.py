from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
import json

app = FastAPI()

class Priority(Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'

class Status(Enum):
    TODO = 'todo'
    IN_PROGRESS = 'in_progress'
    DONE = 'done'

class Task(BaseModel):
    id: int = None
    name: str = ''
    description: str = ''
    priority: Priority = Priority.MEDIUM
    status: Status = Status.TODO
    due_date: str = None
    created_at: str = None
    updated_at: str = None


task_list: list[Task] = []


def update_db():
    # Convert task_list into a json stream and overwrite the file
    json_str = json.dumps(task_list, indent=4)
    with open("../database/tasks.json", "w") as db:
        db.write(json_str)


@app.post("/task_list", response_model=Task)
def create_task(task: str):
    task_list.append(task)
    update_db()

    return task


@app.get("/task_list", response_model=list[Task])
def list_tasks(limit: int = 63):
    if len(task_list) == 0:
        with open("../database/tasks.json", "r") as db:
            task_list = json.load(db)

    return task_list[0:limit]


@app.get("/task_list/{task_id}", response_model=Task)
def get_task(task_id: int) -> Task:
    if task_id < len(task_list):
        return task_list[task_id]
    else:
        raise HTTPException(status_code=404, detail=f"Task item {task_id} not found")


@app.delete("/task_list/{task_id}", response_model=Task)
def delete_task(task_id: int):
    if task_id < len(task_list):
        task_list.remove(get_task(task_id=task_id))
        update_db()
