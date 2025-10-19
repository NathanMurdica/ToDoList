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
              {{ task.name }}
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
  import { testTasks } from "../data/TestTasks";
import Task from "../utils/task";

  const newTask = ref("");
  const tasks = ref([]);
  
  // -------------------------
  // NOTE: this section will be modified to support backend integration, 
  // number of tasks from the backend could be compared to the number in localStorage 
  // to decide whether to load from localStorage or backend
  // -------------------------

  // Load tasks from localStorage or test data on mount
  onMounted(() => {
    const saved = localStorage.getItem("tasks");
    if (saved && JSON.parse(saved).length > 0) {
      console.log("Loading tasks from localStorage");
      tasks.value = JSON.parse(saved).map(task => Task.fromJSON(task));
    } else {
      console.log("Loading test tasks");
      tasks.value = testTasks.map(task => new Task(task));
      localStorage.setItem("tasks", JSON.stringify(tasks.value.map(t => t.toJSON())));
    }
  });

  // Watch for changes and save to localStorage
  watch(tasks, (val) => {
    localStorage.setItem("tasks", JSON.stringify(val.map(t => t.toJSON())));
  }, { deep: true });

  // Add a new task
  const addTask = () => {
    const name = newTask.value.trim();
    if (!name) return;
    const newTaskObj = new Task({ name });
    tasks.value.push(newTaskObj);
    newTask.value = "";
  };

  // Remove a task
  const removeTask = (index) => {
    tasks.value.splice(index, 1);
  };

  // Clear all completed tasks
  const clearCompleted = () => {
    tasks.value = tasks.value.filter((task) => !task.completed);
  };

  // Check if any tasks are completed
  const hasCompletedTasks = computed(() =>
    tasks.value.some((task) => task.completed)
  );
  </script>
