import { defineConfig } from 'vitest/config'

/** Tests sans jsdom : le domaine ne connaît pas le DOM (ADR 0001). */
export default defineConfig({ test: { environment: 'node', include: ['src/**/*.test.ts'] } })
