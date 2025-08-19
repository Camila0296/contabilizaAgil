import '@testing-library/jest-dom';

// Extender el tipo global para incluir los mocks
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Mock<T = any> extends Function, MockInstance<any, any> {
      new (): T;
      (...args: any[]): any;
    }
  }
}

// Mock de SweetAlert2
const mockSwal = {
  fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
  close: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
};

jest.mock('sweetalert2-react-content', () => {
  return () => mockSwal;
});

// Mock de fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});
