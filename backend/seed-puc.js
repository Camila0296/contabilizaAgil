const mongoose = require('mongoose');
const Puc = require('./models/puc');

const pucAccounts = [
  { codigo: '5110', nombre: 'Honorarios (Administración)', naturaleza: 'debito' },
  { codigo: '511005', nombre: 'Junta directiva', naturaleza: 'debito' },
  { codigo: '511010', nombre: 'Revisoría fiscal', naturaleza: 'debito' },
  { codigo: '511015', nombre: 'Auditoría externa', naturaleza: 'debito' },
  { codigo: '511020', nombre: 'Avalúos', naturaleza: 'debito' },
  { codigo: '511025', nombre: 'Asesoría jurídica', naturaleza: 'debito' },
  { codigo: '511030', nombre: 'Asesoría financiera', naturaleza: 'debito' },
  { codigo: '511035', nombre: 'Asesoría técnica', naturaleza: 'debito' },
  { codigo: '511095', nombre: 'Otros honorarios', naturaleza: 'debito' },
  { codigo: '5135', nombre: 'Servicios (Administración)', naturaleza: 'debito' },
  { codigo: '513505', nombre: 'Aseo y vigilancia', naturaleza: 'debito' },
  { codigo: '513515', nombre: 'Asistencia técnica', naturaleza: 'debito' },
  { codigo: '513525', nombre: 'Acueducto y alcantarillado', naturaleza: 'debito' },
  { codigo: '513530', nombre: 'Energía eléctrica', naturaleza: 'debito' },
  { codigo: '513535', nombre: 'Teléfono', naturaleza: 'debito' },
  { codigo: '513540', nombre: 'Correo, portes y telegramas', naturaleza: 'debito' },
  { codigo: '513550', nombre: 'Transporte, fletes y acarreos', naturaleza: 'debito' },
  { codigo: '513555', nombre: 'Gas', naturaleza: 'debito' },
  { codigo: '513595', nombre: 'Otros servicios (administración)', naturaleza: 'debito' },
  { codigo: '5210', nombre: 'Honorarios (Ventas)', naturaleza: 'debito' },
  { codigo: '521005', nombre: 'Junta directiva (ventas)', naturaleza: 'debito' },
  { codigo: '521010', nombre: 'Revisoría fiscal (ventas)', naturaleza: 'debito' },
  { codigo: '521015', nombre: 'Auditoría externa (ventas)', naturaleza: 'debito' },
  { codigo: '521020', nombre: 'Avalúos (ventas)', naturaleza: 'debito' },
  { codigo: '521025', nombre: 'Asesoría jurídica (ventas)', naturaleza: 'debito' },
  { codigo: '521030', nombre: 'Asesoría financiera (ventas)', naturaleza: 'debito' },
  { codigo: '521035', nombre: 'Asesoría técnica (ventas)', naturaleza: 'debito' },
  { codigo: '521095', nombre: 'Otros honorarios (ventas)', naturaleza: 'debito' },
  { codigo: '5235', nombre: 'Servicios (Ventas)', naturaleza: 'debito' },
  { codigo: '523505', nombre: 'Aseo y vigilancia (ventas)', naturaleza: 'debito' },
  { codigo: '523515', nombre: 'Asistencia técnica (ventas)', naturaleza: 'debito' },
  { codigo: '523525', nombre: 'Acueducto y alcantarillado (ventas)', naturaleza: 'debito' },
  { codigo: '523530', nombre: 'Energía eléctrica (ventas)', naturaleza: 'debito' },
  { codigo: '523535', nombre: 'Teléfono (ventas)', naturaleza: 'debito' },
  { codigo: '523540', nombre: 'Correo, portes y telegramas (ventas)', naturaleza: 'debito' },
  { codigo: '523550', nombre: 'Transporte, fletes y acarreos (ventas)', naturaleza: 'debito' },
  { codigo: '523555', nombre: 'Gas (ventas)', naturaleza: 'debito' },
  { codigo: '523560', nombre: 'Publicidad, propaganda y promoción', naturaleza: 'debito' },
  { codigo: '523595', nombre: 'Otros servicios (ventas)', naturaleza: 'debito' },
  { codigo: '233525', nombre: 'Honorarios por pagar (pasivo)', naturaleza: 'credito' },
  { codigo: '233530', nombre: 'Servicios técnicos por pagar', naturaleza: 'credito' },
  { codigo: '233535', nombre: 'Servicios de mantenimiento por pagar', naturaleza: 'credito' },
  { codigo: '233550', nombre: 'Servicios públicos por pagar', naturaleza: 'credito' },
  { codigo: '233545', nombre: 'Transportes, fletes y acarreos por pagar', naturaleza: 'credito' },
  { codigo: '6205', nombre: 'Compras de mercancías', naturaleza: 'debito' },
  { codigo: '6225', nombre: 'Devoluciones, reabajos y descuentos en compras', naturaleza: 'credito' }
];

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/CABD');

    await Puc.deleteMany({});
    const result = await Puc.insertMany(pucAccounts);
    console.log(`✅ Cargadas ${result.length} cuentas del PUC exitosamente`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
