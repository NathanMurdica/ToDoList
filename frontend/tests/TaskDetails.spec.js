import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import TaskDetails from "../src/components/TaskDetails.vue"

// --- Mock vue-router ---
const pushMock = vi.fn()
let routeParams = {}

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: routeParams }),
  useRouter: () => ({ push: pushMock })
}))

// --- Helper: preload tasks into localStorage ---
const setupLocalStorage = () => {
  localStorage.clear()
  localStorage.setItem("tasks", JSON.stringify([
    { id: 1, name: "Task 1", description: "Hello", priority: "low", status: "todo" },
    { id: 2, name: "Task 2", description: "World", priority: "high", status: "done" }
  ]))
}

describe("TaskDetails.vue", () => {
  beforeEach(() => {
    setupLocalStorage()
    pushMock.mockClear()
    routeParams = {} // default: no id
  })

  it("renders heading", () => {
    const wrapper = mount(TaskDetails)
    expect(wrapper.text()).toContain("Task Details")
  })

  it("shows dropdown in picker mode when no id is passed", () => {
    const wrapper = mount(TaskDetails)
    expect(wrapper.find("select").exists()).toBe(true)
  })

  it("loads task by id and displays it", async () => {
    routeParams = { id: "0" } // must be string, not number
    const wrapper = mount(TaskDetails)

    await new Promise(resolve => setTimeout(resolve)) // wait for onMounted

    const nameInput = wrapper.find("input")
    expect(nameInput.element.value).toBe("Task 1")

    const desc = wrapper.find("textarea")
    expect(desc.element.value).toBe("Hello")
  })

  it("edits and saves a task then redirects", async () => {
    routeParams = { id: "0" }
    const wrapper = mount(TaskDetails)

    await new Promise(resolve => setTimeout(resolve))

    const nameInput = wrapper.find("input")
    await nameInput.setValue("Updated Task")

    const saveButton = wrapper.find("button.btn-primary")
    await saveButton.trigger("click")

    expect(pushMock).toHaveBeenCalledWith("/") // redirected
    const tasks = JSON.parse(localStorage.getItem("tasks"))
    expect(tasks[0].name).toBe("Updated Task")
  })

  it("back button returns to dropdown in picker mode", async () => {
    routeParams = {} // no id, so back button should show if task exists
    const wrapper = mount(TaskDetails)

    // manually inject a task because <script setup> ignores data()
    wrapper.vm.task = { id: 99, name: "Temp Task", description: "Test", priority: "low", status: "todo" }
    await wrapper.vm.$nextTick()

    const backBtn = wrapper.find("button.btn-secondary")
    expect(backBtn.exists()).toBe(true)

    await backBtn.trigger("click")
    expect(wrapper.vm.task).toBe(null)
  })

  it("shows empty date input if task has no due date", async () => {
    routeParams = {}
    const wrapper = mount(TaskDetails)

    // manually inject a task with no due date
    wrapper.vm.task = { id: 100, name: "No Date", description: "Test", priority: "low", status: "todo", dueDate: null }
    await wrapper.vm.$nextTick()

    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.exists()).toBe(true)
    expect(dateInput.element.value).toBe("") // should be empty
  })
})
