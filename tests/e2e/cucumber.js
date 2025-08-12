module.exports = {
  default: {
    paths: ['e2e/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['e2e/support/**/*.js', 'e2e/step-definitions/**/*.js'],
    format: ['@cucumber/pretty-formatter'],
    formatOptions: { snippetInterface: 'async-await' },
    timeout: 20000,
    publishQuiet: true,
    parallel: 2,
    tags: 'not @wip'
  },
  ci: {
    paths: ['e2e/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['e2e/support/**/*.js', 'e2e/step-definitions/**/*.js'],
    format: ['json:tests/reports/cucumber-report.json'],
    timeout: 20000,
    publishQuiet: true,
    parallel: 4,
    tags: 'not @wip and not @slow'
  }
}; 