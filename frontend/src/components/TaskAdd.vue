<template>
  <div class="container py-5">
    <h2 class="text-center mb-4">Add New Task</h2>

    <div class="card p-4 shadow-sm">
      <form @submit.prevent="onSubmit" class="form">
        <div class="form-row mb-3">
          <label for="name" class="form-label">Name<span class="req">*</span></label>
          <input
            id="name"
            v-model.trim="form.name"
            type="text"
            class="form-control"
            placeholder="e.g., Buy groceries"
          />
          <p v-if="errors.name" class="text-danger small">{{ errors.name }}</p>
        </div>

        <div class="form-row mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea
            id="description"
            v-model.trim="form.description"
            class="form-control"
            rows="3"
            placeholder="Optional details"
          ></textarea>
        </div>

        <div class="form-row mb-3">
          <label for="priority" class="form-label">Priority<span class="req">*</span></label>
          <select id="priority" v-model="form.priority" class="form-select">
            <option disabled value="">-- select priority --</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <p v-if="errors.priority" class="text-danger small">{{ errors.priority }}</p>
        </div>

        <div class="form-row mb-3">
          <label for="status" class="form-label">Status<span class="req">*</span></label>
          <select id="status" v-model="form.status" class="form-select">
            <option disabled value="">-- select status --</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option> <!-- underscore -->
            <option value="done">Done</option>
          </select>
          <p v-if="errors.status" class="text-danger small">{{ errors.status }}</p>
        </div>

        <div class="form-row mb-4">
          <label for="dueDate" class="form-label">Due date</label>
          <input id="dueDate" v-model="form.dueDate" type="date" class="form-control" />
        </div>

        <div class="d-flex justify-content-between">
          <button type="submit" class="btn btn-primary px-4">Add</button>
          <button type="button" class="btn btn-secondary px-4" @click="goHome">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import Task from "../utils/task.js" 

const router = useRouter()

const tasks = ref([])
const form = ref({
  name: "",
  description: "",
  priority: "",
  status: "",
  dueDate: ""
})
const errors = ref({ name: "", priority: "", status: "" })

function loadTasks() {
  try {
    const saved = localStorage.getItem("tasks")
    const parsed = saved ? JSON.parse(saved) : []
    tasks.value = Array.isArray(parsed) ? parsed.map(obj => Task.fromJSON(obj)) : []
  } catch {
    tasks.value = []
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks.value))
}

function validate() {
  errors.value = { name: "", priority: "", status: "" }
  let ok = true
  if (!form.value.name.trim()) {
    errors.value.name = "Name is required."
    ok = false
  }
  if (!form.value.priority) {
    errors.value.priority = "Priority is required."
    ok = false
  }
  if (!form.value.status) {
    errors.value.status = "Status is required."
    ok = false
  }
  return ok
}

function normalizeDate(v) {
  return v ? v : null
}

function onSubmit() {
  if (!validate()) return

  const payload = {
    name: form.value.name.trim(),
    description: form.value.description.trim() || "",
    priority: form.value.priority,
    status: form.value.status,
    dueDate: normalizeDate(form.value.dueDate)
  }

  const newTask = new Task(payload)
  tasks.value.push(newTask)
  saveTasks()

  form.value = { name: "", description: "", priority: "", status: "", dueDate: "" }
  router.push("/")
}

function goHome() {
  router.push("/")
}

onMounted(loadTasks)
</script>

<style scoped>
.req {
  color: #d33;
  margin-left: 0.25rem;
}
.text-danger {
  color: #d33;
}
</style>
