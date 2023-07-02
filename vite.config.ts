import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'tc-message-toolkit',
      fileName: 'tc-message-toolkit',
    },
  },
  test: {
    include: ['./test/**/*.test.ts'],
    environment: 'node',
    coverage: {
      enabled: true,
    },
  },
})
