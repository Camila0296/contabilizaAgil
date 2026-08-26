// Guía de Retenciones en Colombia - DIAN
// Porcentajes vigentes para el registro de facturas

export const retentionGuide = [
  {
    category: 'SERVICIOS PROFESIONALES',
    items: [
      { type: 'Honorarios (independientes)', rate: '10%', description: 'Servicios de profesionales independientes' },
      { type: 'Consultoría', rate: '6%', description: 'Servicios de consultoría y asesoría' },
      { type: 'Sistemas/IT', rate: '8%', description: 'Servicios de informática y sistemas' },
    ]
  },
  {
    category: 'SERVICIOS TÉCNICOS',
    items: [
      { type: 'Servicios técnicos', rate: '3%', description: 'Reparación, mantenimiento, inspección' },
      { type: 'Construcción', rate: '3.5%', description: 'Servicios de construcción y obras' },
      { type: 'Transporte', rate: '3%', description: 'Servicios de transporte de carga' },
    ]
  },
  {
    category: 'COMPRA DE BIENES',
    items: [
      { type: 'Bienes y materiales', rate: '4%', description: 'Compra de mercancías y materiales diversos' },
      { type: 'Servicios generales', rate: '4%', description: 'Servicios generales y suministros' },
    ]
  },
  {
    category: 'ARRENDAMIENTO E INMUEBLES',
    items: [
      { type: 'Arrendamiento', rate: '2%', description: 'Arrendamiento de inmuebles' },
      { type: 'Administración inmuebles', rate: '0.5%', description: 'Administración de propiedad inmueble' },
    ]
  },
  {
    category: 'SEGUROS Y FINANCIERO',
    items: [
      { type: 'Seguros', rate: '1%', description: 'Primas de seguros' },
      { type: 'Dividendos', rate: '11%', description: 'Dividendos y ganancias ocasionales' },
      { type: 'Comisiones', rate: '2.5%', description: 'Comisiones bancarias y financieras' },
    ]
  },
  {
    category: 'COMISIONES',
    items: [
      { type: 'Comisiones generales', rate: '2.5%', description: 'Comisiones por servicios' },
      { type: 'Honorarios técnicos', rate: '2.5%', description: 'Honorarios por trabajos técnicos específicos' },
    ]
  }
];

export const icaGuide = [
  {
    type: 'Exento',
    rate: '0%',
    activities: ['Agricultura', 'Ganadería', 'Pesca', 'Silvicultura']
  },
  {
    type: 'Agricultura/Ganadería',
    rate: '0.276%',
    activities: ['Actividades agrícolas', 'Crianza de animales']
  },
  {
    type: 'Comercio e Industria',
    rate: '0.414% - 0.69%',
    activities: ['Venta de bienes', 'Actividades industriales', 'Manufactura']
  },
  {
    type: 'Servicios',
    rate: '0.69% - 1.38%',
    activities: ['Consultoría', 'Diseño', 'Publicidad', 'Sistemas', 'Transportes'],
    note: 'Varía según municipio. Bogotá: 1.104%'
  },
  {
    type: 'Administración de Inmuebles',
    rate: '0.5%',
    activities: ['Administración de propiedades', 'Arriendo de inmuebles']
  },
  {
    type: 'Diversiones Públicas',
    rate: '1.5%',
    activities: ['Cines', 'Teatros', 'Eventos públicos']
  },
  {
    type: 'Transporte Público',
    rate: '0.4%',
    activities: ['Transporte de pasajeros']
  }
];

// Función auxiliar para obtener la retención recomendada basada en palabra clave
export const getRecommendedRetention = (keyword: string): number | null => {
  const keyword_lower = keyword.toLowerCase();

  // Palabras clave para retenciones comunes
  const retentionMap: { [key: string]: number } = {
    // Servicios profesionales
    'honorarios': 10,
    'consultoría': 6,
    'asesoría': 6,
    'consultor': 10,
    'profesional': 10,
    'independiente': 10,

    // Sistemas/IT
    'sistemas': 8,
    'software': 8,
    'informática': 8,
    'desarrollo': 8,
    'programación': 8,

    // Servicios técnicos
    'técnico': 3,
    'reparación': 3,
    'mantenimiento': 3,
    'instalación': 3,

    // Construcción
    'construcción': 3.5,
    'obra': 3.5,
    'contratista': 3.5,

    // Transporte
    'transporte': 3,
    'flete': 3,
    'acarreo': 3,

    // Bienes
    'mercancía': 4,
    'material': 4,
    'bien': 4,
    'producto': 4,
    'compra': 4,

    // Arrendamiento
    'arriendo': 2,
    'arrendamiento': 2,
    'alquiler': 2,

    // Seguros
    'seguro': 1,
    'póliza': 1,

    // Dividendos
    'dividendo': 11,
    'ganancia': 11,

    // Comisiones
    'comisión': 2.5,
    'comisiones': 2.5,
  };

  for (const [key, value] of Object.entries(retentionMap)) {
    if (keyword_lower.includes(key)) {
      return value;
    }
  }

  return null;
};
