// Helper para resetear estado de mocks de forma segura entre test suites
const { stores } = require('../mocks/db');

function resetAllStores() {
  Object.keys(stores).forEach(key => {
    stores[key].length = 0;
  });
}

function resetExcept(...keysToKeep) {
  Object.keys(stores).forEach(key => {
    if (!keysToKeep.includes(key)) {
      stores[key].length = 0;
    }
  });
}

module.exports = {
  resetAllStores,
  resetExcept
};
