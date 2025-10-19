import Task from "../utils/task";

export const testTasks = [
    new Task({
        id: 1, name: "Task 1", description: "Description for Task 1",
        priority: Task.PRIORITY.HIGH,
        status: Task.STATUS.TODO,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    }),
    new Task({
        id: 2, name: "Task 2", description: "Description for Task 2",
        priority: Task.PRIORITY.MEDIUM,
        status: Task.STATUS.IN_PROGRESS,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    }),
]