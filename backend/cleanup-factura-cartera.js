const mongoose = require('mongoose');
const FacturaCartera = require('./models/facturaCartera');

async function cleanupDuplicateNulls() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CABD', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado a MongoDB');

    // Eliminar documentos con numeroDocumento nulo
    const result = await FacturaCartera.deleteMany({
      $or: [
        { numeroDocumento: null },
        { numeroDocumento: { $exists: false } }
      ]
    });

    console.log(`✅ Documentos eliminados: ${result.deletedCount}`);

    // Mostrar estadísticas
    const total = await FacturaCartera.countDocuments();
    console.log(`📊 Total de facturas cartera después de limpieza: ${total}`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupDuplicateNulls();
