<template>
  <div class="container mt-4">
    <h4 class="mb-3">To-Do List</h4>

    <!--  Add Task --> 
    <div class="input-group mb-4">
      <input
        v-model="newTask"
        type="text"
        class="form-control"
        placeholder="Enter a new task..."
      />
      <button class="btn btn-primary" @click="addTask">Add</button>
    </div>

    <!-- Task Table -->
    <table class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th>Task</th>
          <th>Due Date</th>
          <th>Due In</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.name }}</td>
          <td>{{ formatDate(task.due_date) }}</td>
          <td>
            <span v-if="task.isOverdue()" class="text-danger">Overdue</span>
            <span v-else>{{ task.isDueIn() || "--"}} Days</span>
          </td>
          <td>
            <span :class="['badge', priorityClass(task.priority)]">
              {{ task.priority }}
            </span>
          </td>
          <td>{{ taskStatus(task.status) }}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2" @click="$router.push(`/details/${task.id}`)">
              Details
            </button>
            <button class="btn btn-sm btn-success me-2" @click="completeTask(task.id)">
              Complete
            </button>
            <button class="btn btn-sm btn-danger" @click="removeTask(task.id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
<script setup>
import { ref, onMounted, onActivated } from "vue";
import Task from "../utils/task";
import formatDate from "../utils/format.js";

const newTask = ref("");
const tasks = ref([]);

// Load tasks when the page loads or when returning to it
onMounted(getTasks);
onActivated(getTasks);

function priorityClass(priority) {
  switch (priority?.toLowerCase()) {
    case "high": return "bg-danger";
    case "medium": return "bg-warning text-dark";
    case "low": return "bg-success";
    default: return "bg-secondary";
  }
}

function taskStatus(status) {
  switch (status) {
    case Task.STATUS.TODO: return "To Do";
    case Task.STATUS.IN_PROGRESS: return "In Progress";
    case Task.STATUS.DONE: return "Done";
    default: return "Unknown";
  }
}

// ---- Core methods ----

// Fetch tasks from backend
async function getTasks() {
  try {
    const response = await fetch("http://localhost:8000/task_list");
    const data = await response.json();
    tasks.value = data.map(task => Task.fromJSON(task));
    localStorage.setItem("tasks", JSON.stringify(tasks.value.map(t => t.toJSON())));
  } catch (error) {
    console.error("getTasks error:", error);
  }
}

// Add a new task
async function addTask() {
  const name = newTask.value.trim();
  if (!name) return;

  const newTaskObj = new Task({ name });
  const payload = newTaskObj.toJSON();
  delete payload.id; // let backend assign ID

  try {
    await fetch("http://localhost:8000/task_list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    newTask.value = "";
    await getTasks();
  } catch (err) {
    console.error("addTask POST error:", err);
  }
}

// Delete task by ID
async function removeTask(task_id) {
  try {
    await fetch(`http://localhost:8000/task_list/${task_id}`, { method: "DELETE" });
    await getTasks();
  } catch (err) {
    console.error("removeTask DELETE error:", err);
  }
}

// Mark as complete
async function completeTask(task_id) {
  const t = tasks.value.find(t => t.id === task_id);
  if (!t) return;

  t.setStatus(Task.STATUS.DONE);
  const payload = t.toJSON();
  delete payload.id;

  try {
    // Update the backend in two clear steps, not overlapping
    await fetch(`http://localhost:8000/task_list/${task_id}`, { method: "DELETE" });
    await fetch("http://localhost:8000/task_list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await getTasks();
  } catch (err) {
    console.error("completeTask POST error:", err);
  }
}
</script>
