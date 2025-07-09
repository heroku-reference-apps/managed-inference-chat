import '@testing-library/jest-dom';
import { afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// Mock scrollIntoView
beforeAll(() => {
  // Add scrollIntoView mock
  Element.prototype.scrollIntoView = vi.fn();
});

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
  // Clear all mocks after each test
  vi.clearAllMocks();
});
