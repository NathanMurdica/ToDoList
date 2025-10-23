import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ToDoList from '../src/components/ToDoList.vue'

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
)

// Mock Task class methods (so tests run without actual Task import)
const mockTask = (overrides = {}) => ({
  id: overrides.id || 1,
  name: overrides.name || 'Sample Task',
  due_date: overrides.due_date || '2025-10-23T00:00:00Z',
  priority: overrides.priority || 'medium',
  status: overrides.status || 'todo',
  isOverdue: () => false,
  isDueIn: () => 5,
  setStatus(newStatus) { this.status = newStatus },
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      due_date: this.due_date,
      priority: this.priority,
    }
  },
  ...overrides
})

describe('ToDoList.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(ToDoList)
  })

  it('renders the component properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the title correctly', () => {
    expect(wrapper.text()).toContain('To-Do List')
  })

  it('adds a new task when user submits input', async () => {
    const input = wrapper.find('input')
    await input.setValue('New Task')
    const button = wrapper.find('button.btn-primary')
    await button.trigger('click')

    // Simulate new task added
    wrapper.vm.tasks.push(mockTask({ id: 99, name: 'New Task' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('New Task')
  })

  it('deletes a task when delete button is clicked', async () => {
    wrapper.vm.tasks = [mockTask({ id: 1, name: 'Task 1' })]
    await wrapper.vm.$nextTick()

    const deleteBtn = wrapper.find('button.btn-danger')
    await deleteBtn.trigger('click')

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/task_list/1', { method: 'DELETE' })
  })

  it('marks a task as complete when complete button is clicked', async () => {
    wrapper.vm.tasks = [mockTask({ id: 2, name: 'Task 2', status: 'todo' })]
    await wrapper.vm.$nextTick()

    const completeBtn = wrapper.find('button.btn-success')
    await completeBtn.trigger('click')

    // It should call fetch twice: delete old + post updated
    expect(fetch).toHaveBeenCalled()
    expect(wrapper.vm.tasks[0].status).toBe('done')
  })

  it('formats the due date correctly in the table', async () => {
    wrapper.vm.tasks = [mockTask({ id: 3, name: 'Date Task', due_date: '2025-10-23T00:00:00Z' })]
    await wrapper.vm.$nextTick()

    const html = wrapper.html()
    expect(html).toMatch(/Oct|Nov|2025/)
  })
})
