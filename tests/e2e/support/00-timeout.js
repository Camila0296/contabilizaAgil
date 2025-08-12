// Ensures Cucumber default timeout is long enough before any hooks/steps run
// This file is required first (due to 00- prefix) so the timeout applies globally.
const { setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(30000);
