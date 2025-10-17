import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',  // enables document/window
    globals: true,          // lets you use `describe`, `it`, `expect` without imports
  }
})
