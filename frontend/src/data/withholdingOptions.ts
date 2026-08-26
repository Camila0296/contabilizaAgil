// Retención en la Fuente (ReteFuente) - Porcentajes DIAN Colombia 2026
// Actualizado según resoluciones vigentes DIAN
export const retefuenteOptions = [
  { value: 0, label: 'Sin retención - 0%' },

  // ===== SERVICIOS =====
  { value: 1, label: 'Seguros - 1%' },
  { value: 2, label: 'Arrendamiento de inmuebles - 2%' },
  { value: 2.5, label: 'Comisiones bancarias/financieras - 2.5%' },

  // Servicios técnicos y de reparación
  { value: 3, label: 'Servicios técnicos (reparación/mantenimiento) - 3%' },
  { value: 3, label: 'Servicios de transporte de carga - 3%' },
  { value: 3, label: 'Servicios de vigilancia y seguridad - 3%' },
  { value: 3.5, label: 'Servicios hoteleros - 3.5%' },
  { value: 3.5, label: 'Servicios de construcción - 3.5%' },

  // Servicios profesionales diversos
  { value: 4, label: 'Servicios de administración - 4%' },
  { value: 6, label: 'Servicios de consultoría - 6%' },

  // Servicios con retención del 8%
  { value: 8, label: 'Servicios de sistemas/informática - 8%' },
  { value: 8, label: 'Servicios de aseo y limpieza - 8%' },
  { value: 8, label: 'Servicios de publicidad y marketing - 8%' },
  { value: 8, label: 'Servicios de diseño gráfico - 8%' },

  // Servicios profesionales independientes
  { value: 10, label: 'Honorarios (profesionales independientes) - 10%' },

  // ===== COMPRA DE BIENES =====
  { value: 3, label: 'Compra de mercancías - 3%' },
  { value: 3, label: 'Compra de metales y derivados - 3%' },
  { value: 3, label: 'Compra de materiales de construcción - 3%' },
  { value: 3, label: 'Compra de combustibles (no derivados) - 3%' },
  { value: 8, label: 'Compra de combustibles derivados del petróleo - 8%' },

  // ===== OTROS =====
  { value: 5, label: 'Dividendos y ganancias ocasionales - 5%' },
  { value: 11, label: 'Ingresos financieros (Instituciones financieras) - 11%' }
];

// ICA (Impuesto de Comercio) - Porcentajes por actividad y municipio 2026
// Nota: La base es municipal, aquí se incluyen las tarifas más comunes
export const icaOptions = [
  { value: 0, label: 'Exento/Excluido - 0%' },

  // ===== ACTIVIDADES AGRÍCOLAS Y PECUARIAS =====
  { value: 0.276, label: 'Agricultura / Ganadería - 0.276%' },
  { value: 0.414, label: 'Agricultura industrial - 0.414%' },

  // ===== COMERCIO =====
  { value: 0.414, label: 'Comercio (pequeño/mediano) - 0.414%' },
  { value: 0.69, label: 'Comercio (Bogotá/grandes ciudades) - 0.69%' },
  { value: 0.5, label: 'Comercio (ciudades intermedias) - 0.5%' },

  // ===== INDUSTRIA =====
  { value: 0.414, label: 'Industria manufacturera - 0.414%' },
  { value: 0.69, label: 'Industria (Bogotá/Medellín) - 0.69%' },

  // ===== SERVICIOS GENERALES =====
  { value: 0.69, label: 'Servicios (tarifa básica) - 0.69%' },
  { value: 0.966, label: 'Servicios (tarifa estándar) - 0.966%' },
  { value: 1.104, label: 'Servicios (Bogotá/grandes ciudades) - 1.104%' },
  { value: 1.38, label: 'Servicios (tarifa especial) - 1.38%' },

  // ===== SERVICIOS ESPECÍFICOS =====
  { value: 0.4, label: 'Transporte público de pasajeros - 0.4%' },
  { value: 0.5, label: 'Administración de inmuebles - 0.5%' },
  { value: 0.5, label: 'Servicios financieros - 0.5%' },
  { value: 0.8, label: 'Servicios de salud - 0.8%' },
  { value: 1.5, label: 'Diversiones públicas (cines/teatros) - 1.5%' }
];
