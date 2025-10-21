import { describe, it, expect, beforeEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import TaskAdd from "../src/components/TaskAdd.vue"

const pushMock = vi.fn()
vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock })
}))

const TaskMock = vi.fn().mockImplementation((p) => ({
  ...p,
  id: "mock-id",
  createdAt: "2025-10-21T00:00:00Z",
  updatedAt: "2025-10-21T00:00:00Z"
}))
vi.mock("../src/utils/task.js", () => ({
  default: TaskMock
}))

describe("TaskAdd.vue", () => {
  beforeEach(() => {
    localStorage.clear()
    TaskMock.mockClear()
    pushMock.mockClear()
  })

  it("renders all required form fields", () => {
    const wrapper = mount(TaskAdd)
    expect(wrapper.find("#name").exists()).toBe(true)
    expect(wrapper.find("#priority").exists()).toBe(true)
    expect(wrapper.find("#status").exists()).toBe(true)
    expect(wrapper.find("#dueDate").exists()).toBe(true)
  })

  it("validates empty fields and shows error messages", async () => {
    const wrapper = mount(TaskAdd)
    await wrapper.find("form").trigger("submit.prevent")

    expect(wrapper.text()).toContain("Name is required.")
    expect(wrapper.text()).toContain("Priority is required.")
    expect(wrapper.text()).toContain("Status is required.")
    expect(TaskMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it("creates a new Task, saves to localStorage, and redirects", async () => {
    const wrapper = mount(TaskAdd)

    await wrapper.find("#name").setValue("Buy milk")
    await wrapper.find("#priority").setValue("medium")
    await wrapper.find("#status").setValue("in_progress")
    await wrapper.find("#dueDate").setValue("")

    await wrapper.find("form").trigger("submit.prevent")

    expect(TaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Buy milk",
        description: "",
        priority: "medium",
        status: "in_progress",
        dueDate: null
      })
    )

    const saved = JSON.parse(localStorage.getItem("tasks"))
    expect(saved?.length).toBe(1)
    expect(saved[0].id).toBe("mock-id")
    expect(saved[0].name).toBe("Buy milk")

    expect(pushMock).toHaveBeenCalledWith("/")
  })

  it("supports optional description and dueDate fields", async () => {
    const wrapper = mount(TaskAdd)

    await wrapper.find("#name").setValue("Read book")
    await wrapper.find("#description").setValue("Chapter 1–3")
    await wrapper.find("#priority").setValue("high")
    await wrapper.find("#status").setValue("todo")
    await wrapper.find("#dueDate").setValue("2025-12-25")

    await wrapper.find("form").trigger("submit.prevent")

    expect(TaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Read book",
        description: "Chapter 1–3",
        priority: "high",
        status: "todo",
        dueDate: "2025-12-25"
      })
    )

    const saved = JSON.parse(localStorage.getItem("tasks"))
    expect(saved[0].name).toBe("Read book")
  })
})
