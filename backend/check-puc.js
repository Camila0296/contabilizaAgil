const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/CABD');
    const count = await mongoose.connection.db.collection('pucs').countDocuments();
    console.log(`Total cuentas PUC: ${count}`);

    if (count > 0) {
      const sample = await mongoose.connection.db.collection('pucs').findOne();
      console.log('Ejemplo:', JSON.stringify(sample, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
