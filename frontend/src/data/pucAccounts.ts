export interface PucAccount {
  codigo: string;
  nombre: string;
  naturaleza: 'Débito' | 'Crédito' | 'Debito' | 'Credito';
}

// List of PUC accounts provided by the user
// NOTE: The naturaleza values that come as "Debito" are normalised to "Débito" for consistency
const pucAccounts: PucAccount[] = [
  { codigo: '5110', nombre: 'Honorarios (Administración)', naturaleza: 'Débito' },
  { codigo: '511005', nombre: 'Junta directiva', naturaleza: 'Débito' },
  { codigo: '511010', nombre: 'Revisoría fiscal', naturaleza: 'Débito' },
  { codigo: '511015', nombre: 'Auditoría externa', naturaleza: 'Débito' },
  { codigo: '511020', nombre: 'Avalúos', naturaleza: 'Débito' },
  { codigo: '511025', nombre: 'Asesoría jurídica', naturaleza: 'Débito' },
  { codigo: '511030', nombre: 'Asesoría financiera', naturaleza: 'Débito' },
  { codigo: '511035', nombre: 'Asesoría técnica', naturaleza: 'Débito' },
  { codigo: '511095', nombre: 'Otros honorarios', naturaleza: 'Débito' },
  { codigo: '5135', nombre: 'Servicios (Administración)', naturaleza: 'Débito' },
  { codigo: '513505', nombre: 'Aseo y vigilancia', naturaleza: 'Débito' },
  { codigo: '513515', nombre: 'Asistencia técnica', naturaleza: 'Débito' },
  { codigo: '513525', nombre: 'Acueducto y alcantarillado', naturaleza: 'Débito' },
  { codigo: '513530', nombre: 'Energía eléctrica', naturaleza: 'Débito' },
  { codigo: '513535', nombre: 'Teléfono', naturaleza: 'Débito' },
  { codigo: '513540', nombre: 'Correo, portes y telegramas', naturaleza: 'Débito' },
  { codigo: '513550', nombre: 'Transporte, fletes y acarreos', naturaleza: 'Débito' },
  { codigo: '513555', nombre: 'Gas', naturaleza: 'Débito' },
  { codigo: '513595', nombre: 'Otros servicios (administración)', naturaleza: 'Débito' },
  { codigo: '5210', nombre: 'Honorarios (Ventas)', naturaleza: 'Débito' },
  { codigo: '521005', nombre: 'Junta directiva (ventas)', naturaleza: 'Débito' },
  { codigo: '521010', nombre: 'Revisoría fiscal (ventas)', naturaleza: 'Débito' },
  { codigo: '521015', nombre: 'Auditoría externa (ventas)', naturaleza: 'Débito' },
  { codigo: '521020', nombre: 'Avalúos (ventas)', naturaleza: 'Débito' },
  { codigo: '521025', nombre: 'Asesoría jurídica (ventas)', naturaleza: 'Débito' },
  { codigo: '521030', nombre: 'Asesoría financiera (ventas)', naturaleza: 'Débito' },
  { codigo: '521035', nombre: 'Asesoría técnica (ventas)', naturaleza: 'Débito' },
  { codigo: '521095', nombre: 'Otros honorarios (ventas)', naturaleza: 'Débito' },
  { codigo: '5235', nombre: 'Servicios (Ventas)', naturaleza: 'Débito' },
  { codigo: '523505', nombre: 'Aseo y vigilancia (ventas)', naturaleza: 'Débito' },
  { codigo: '523515', nombre: 'Asistencia técnica (ventas)', naturaleza: 'Débito' },
  { codigo: '523525', nombre: 'Acueducto y alcantarillado (ventas)', naturaleza: 'Débito' },
  { codigo: '523530', nombre: 'Energía eléctrica (ventas)', naturaleza: 'Débito' },
  { codigo: '523535', nombre: 'Teléfono (ventas)', naturaleza: 'Débito' },
  { codigo: '523540', nombre: 'Correo, portes y telegramas (ventas)', naturaleza: 'Débito' },
  { codigo: '523550', nombre: 'Transporte, fletes y acarreos (ventas)', naturaleza: 'Débito' },
  { codigo: '523555', nombre: 'Gas (ventas)', naturaleza: 'Débito' },
  { codigo: '523560', nombre: 'Publicidad, propaganda y promoción', naturaleza: 'Débito' },
  { codigo: '523595', nombre: 'Otros servicios (ventas)', naturaleza: 'Débito' },
  { codigo: '233525', nombre: 'Honorarios por pagar (pasivo)', naturaleza: 'Crédito' },
  { codigo: '233530', nombre: 'Servicios técnicos por pagar', naturaleza: 'Crédito' },
  { codigo: '233535', nombre: 'Servicios de mantenimiento por pagar', naturaleza: 'Crédito' },
  { codigo: '233550', nombre: 'Servicios públicos por pagar', naturaleza: 'Crédito' },
  { codigo: '233545', nombre: 'Transportes, fletes y acarreos por pagar', naturaleza: 'Crédito' },
  { codigo: '6205', nombre: 'Compras de mercancías', naturaleza: 'Débito' },
  { codigo: '6225', nombre: 'Devoluciones, reabajos y descuentos en compras', naturaleza: 'Crédito' }
];

export default pucAccounts;
