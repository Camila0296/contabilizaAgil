// Guía de Retenciones en Colombia - DIAN 2026 (TABLA OFICIAL)
// Porcentajes vigentes con base de UVT (Unidad de Valor Tributario)
// UVT 2026 = $52,400

export const retentionGuide = [
  {
    category: 'HONORARIOS Y COMISIONES (PRINCIPAL)',
    items: [
      { type: 'Personas jurídicas/Declarantes', rate: '11%', description: 'Contratos mayores a 3.300 UVT ($172.720.000)' },
      { type: 'Personas naturales no declarantes', rate: '10%', description: 'Servicios de profesionales independientes' },
      { type: 'Software y derechos de uso', rate: '3.5%', description: 'Licenciamiento y derecho de uso de software' },
    ]
  },
  {
    category: 'COMPRA DE BIENES - PRODUCTOS ESPECIALES',
    items: [
      { type: 'Combustibles derivados petróleo', rate: '0.1%', description: 'Gasolina, diésel, ACPM, fuel oil (muy baja retención)' },
      { type: 'Compra de vehículos', rate: '1%', description: 'Vehículos nuevos o usados' },
      { type: 'Café pergamino o cereza', rate: '0.5%', description: 'Productos agrícolas sin procesamiento' },
    ]
  },
  {
    category: 'COMPRA DE BIENES - GENERAL',
    items: [
      { type: 'Con tarjeta débito/crédito', rate: '1.5%', description: 'Compras pagadas con tarjeta bancaria' },
      { type: 'Bienes agrícolas sin procesamiento', rate: '1.5%', description: 'Productos agrícolas sin transformación industrial' },
      { type: 'Declarantes (general)', rate: '2.5%', description: 'Compras generales - Contribuyentes declarantes' },
      { type: 'Bienes raíces (vivienda)', rate: '2.5%', description: 'Compra de vivienda de habitación' },
      { type: 'No declarantes (general)', rate: '3.5%', description: 'Compras generales - Contribuyentes no declarantes' },
      { type: 'Bienes agrícolas procesados (no declarantes)', rate: '3.5%', description: 'Productos agrícolas con transformación industrial' },
    ]
  },
  {
    category: 'SERVICIOS - GENERALES',
    items: [
      { type: 'Declarantes', rate: '4%', description: 'Servicios generales - Contribuyentes declarantes (base: $105.000)' },
      { type: 'No declarantes', rate: '6%', description: 'Servicios generales - Contribuyentes no declarantes (base: $105.000)' },
    ]
  },
  {
    category: 'SERVICIOS - TRANSPORTE Y VIGILANCIA',
    items: [
      { type: 'Transporte de carga', rate: '1%', description: 'Transporte terrestre de mercancías (base: $105.000)' },
      { type: 'Transporte aéreo/marítimo pasajeros', rate: '1%', description: 'Transporte de pasajeros por aire o mar' },
      { type: 'Vigilancia y aseo (sobre AIU)', rate: '2%', description: 'Servicios de vigilancia y aseo profesional' },
      { type: 'Transporte terrestre pasajeros', rate: '3.5%', description: 'Transporte nacional terrestre de pasajeros' },
    ]
  },
  {
    category: 'SERVICIOS - HOTELERÍA, SALUD Y TEMPORALES',
    items: [
      { type: 'Hoteles y restaurantes', rate: '3.5%', description: 'Servicios de hospedaje y alimentación' },
      { type: 'Servicios de salud (IPS)', rate: '2%', description: 'Servicios integrales de salud prestados por instituciones' },
      { type: 'Servicios temporales', rate: '1%', description: 'Servicios prestados por empresas de servicios temporales' },
      { type: 'Emolumentos eclesiásticos (declarantes)', rate: '4%', description: 'Emolumentos pagados por entidades religiosas' },
    ]
  },
  {
    category: 'ARRENDAMIENTO',
    items: [
      { type: 'Bienes inmuebles', rate: '3.5%', description: 'Arrendamiento de casas, oficinas, locales comerciales' },
      { type: 'Bienes muebles', rate: '4%', description: 'Arrendamiento de maquinaria, equipos, vehículos' },
    ]
  },
  {
    category: 'INGRESOS FINANCIEROS Y OTROS',
    items: [
      { type: 'Rendimientos títulos renta fija', rate: '4%', description: 'Intereses de bonos, CDT, TES' },
      { type: 'Intereses/Rendimientos generales', rate: '7%', description: 'Intereses de préstamos y rendimientos financieros' },
      { type: 'Construcción y urbanización', rate: '2%', description: 'Contratos de construcción y urbanización' },
      { type: 'Otros ingresos (declarantes)', rate: '4%', description: 'Otros ingresos tributarios - declarantes' },
    ]
  },
  {
    category: 'RETENCIONES ESPECIALES',
    items: [
      { type: 'Retención por IVA (Servicios)', rate: '15%', description: 'Retención en IVA recibido en servicios' },
      { type: 'Retención por IVA (Compras)', rate: '15%', description: 'Retención en IVA recibido en compras' },
      { type: 'Loterías, rifas, apuestas', rate: '20%', description: 'Ganancias por loterías y juegos de suerte' },
      { type: 'Juegos de azar independientes', rate: '3%', description: 'Retención en juegos de suerte y azar (colocación independiente)' },
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
// Basado en tabla oficial DIAN 2026
export const getRecommendedRetention = (keyword: string): number | null => {
  const keyword_lower = keyword.toLowerCase();

  // Palabras clave para retenciones - SEGÚN TABLA DIAN OFICIAL
  const retentionMap: { [key: string]: number } = {
    // HONORARIOS Y COMISIONES - 11% o 10%
    'honorarios': 11,
    'honorario': 11,
    'comisión': 11,
    'comisiones': 11,
    'profesional independiente': 10,
    'abogado': 11,
    'contador': 11,
    'auditor': 11,

    // SOFTWARE - 3.5%
    'software': 3.5,
    'licencia software': 3.5,
    'derecho de uso': 3.5,

    // TRANSPORTE - 1% o 3.5%
    'transporte de carga': 1,
    'flete': 1,
    'acarreo': 1,
    'transporte pasajeros': 3.5,

    // VIGILANCIA Y ASEO - 2%
    'vigilancia': 2,
    'aseo': 2,
    'limpieza': 2,
    'seguridad privada': 2,

    // SALUD - 2%
    'salud': 2,
    'hospital': 2,
    'clínica': 2,
    'médico': 2,

    // HOTELES Y RESTAURANTES - 3.5%
    'hotel': 3.5,
    'restaurante': 3.5,
    'hospedaje': 3.5,

    // CONSTRUCCIÓN - 2%
    'construcción': 2,
    'obra': 2,
    'contratista': 2,
    'urbanización': 2,

    // ARRENDAMIENTO - 3.5% (inmuebles) o 4% (muebles)
    'arriendo muebles': 4,
    'arriendo': 3.5,
    'arrendamiento': 3.5,
    'alquiler': 3.5,

    // COMBUSTIBLES - 0.1% (BAJA RETENCIÓN)
    'combustible': 0.1,
    'gasolina': 0.1,
    'diésel': 0.1,
    'acpm': 0.1,

    // COMPRA CON TARJETA - 1.5%
    'tarjeta': 1.5,
    'débito': 1.5,
    'crédito': 1.5,

    // BIENES AGRÍCOLAS - 1.5% (sin procesamiento) o 2.5%/3.5% (con procesamiento)
    'agrícola': 1.5,
    'ganadería': 1.5,
    'café': 0.5,

    // VEHÍCULOS - 1%
    'vehículo': 1,
    'auto': 1,
    'camión': 1,

    // INTERESES Y FINANCIERO - 7% o 4%
    'interés': 7,
    'intereses': 7,
    'rendimiento': 7,
    'financiero': 7,
    'renta fija': 4,

    // RETENCIÓN POR IVA - 15%
    'iva': 15,

    // OTROS
    'temporales': 1,
    'servicios temporales': 1,

    // Genéricos al final: solo aplican si no hubo una coincidencia más específica
    // SERVICIOS GENERALES - 4% (declarantes) o 6% (no declarantes)
    'servicio': 4,
    'servicios': 4,
    'asesoría': 4,
    'asesor': 4,
    // COMPRA DE BIENES GENERALES - 2.5% (declarantes) o 3.5% (no declarantes)
    'compra': 2.5,
    'mercancía': 2.5,
    'material': 2.5,
    'bien': 2.5,
    'producto': 2.5,
  };

  // La clave debe ser una palabra completa, admitiendo plural (evita "cobranza" → "obra" o "autorización" → "auto")
  const matchesWord = (key: string) =>
    new RegExp(`(^|[^a-z0-9áéíóúüñ])${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(e?s)?(?![a-z0-9áéíóúüñ])`).test(keyword_lower);

  // El orden del mapa define la prioridad: primero lo específico, al final lo genérico
  const match = Object.keys(retentionMap).find(matchesWord);
  return match !== undefined ? retentionMap[match] : null;
};
