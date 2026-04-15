import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
    globals: false,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['server/services/**/*.ts', 'server/utils/**/*.ts'],
      exclude: ['server/services/**/*.test.ts'],
    },
    testTimeout: 10_000,
  },
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
})
