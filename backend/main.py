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

class Todo(BaseModel):
    id: int = None
    name: str = ''
    description: str = ''
    priority = Priority.MEDIUM
    status = Status.TODO
    due_date = None
    created_at = None
    updated_at = None


todo_list: Todo = []


def update_db():
    # Convert todo_list into a json stream and overwrite the file
    json_str = json.dumps(todo_list, indent=4)
    with open("../database/products.json", "w") as db:
        db.write(json_str)


@app.post("/todo_list/")
def create_todo(todo: str):
    todo_list.append(todo)
    update_db()
    return todo


@app.get("/todo_list", response_model=list[Todo])
def list_todos(limit: int = 63):
    if len(todo_list) == 0:
        with open("../database/products.json", "r") as db:
            todo_list = json.load(db)

    return todo_list[0:limit]


@app.get("/todo_list/{todo_id}", response_model=Todo)
def get_todo(todo_id: int) -> Todo:
    if todo_id < len(todo_list):
        return todo_list[todo_id]
    else:
        raise HTTPException(status_code=404, detail=f"Todo item {todo_id} not found")
