import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"

// ---- Mocks must be self-contained inside factories ----
const pushMock = vi.fn()

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock })
}))

vi.mock("../src/utils/task.js", () => {
  const TaskMock = vi.fn().mockImplementation((p) => ({
    ...p,
    id: "mock-id",
    createdAt: "2025-10-21T00:00:00Z",
    updatedAt: "2025-10-21T00:00:00Z"
  }))
  return { default: TaskMock }
})

// ---- Import AFTER mocks are defined ----
import TaskAdd from "../src/components/TaskAdd.vue"
const { default: TaskMock } = await import("../src/utils/task.js")

describe("TaskAdd.vue", () => {
  beforeEach(() => {
    localStorage.clear()
    TaskMock.mockClear()
    pushMock.mockClear()
  })

  it("renders the component properly", () => {
    const wrapper = mount(TaskAdd)
    expect(wrapper.exists()).toBe(true)
  })

  it("validates required fields and blocks submit when invalid", async () => {
    const wrapper = mount(TaskAdd)
    await wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.text()).toContain("Name is required.")
    expect(wrapper.text()).toContain("Priority is required.")
    expect(wrapper.text()).toContain("Status is required.")
    expect(TaskMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("creates a Task, saves to localStorage, and redirects", async () => {
    const wrapper = mount(TaskAdd)

    await wrapper.find("#name").setValue("Buy milk")
    await wrapper.find("#priority").setValue("medium")
    await wrapper.find("#status").setValue("in_progress")
    await wrapper.find("#due_date").setValue("")

    await wrapper.find("form").trigger("submit.prevent")

    expect(TaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Buy milk",
        description: "",
        priority: "medium",
        status: "in_progress",
        due_date: null
      })
    )

    const saved = JSON.parse(localStorage.getItem("tasks"))
    expect(Array.isArray(saved)).toBe(true)
    expect(saved.length).toBe(1)
    expect(saved[0].id).toBe("mock-id")

    expect(pushMock).toHaveBeenCalledWith("/")
  })

  it("clicking Cancel navigates away", async () => {
    const wrapper = mount(TaskAdd)
    const cancelBtn = wrapper.get("button.btn.btn-secondary")
    await cancelBtn.trigger("click")
    expect(pushMock).toHaveBeenCalledWith("/")
  })
})
