import { createRouter, createWebHistory } from 'vue-router'
import ToDoList from '../components/ToDoList.vue'

const routes = [
  {
    path: '/',
    name: 'ToDoList',
    component: ToDoList
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
