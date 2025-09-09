// Simple Cucumber.js configuration using CommonJS
module.exports = {
  default: {
    requireModule: ['@babel/register'],
    require: [
      'features/step_definitions/**/*.js',
      'features/support/**/*.js'
    ],
    format: [
      'progress-bar',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html'
    ],
    timeout: 60000,
    tags: 'not @wip and not @skip',
    worldParameters: {
      baseUrl: 'http://localhost:4200'
    }
  }
};
