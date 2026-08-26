// Guía de Retenciones en Colombia - DIAN 2026
// Porcentajes vigentes según resoluciones DIAN

export const retentionGuide = [
  {
    category: 'SERVICIOS PROFESIONALES',
    items: [
      { type: 'Honorarios (profesionales independientes)', rate: '10%', description: 'Servicios de profesionales independientes: abogados, contadores, ingenieros, médicos' },
      { type: 'Consultoría', rate: '6%', description: 'Servicios de asesoría y consultoría empresarial' },
      { type: 'Administración', rate: '4%', description: 'Servicios de administración y gestión' },
    ]
  },
  {
    category: 'SERVICIOS TÉCNICOS Y TECNOLOGÍA',
    items: [
      { type: 'Sistemas/Informática', rate: '8%', description: 'Servicios de desarrollo de sistemas, software, programación' },
      { type: 'Publicidad/Marketing', rate: '8%', description: 'Servicios de publicidad, marketing, estrategia digital' },
      { type: 'Diseño gráfico', rate: '8%', description: 'Servicios de diseño, diagramación, diseño gráfico' },
      { type: 'Servicios técnicos', rate: '3%', description: 'Reparación, mantenimiento, inspección técnica' },
      { type: 'Aseo/Limpieza', rate: '8%', description: 'Servicios de limpieza y aseo de oficinas' },
    ]
  },
  {
    category: 'SERVICIOS DE CONSTRUCCIÓN Y AFINES',
    items: [
      { type: 'Construcción', rate: '3.5%', description: 'Servicios de construcción, obras civiles, reforma' },
      { type: 'Transporte de carga', rate: '3%', description: 'Servicios de transporte terrestre de mercancías' },
      { type: 'Vigilancia/Seguridad', rate: '3%', description: 'Servicios de vigilancia y seguridad privada' },
      { type: 'Servicios hoteleros', rate: '3.5%', description: 'Servicios hoteleros y de hospedaje' },
    ]
  },
  {
    category: 'COMPRA DE BIENES Y MATERIALES',
    items: [
      { type: 'Compra de mercancías', rate: '3%', description: 'Compra de mercancías diversas' },
      { type: 'Materiales de construcción', rate: '3%', description: 'Compra de materiales y suministros de construcción' },
      { type: 'Metales y derivados', rate: '3%', description: 'Compra de metales, minería, derivados' },
      { type: 'Combustibles (derivados)', rate: '8%', description: 'Compra de gasolina, diésel y derivados del petróleo' },
      { type: 'Combustibles (otros)', rate: '3%', description: 'Compra de combustibles no derivados del petróleo' },
    ]
  },
  {
    category: 'ARRENDAMIENTO E INMUEBLES',
    items: [
      { type: 'Arrendamiento de inmuebles', rate: '2%', description: 'Arrendamiento de casas, oficinas, locales comerciales' },
      { type: 'Administración de inmuebles', rate: '0.5% (ICA)', description: 'Administración de propiedad inmueble' },
    ]
  },
  {
    category: 'SEGUROS Y FINANCIERO',
    items: [
      { type: 'Seguros', rate: '1%', description: 'Pólizas de seguros diversos' },
      { type: 'Comisiones financieras', rate: '2.5%', description: 'Comisiones bancarias, financieras, de servicios' },
      { type: 'Dividendos', rate: '5%', description: 'Dividendos y ganancias ocasionales' },
      { type: 'Ingresos financieros', rate: '11%', description: 'Ingresos por servicios financieros (Instituciones financieras)' },
    ]
  }
];

export const icaGuide = [
  {
    type: 'Agricultura/Ganadería',
    rate: '0.276% - 0.414%',
    activities: ['Agricultura', 'Ganadería', 'Crianza de animales', 'Agricultura industrial']
  },
  {
    type: 'Comercio',
    rate: '0.414% - 0.69%',
    activities: ['Venta de bienes', 'Comercio retail', 'Tiendas', 'Almacenes'],
    note: 'Bogotá/Medellín: 0.69% | Ciudades intermedias: 0.5%'
  },
  {
    type: 'Industria Manufacturera',
    rate: '0.414% - 0.69%',
    activities: ['Manufactura', 'Transformación de bienes', 'Industria'],
    note: 'Bogotá/Medellín: 0.69%'
  },
  {
    type: 'Servicios Generales',
    rate: '0.69% - 1.38%',
    activities: ['Consultoría', 'Diseño', 'Publicidad', 'Sistemas', 'Asesoría'],
    note: 'Tarifa básica: 0.69% | Estándar: 0.966% | Bogotá: 1.104% | Especial: 1.38%'
  },
  {
    type: 'Transporte Público',
    rate: '0.4%',
    activities: ['Transporte de pasajeros', 'Buses', 'Taxis']
  },
  {
    type: 'Administración de Inmuebles',
    rate: '0.5%',
    activities: ['Administración de propiedades', 'Gestión inmobiliaria']
  },
  {
    type: 'Servicios de Salud',
    rate: '0.8%',
    activities: ['Clínicas', 'Hospitales', 'Consultorios médicos']
  },
  {
    type: 'Diversiones Públicas',
    rate: '1.5%',
    activities: ['Cines', 'Teatros', 'Conciertos', 'Espectáculos']
  }
];

// Función auxiliar para obtener la retención recomendada basada en palabra clave
export const getRecommendedRetention = (keyword: string): number | null => {
  const keyword_lower = keyword.toLowerCase();

  // Palabras clave para retenciones comunes - ORDENADAS POR PRIORIDAD
  const retentionMap: { [key: string]: number } = {
    // Servicios profesionales
    'honorarios': 10,
    'profesional': 10,
    'abogado': 10,
    'contador': 10,
    'ingeniero': 10,
    'médico': 10,
    'consultor independiente': 10,

    // Sistemas/IT con 8%
    'sistema': 8,
    'software': 8,
    'informática': 8,
    'desarrollo': 8,
    'programación': 8,
    'app': 8,
    'aplicación': 8,

    // Publicidad y Marketing con 8%
    'publicidad': 8,
    'marketing': 8,
    'diseño gráfico': 8,
    'diseño': 8,
    'diagramación': 8,
    'aseo': 8,
    'limpieza': 8,

    // Consultoría con 6%
    'consultoría': 6,
    'asesoría': 6,
    'asesor': 6,

    // Administración con 4%
    'administración': 4,
    'gestión': 4,

    // Servicios técnicos con 3%
    'técnico': 3,
    'reparación': 3,
    'mantenimiento': 3,
    'instalación': 3,
    'inspección': 3,
    'vigilancia': 3,
    'seguridad': 3,
    'transporte': 3,
    'flete': 3,
    'acarreo': 3,

    // Construcción con 3.5%
    'construcción': 3.5,
    'obra': 3.5,
    'contratista': 3.5,
    'hotelero': 3.5,

    // Compra de bienes con 3%
    'mercancía': 3,
    'material': 3,
    'bien': 3,
    'producto': 3,
    'compra': 3,
    'combustible': 3,

    // Compra de derivados del petróleo con 8%
    'gasolina': 8,
    'diésel': 8,
    'petróleo': 8,

    // Arrendamiento con 2%
    'arriendo': 2,
    'arrendamiento': 2,
    'alquiler': 2,

    // Seguros con 1%
    'seguro': 1,
    'póliza': 1,

    // Dividendos con 5%
    'dividendo': 5,
    'ganancia': 5,
    'utilidad': 5,

    // Comisiones con 2.5%
    'comisión': 2.5,
  };

  for (const [key, value] of Object.entries(retentionMap)) {
    if (keyword_lower.includes(key)) {
      return value;
    }
  }

  return null;
};
