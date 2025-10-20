from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
# from fastapi.middleware.cors import CORSMiddleware

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


todo_list = []


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )



@app.post("/todo_list/")
def create_todo(todo: str):
    todo_list.append(todo)
    return todo


@app.get("/todo_list", response_model=list[Todo])
def list_todos(limit: int = 63):
    return todo_list[0:limit]


@app.get("/todo_list/{todo_id}", response_model=Todo)
def get_todo(todo_id: int) -> Todo:
    if todo_id < len(todo_list):
        return todo_list[todo_id]
    else:
        raise HTTPException(status_code=404, detail=f"Todo item {todo_id} not found")
