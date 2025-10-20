<template>
  <div class="container py-5">
    <h2 class="text-center mb-4">Add New Task</h2>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">Title *</label>
        <input
          v-model="title"
          class="mt-1 w-full rounded border p-2"
          placeholder="e.g., Finish report"
        />
        <p v-if="errors.title" class="text-sm text-red-600 mt-1">{{ errors.title }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium">Description</label>
        <textarea
          v-model="description"
          rows="3"
          class="mt-1 w-full rounded border p-2"
          placeholder="Optional details..."
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium">Due Date</label>
          <input
            v-model="dueDate"
            type="date"
            class="mt-1 w-full rounded border p-2"
          />
          <p v-if="errors.dueDate" class="text-sm text-red-600 mt-1">{{ errors.dueDate }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium">Status</label>
          <select v-model.number="status" class="mt-1 w-full rounded border p-2">
            <option :value="STATUS.TODO">{{ StatusLabels[STATUS.TODO] }}</option>
            <option :value="STATUS.IN_PROGRESS">{{ StatusLabels[STATUS.IN_PROGRESS] }}</option>
            <option :value="STATUS.DONE">{{ StatusLabels[STATUS.DONE] }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">Priority</label>
          <select v-model.number="priority" class="mt-1 w-full rounded border p-2">
            <option :value="PRIORITY.LOW">{{ PriorityLabels[PRIORITY.LOW] }}</option>
            <option :value="PRIORITY.MEDIUM">{{ PriorityLabels[PRIORITY.MEDIUM] }}</option>
            <option :value="PRIORITY.HIGH">{{ PriorityLabels[PRIORITY.HIGH] }}</option>
          </select>
        </div>
      </div>

      <div v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</div>

      <div class="flex items-center gap-3">
        <button
          :disabled="submitting || !isValid"
          class="rounded px-4 py-2 bg-black text-white disabled:opacity-50"
        >
          {{ submitting ? "Saving..." : "Create Task" }}
        </button>
        <router-link to="/" class="text-sm underline">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { STATUS, PRIORITY, StatusLabels, PriorityLabels } from "../utils/taskEnums";

const router = useRouter();

// ----- LocalStorage helpers -----
const TASKS_KEY = "tasks";
function loadTasks(): any[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveTasks(tasks: any[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// ----- Reactive form fields -----
const title = ref("");
const description = ref("");
const dueDate = ref<string | null>(null);
const status = ref<number>(STATUS.TODO);
const priority = ref<number>(PRIORITY.MEDIUM);
const submitting = ref(false);
const errorMsg = ref<string | null>(null);

// ----- Validation -----
function isFutureOrToday(dateStr: string) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  const t = new Date();
  d.setHours(0, 0, 0, 0);
  t.setHours(0, 0, 0, 0);
  return d >= t;
}

const errors = computed(() => {
  const e: Record<string, string> = {};
  if (!title.value.trim()) e.title = "Title is required.";
  if (dueDate.value && !isFutureOrToday(dueDate.value))
    e.dueDate = "Due date cannot be in the past.";
  return e;
});
const isValid = computed(() => Object.keys(errors.value).length === 0);

// ----- Submit -----
async function onSubmit() {
  errorMsg.value = null;
  if (!isValid.value) return;
  submitting.value = true;

  try {
    const now = new Date().toISOString();
    const newTask = {
      id: crypto.randomUUID(),
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      dueDate: dueDate.value || undefined,
      status: Number(status.value),
      priority: Number(priority.value),
      createdAt: now,
      updatedAt: now,
    };

    const list = loadTasks();
    list.push(newTask);
    saveTasks(list);

    router.push({ name: "home", query: { created: "1" } });
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Failed to create task.";
  } finally {
    submitting.value = false;
  }
}
</script>
