import '@testing-library/jest-dom';

// Obsidian global for the active popout window document (jsdom has no popouts; alias main document)
Object.defineProperty(globalThis, 'activeDocument', {
  get: () => document,
  configurable: true,
});

// Obsidian uses String.prototype.contains (or polyfill); ensure it exists for unit tests
if (!Object.prototype.hasOwnProperty.call(String.prototype, 'contains')) {
  Object.defineProperty(String.prototype, 'contains', {
    value: function (this: string, search: string) {
      return this.includes(search);
    },
    configurable: true,
  });
}

// Global mocks for DOM APIs that may be missing or behave differently in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});
