/**
 * Jest setup file - runs before all tests
 * This file mocks slow or external dependencies for faster tests
 */

// Mock the Python bridge to fail immediately in tests
// This prevents the 5-second timeout on every test
jest.mock('../python/index', () => {
  return {
    PythonBridge: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockRejectedValue(new Error('Python bridge disabled in tests')),
      cleanup: jest.fn().mockResolvedValue(undefined),
      importModule: jest.fn().mockRejectedValue(new Error('Python bridge disabled in tests')),
      isInitialized: jest.fn().mockReturnValue(false),
    })),
  };
});

// Suppress console warnings and errors during tests to keep output clean
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
