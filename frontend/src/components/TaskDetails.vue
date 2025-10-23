<template>
  <div class="container py-4">
    <h2>Task Details</h2>

    <!-- Dropdown to choose a task when no ID is provided in the route -->
    <div v-if="!route.params.id && !task">
      <label>Select a Task:</label>
      <select v-model="selectedIndex" class="form-select mb-3" @change="onTaskSelect">
        <option disabled value="">-- Choose a task --</option>
        <option v-for="(t, idx) in tasks" :key="idx" :value="idx">
          {{ t.name || `Task ${idx + 1}` }}
        </option>
      </select>
    </div>

    <!-- Task Details Form -->
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
      </select>

      <label>Due Date:</label>
      <input type="date" v-model="dueDateInput" class="form-control mb-2" />

      <div class="mt-3">
        <button class="btn btn-primary me-2" @click="saveChanges">Save</button>
        <button class="btn btn-secondary" v-if="!route.params.id" @click="backToPicker">Back</button>
      </div>
    </div>

    <div v-else-if="route.params.id">
      <p>No task selected.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import Task from "../utils/task.js"

// route & router for navigation, refs store all tasks, selected task, date input, and dropdown index
const route = useRoute()
const router = useRouter()

const tasks = ref([])
const task = ref(null)
const dueDateInput = ref("")
const selectedIndex = ref("")

onMounted(() => {
  tasks.value = JSON.parse(localStorage.getItem("tasks") || "[]").map(t => Task.fromJSON(t))

  // If we came directly from table (with :id param)
  if (route.params.id !== undefined) {
    loadTask(route.params.id)
  }
})

const onTaskSelect = () => {
  if (selectedIndex.value !== "") {
    loadTask(selectedIndex.value)
  }
}

const loadTask = (index) => {
  if (tasks.value[index]) {
    task.value = Task.fromJSON(tasks.value[index])
    selectedIndex.value = index
    dueDateInput.value = task.value.dueDate
      ? new Date(task.value.dueDate).toISOString().substring(0, 10)
      : ""
  }
}
//Saving the the details page
const saveChanges = () => {
  if (!task.value) return

  task.value.dueDate = dueDateInput.value ? new Date(dueDateInput.value) : null
  task.value.updatedAt = new Date()

  //Making sure index is correct (string → number)
  const index = route.params.id !== undefined 
    ? parseInt(route.params.id) 
    : parseInt(selectedIndex.value)

  // update storage
  const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
  storedTasks[index] = task.value.toJSON()
  localStorage.setItem("tasks", JSON.stringify(storedTasks))

  // Delete previous server copy (if any) and re-post the updated task to backend
  const idToDelete = tasks.value[index] && tasks.value[index].id
  if (idToDelete !== undefined && idToDelete !== null) {
    fetch(`http://localhost:8000/task_list/${idToDelete}`, { method: "DELETE" })
      .catch(err => console.error('TaskDetails DELETE error', err))
  }

  fetch("http://localhost:8000/task_list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storedTasks[index])
  }).catch(err => console.error('TaskDetails POST error', err))

  // refresh dropdown list
  tasks.value = storedTasks.map(t => Task.fromJSON(t))

  console.log("Updated Task:", task.value.toJSON())

  //Redirect to main page after saving
  router.push("/")
}

const backToPicker = () => {
  task.value = null
  selectedIndex.value = ""
}
</script>
