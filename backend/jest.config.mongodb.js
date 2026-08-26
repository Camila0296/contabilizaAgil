module.exports = {
  displayName: 'backend-mongodb',
  testEnvironment: 'node',
  testMatch: ['**/tests/controllers/**/*.test.js', '**/tests/providers/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup-mongodb.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 30000,
  verbose: true,
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true
};
