import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToDoList from '../src/components/ToDoList.vue'
import { testTasks } from '../src/data/TestTasks.js'

describe('ToDoList.vue', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('renders the component properly', () => {
    const wrapper = mount(ToDoList)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the title correctly', () => {
    const wrapper = mount(ToDoList)
    expect(wrapper.text()).toContain('To-Do List')  // adjust based on your actual heading text
  })

  it('adds a new task when user submits input', async () => {
    const wrapper = mount(ToDoList)

    // set input value
    const input = wrapper.find('input')
    await input.setValue('New Task')

    // trigger button
    const button = wrapper.find('button')
    await button.trigger('click')

    // check if the new task is in the list by checking all text content
    expect(wrapper.text()).toContain('New Task')
  })

  it('loads tasks from localStorage if available', async () => {
    // Prepare localStorage with a test task
    const storedTasks = [{
      id: 99,
      name: "Stored Task",}]
    localStorage.setItem('tasks', JSON.stringify(storedTasks))

    const wrapper = mount(ToDoList)
    await new Promise(resolve => setTimeout(resolve)) // wait for onMounted
    expect(wrapper.text()).toContain('Stored Task')
  })

  it('loads test tasks when no localStorage data exists', async () => {
    const wrapper = mount(ToDoList)
    await new Promise(resolve => setTimeout(resolve)) // wait for onMounted
    const items = wrapper.findAll('li')
    console.log(items.length, testTasks.length)
    expect(items.length).toBe(testTasks.length)
  })
})
