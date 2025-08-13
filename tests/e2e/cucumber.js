module.exports = {
  default: {
    paths: ['e2e/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['e2e/support/**/*.js', 'e2e/step-definitions/**/*.js'],
    format: ['progress-bar'],
    formatOptions: { 
      snippetInterface: 'async-await',
      colorsEnabled: true
    },
    timeout: 60000, 
    parallel: 1, 
    retry: 0, 
    tags: 'not @wip and not @skip',
    worldParameters: {
      headless: false, 
      slowMo: 100, 
      viewport: { width: 1280, height: 1024 }
    }
  },
  ci: {
    paths: ['e2e/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['e2e/support/**/*.js', 'e2e/step-definitions/**/*.js'],
    format: ['json:tests/reports/cucumber-report.json'],
    timeout: 20000,
    publishQuiet: true,
    parallel: 1,
    tags: 'not @wip and not @slow'
  }
}; 