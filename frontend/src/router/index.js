import { createRouter, createWebHistory } from 'vue-router'
import ToDoList from '../components/ToDoList.vue'
import TaskDetails from '../components/TaskDetails.vue'
import TaskAdd from '../components/TaskAdd.vue'

const routes = [
  { path: '/', name: 'ToDoList', component: ToDoList },
  { path: '/task-details', name: 'TaskDetails', component: TaskDetails }, 
  { path: '/add', name: 'TaskAdd', component: TaskAdd }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
