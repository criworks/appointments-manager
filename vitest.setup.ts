import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Polyfill ResizeObserver para componentes Radix/Shadcn en entorno jsdom
afterAll(() => {
  // noop to keep file as module
})

if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(globalThis as any).ResizeObserver = ResizeObserver as any
}
