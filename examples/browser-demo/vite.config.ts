import { defineConfig, searchForWorkspaceRoot } from 'vite'
import path from 'node:path'

export default defineConfig({
  base: '/',
  root: __dirname,
  server: {
    fs: {
      strict: false,
    },
  },
})
