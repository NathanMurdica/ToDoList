<template>
  <div class="container py-5">
    <h2 class="text-center mb-4">To-Do List</h2>

    <!-- Add Task -->
    <div class="input-group mb-4">
      <input
        v-model="newTask"
        type="text"
        class="form-control"
        placeholder="Enter a new task..."
        @keyup.enter="addTask"
      />
      <button class="btn btn-primary" @click="addTask">Add</button>
    </div>

    <!-- Task List -->
    <ul class="list-group">
      <li
        v-for="(task, index) in tasks"
        :key="index"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <input
            type="checkbox"
            class="form-check-input me-2"
            v-model="task.completed"
          />
          <span :class="{ 'text-decoration-line-through': task.completed }">
            {{ task.text }}
          </span>
        </div>
        <button
          class="btn btn-sm btn-danger"
          @click="removeTask(index)"
        >
          Delete
        </button>
      </li>
    </ul>

    <!-- Clear Completed -->
    <div class="text-center mt-4">
      <button
        class="btn btn-outline-secondary"
        @click="clearCompleted"
        :disabled="!hasCompletedTasks"
      >
        Clear Completed
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const newTask = ref("");
const tasks = ref([]);

// Load tasks from localStorage
onMounted(() => {
  const saved = localStorage.getItem("tasks");
  if (saved) tasks.value = JSON.parse(saved);
});

// Watch for changes and save to localStorage
watch(tasks, (val) => {
  localStorage.setItem("tasks", JSON.stringify(val));
}, { deep: true });

// Add a new task
const addTask = () => {
  if (!newTask.value.trim()) return;
  tasks.value.push({ text: newTask.value.trim(), completed: false });
  newTask.value = "";
};

// Remove a task
const removeTask = (index) => {
  tasks.value.splice(index, 1);
};

// Clear all completed tasks
const clearCompleted = () => {
  tasks.value = tasks.value.filter((t) => !t.completed);
};

// Check if any tasks are completed
const hasCompletedTasks = computed(() =>
  tasks.value.some((t) => t.completed)
);
</script>
