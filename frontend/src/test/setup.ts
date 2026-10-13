import '@testing-library/jest-dom/vitest'

// Mock ResizeObserver for Radix UI components in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
