import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Use a browser-like environment for DOM APIs
    environment: 'happy-dom',
    // Enable TS/JSDoc based globals if any (helps with TS tests)
    globals: true,
    // Include tests under src/**/*.{test,spec}.ts/js/tsx/jsx
    include: ['src/**/*.{test,spec}.{ts,js,tsx,jsx}'],
  },
  resolve: {
    alias: [
      // Convenience alias to import from src without relative paths
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
})
