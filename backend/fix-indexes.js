const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CABD', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado a MongoDB');

    const db = mongoose.connection.db;

    // Obtener colección
    const collection = db.collection('facturacarteras');

    // Listar índices actuales
    const indexes = await collection.listIndexes().toArray();
    console.log('📋 Índices actuales:');
    indexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} (${idx.name})`);
    });

    // Eliminar índice "numero_1" si existe
    try {
      await collection.dropIndex('numero_1');
      console.log('✅ Índice "numero_1" eliminado');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Índice "numero_1" no encontrado');
      } else {
        throw err;
      }
    }

    // Listar índices después
    const newIndexes = await collection.listIndexes().toArray();
    console.log('📋 Índices después de limpieza:');
    newIndexes.forEach(idx => {
      console.log(`  - ${JSON.stringify(idx.key)} (${idx.name})`);
    });

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixIndexes();
