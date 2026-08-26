// Retención en la Fuente (ReteFuente) - Porcentajes DIAN Colombia
export const retefuenteOptions = [
  { value: 0, label: 'Sin retención - 0%' },

  // Retenciones por servicios y honorarios
  { value: 1, label: 'Arrendamiento de inmuebles - 2%' },
  { value: 2, label: 'Seguros - 1%' },
  { value: 2.5, label: 'Comisiones / Honorarios técnicos - 2.5%' },
  { value: 3, label: 'Servicios técnicos / Transporte - 3%' },
  { value: 3.5, label: 'Construcción - 3.5%' },
  { value: 4, label: 'Compra de bienes / Servicios generales - 4%' },
  { value: 6, label: 'Servicios de consultoría - 6%' },
  { value: 8, label: 'Servicios profesionales / Sistemas - 8%' },
  { value: 10, label: 'Honorarios (independientes) - 10%' },
  { value: 11, label: 'Instituciones financieras / Dividendos - 11%' }
];

// ICA (Impuesto de Comercio) - Porcentajes por actividad y municipio
// Nota: Varía por municipio. Se incluyen rangos comunes en Colombia
export const icaOptions = [
  { value: 0, label: 'Exento - 0%' },

  // Actividades agrícolas y pecuarias
  { value: 0.276, label: 'Agricultura / Ganadería - 0.276%' },

  // Actividades comerciales e industriales
  { value: 0.414, label: 'Comercio / Industria - 0.414%' },
  { value: 0.69, label: 'Bogotá (Comercio/Industria) - 0.69%' },

  // Actividades de servicio
  { value: 0.69, label: 'Servicios (básico) - 0.69%' },
  { value: 0.966, label: 'Servicios (estándar) - 0.966%' },
  { value: 1.104, label: 'Servicios (Bogotá) - 1.104%' },
  { value: 1.38, label: 'Servicios (tarifa especial) - 1.38%' },

  // Actividades específicas
  { value: 0.5, label: 'Administración de inmuebles - 0.5%' },
  { value: 1.5, label: 'Diversiones públicas - 1.5%' },
  { value: 0.4, label: 'Transporte público - 0.4%' }
];
