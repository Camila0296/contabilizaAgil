// Configuración Jest para tests con mocks (sin BD real)
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup-mocks.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/tests/providers/'], // Excluir tests de providers
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage-mocks',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 5000 // Reducido porque no tenemos overhead de BD
};
