import { resolve, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import checker from 'vite-plugin-checker'
import license from 'rollup-plugin-license'
import eslint from 'vite-plugin-eslint'

const LICENSE_HEADER_PROJECT_NAME = 'tc-message-toolkit'

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
    }),
    {
      ...eslint(),
      ...license({
        banner: {
          commentStyle: 'ignored',
          content: readFileSync(join(__dirname, 'LICENSE'), {
            encoding: 'utf8',
            flag: 'r',
          }).replace(
            LICENSE_HEADER_PROJECT_NAME,
            LICENSE_HEADER_PROJECT_NAME + ' <%= pkg.version %>'
          ),
        },
        thirdParty: {
          allow: {
            test: '(MIT OR Apache-2.0 OR BSD-2-Clause OR BSD-3-Clause)',
            failOnUnlicensed: true,
            failOnViolation: true,
          },
          output: {
            file: join(__dirname, 'dist', 'dependencies.txt'),
          },
        },
      }),
      enforce: 'post',
      apply: 'build',
    },
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'tc-message-toolkit',
      fileName: 'tc-message-toolkit',
    },
  },
  resolve: {
    alias: [
      {
        find: 'tc-message-toolkit/stream',
        replacement: './src/lib/stream/browser-stream.ts',
      },
    ],
  },
  test: {
    include: ['./test/**/*.test.ts'],
    environment: 'node',
    coverage: {
      enabled: true,
    },
  },
})
