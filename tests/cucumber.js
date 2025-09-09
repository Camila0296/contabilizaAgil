const path = require('path');
const fs = require('fs');

// Ensure reports directory exists
const reportsDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Common configuration
const common = {
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
  retry: 0,
  parallel: 1
};

// Environment specific configurations
module.exports = {
  default: {
    ...common,
    tags: 'not @wip and not @skip'
  },
  smoke: {
    ...common,
    tags: '@smoke and not @wip and not @skip'
  },
  wip: {
    ...common,
    tags: '@wip',
    retry: 1
  },
  debug: {
    ...common,
    tags: 'not @skip',
    format: ['pretty'],
    worldParameters: {
      debug: true
    }
  }
};
