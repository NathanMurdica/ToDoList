import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskDetails from '../src/components/TaskDetails.vue'

describe('TaskDetails.vue', () => {
  it('renders correctly when no task is provided', () => {
    const wrapper = mount(TaskDetails)
    expect(wrapper.text()).toContain('No task selected.')
  })

  it('renders task details when a task is provided', () => {
    const task = { title: 'Test Task', description: 'This is a test', completed: false }
    const wrapper = mount(TaskDetails, { props: { task } })

    expect(wrapper.text()).toContain('Test Task')
    expect(wrapper.text()).toContain('This is a test')
    expect(wrapper.text()).toContain('Pending')
  })

  it('shows completed status if task is done', () => {
    const task = { title: 'Finished Task', description: 'All done!', completed: true }
    const wrapper = mount(TaskDetails, { props: { task } })

    expect(wrapper.text()).toContain('Completed')
  })
})
