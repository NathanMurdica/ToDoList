import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import TaskAdd from "../src/components/TaskAdd.vue"

const TaskMock = vi.fn().mockImplementation((p) => ({ ...p, id: "mock-id" }))
vi.mock("../src/utils/task.js", () => ({ Task: TaskMock }))

describe("TaskAdd.vue", () => {
  beforeEach(() => localStorage.clear())

  it("creates a Task and saves to localStorage", async () => {
    const wrapper = mount(TaskAdd)

    await wrapper.find("#name").setValue("Buy milk")
    await wrapper.find("#priority").setValue("medium")
    await wrapper.find("#status").setValue("todo")

    await wrapper.find("form").trigger("submit.prevent")

    expect(TaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Buy milk",
        priority: "medium",
        status: "todo"
      })
    )

    const saved = JSON.parse(localStorage.getItem("tasks"))
    expect(saved?.length).toBe(1)
    expect(saved[0].id).toBe("mock-id")
  })
})
