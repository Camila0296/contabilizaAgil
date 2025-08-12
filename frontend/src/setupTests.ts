import '@testing-library/jest-dom';

// Mock de SweetAlert2
jest.mock('sweetalert2-react-content', () => {
  return () => ({
    fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
    close: jest.fn(),
    showLoading: jest.fn(),
    hideLoading: jest.fn(),
  });
});

// Mock de fetch global
global.fetch = jest.fn();

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Limpiar mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
}); 