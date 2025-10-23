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
        <tr v-for="(task, index) in tasks" :key="index">
          <td>{{ task.name }}</td>
          <td>{{ formatDate(task.dueDate) }}</td>
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
            <button class="btn btn-sm btn-primary me-2" @click="$router.push(`/details/${index}`)">
              Details
            </button>
            <button class="btn btn-sm btn-success me-2" @click="completeTask(index)">
              Complete
            </button>
            <button class="btn btn-sm btn-danger" @click="removeTask(index)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, watch } from "vue";
  import { testTasks } from "../data/TestTasks";
  import Task from "../utils/task";
  import formatDate from "../utils/format";

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
      tasks.value = JSON.parse(saved).map(task => Task.fromJSON(task));
    } else {
      tasks.value = testTasks.map(task => new Task(task));
      localStorage.setItem("tasks", JSON.stringify(tasks.value.map(t => t.toJSON())));
    }
  });

  // Watch for changes and save to localStorage
  watch(tasks, (val) => {
    localStorage.setItem("tasks", JSON.stringify(val.map(t => t.toJSON())));
  }, { deep: true });

  function priorityClass(priority) {
      switch (priority.toLowerCase()) {
        case 'high': return 'bg-danger'
        case 'medium': return 'bg-warning text-dark'
        case 'low': return 'bg-success'
        default: return 'bg-secondary'
      }
  };

  function taskStatus(status) {
      switch (status) {
        case Task.STATUS.TODO: return 'To Do'
        case Task.STATUS.IN_PROGRESS: return 'In Progress'
        case Task.STATUS.DONE: return 'Done'
        default: return 'Unknown'
      }
  };

  // Add a new task
  const addTask = () => {
    const name = newTask.value.trim();
    if (!name) return;
    const newTaskObj = new Task({ name });
    tasks.value.push(newTaskObj);
    newTask.value = "";
    // add any backend addition logic here
    fetch("http://localhost:5173/task_list")
      .method("POST")
      .body(JSON.stringify(newTaskObj.toJSON()));
  };

  // Remove a task
  const removeTask = (index) => {
    tasks.value.splice(index, 1);
    // add any backend deletion logic here
    fetch("http://localhost:5173/task_list/" + index)
      .method("DELETE");
  };

  const completeTask = (index) => {
    tasks.value[index].setStatus(Task.STATUS.DONE);
    // add any backend update logic here
    fetch("http://localhost:5173/task_list/" + index)
      .method("DELETE");
    fetch("http://localhost:5173/task_list")
      .method("POST")
      .body(JSON.stringify(tasks.value[index].toJSON()));
  };
  </script>
