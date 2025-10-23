import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ToDoList from '../src/components/ToDoList.vue'

describe('ToDoList.vue', () => {
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
})
