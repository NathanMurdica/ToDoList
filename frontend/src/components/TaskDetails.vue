<template>
  <div class="container py-4">
    <h2>Task Details</h2>

    <div v-if="task">
      <p><strong>ID:</strong> {{ task.id }}</p>

      <label>Name:</label>
      <input v-model="task.name" class="form-control mb-2" />

      <label>Description:</label>
      <textarea v-model="task.description" class="form-control mb-2"></textarea>

      <label>Priority:</label>
      <select v-model="task.priority" class="form-select mb-2">
        <option :value="Task.PRIORITY.LOW">Low</option>
        <option :value="Task.PRIORITY.MEDIUM">Medium</option>
        <option :value="Task.PRIORITY.HIGH">High</option>
      </select>

      <label>Status:</label>
      <select v-model="task.status" class="form-select mb-2">
        <option :value="Task.STATUS.TODO">To Do</option>
        <option :value="Task.STATUS.IN_PROGRESS">In Progress</option>
        <option :value="Task.STATUS.DONE">Done</option>
        <option :value="Task.STATUS.CANCELLED">Cancelled</option>
      </select>

      <label>Due Date:</label>
      <input type="date" v-model="dueDateInput" class="form-control mb-2" />

      <button class="btn btn-primary mt-3" @click="saveChanges">Save</button>
    </div>
    <div v-else>
      <p>No task selected.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import Task from "../utils/task.js"

const route = useRoute()
const task = ref(null)
const dueDateInput = ref("")

onMounted(() => {
  // Pretend we got task data from localStorage or backend
  task.value = new Task({
    id: route.query.id ?? null,
    name: route.query.title ?? "Untitled Task",
    description: "",
    priority: Task.PRIORITY.MEDIUM,
    status: Task.STATUS.TODO
  })

  if (task.value.dueDate) {
    dueDateInput.value = task.value.dueDate.toISOString().substring(0, 10)
  }
})

const saveChanges = () => {
  task.value.dueDate = dueDateInput.value ? new Date(dueDateInput.value) : null
  task.value.updatedAt = new Date()
  console.log("Updated Task:", task.value.toJSON())
}
</script>
