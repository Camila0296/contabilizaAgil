// Configuración Jest para tests con mocks (sin BD real ni APIs externas)
module.exports = {
  testEnvironment: 'node',
  // globalSetup debe ejecutarse ANTES de setupFilesAfterEnv para que los jest.mock() de setup-mocks.js
  // tengan efecto cuando los archivos de test se carguen
  setupFilesAfterEnv: ['<rootDir>/tests/setup-mocks.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/groq-security-test'],
  // Incluir todos los tests - providers están mockeados
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage-mocks',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000 // Mocks son rápidos, 10s es suficiente para hooks complejos
};
