// Retención en la Fuente (ReteFuente) - DIAN Colombia 2026
// Tabla oficial DIAN con porcentajes vigentes
export const retefuenteOptions = [
  { value: 0, label: 'Sin retención - 0%' },

  // ===== COMPRA DE BIENES =====
  { value: 0.1, label: 'Compra de combustibles derivados del petróleo - 0.1%' },
  { value: 1, label: 'Compra de vehículos - 1%' },
  { value: 1, label: 'Enajenación de activos fijos (personas naturales) - 1%' },
  { value: 1.5, label: 'Compras con tarjeta débito/crédito - 1.5%' },
  { value: 1.5, label: 'Compras de bienes agrícolas sin procesamiento - 1.5%' },
  { value: 2.5, label: 'Compras generales (declarantes) - 2.5%' },
  { value: 2.5, label: 'Compras agrícolas con procesamiento (declarantes) - 2.5%' },
  { value: 2.5, label: 'Compras de bienes raíces (vivienda) - 2.5%' },
  { value: 2.5, label: 'Compra de oro (sociedades comercialización) - 2.5%' },
  { value: 3.5, label: 'Compras generales (no declarantes) - 3.5%' },
  { value: 3.5, label: 'Compras agrícolas con procesamiento (no declarantes) - 3.5%' },
  { value: 0.5, label: 'Compra de café pergamino o cereza - 0.5%' },

  // ===== SERVICIOS =====
  { value: 1, label: 'Servicios de transporte de carga - 1%' },
  { value: 1, label: 'Servicios de transporte aéreo/marítimo pasajeros - 1%' },
  { value: 1, label: 'Servicios temporales (sobre AIU) - 1%' },
  { value: 2, label: 'Servicios de vigilancia y aseo (sobre AIU) - 2%' },
  { value: 2, label: 'Servicios de salud (IPS) - 2%' },
  { value: 3.5, label: 'Servicios de hoteles y restaurantes - 3.5%' },
  { value: 3.5, label: 'Servicios de transporte terrestre pasajeros - 3.5%' },
  { value: 3.5, label: 'Arrendamiento de bienes inmuebles - 3.5%' },
  { value: 4, label: 'Servicios generales (declarantes) - 4%' },
  { value: 4, label: 'Emolumentos eclesiásticos (declarantes) - 4%' },
  { value: 4, label: 'Arrendamiento de bienes muebles - 4%' },
  { value: 6, label: 'Servicios generales (no declarantes) - 6%' },
  { value: 3.5, label: 'Emolumentos eclesiásticos (no declarantes) - 3.5%' },

  // ===== HONORARIOS Y COMISIONES =====
  { value: 10, label: 'Honorarios y comisiones (no declarantes) - 10%' },
  { value: 11, label: 'Honorarios y comisiones (personas jurídicas) - 11%' },
  { value: 11, label: 'Honorarios a profesionales declarantes - 11%' },

  // ===== OTROS CONCEPTOS =====
  { value: 3.5, label: 'Licenciamiento/derecho de uso de software - 3.5%' },
  { value: 4, label: 'Otros ingresos tributarios (declarantes) - 4%' },
  { value: 3.5, label: 'Otros ingresos tributarios (no declarantes) - 3.5%' },
  { value: 2, label: 'Construcción y urbanización - 2%' },

  // ===== FINANCIERO =====
  { value: 4, label: 'Rendimientos títulos renta fija - 4%' },
  { value: 7, label: 'Intereses/rendimientos financieros - 7%' },

  // ===== ESPECIALES =====
  { value: 20, label: 'Loterías, rifas, apuestas - 20%' },
  { value: 3, label: 'Juegos de suerte y azar (colocación independiente) - 3%' },

  // ===== RETENCIÓN POR IVA =====
  { value: 15, label: 'Retención en IVA (Servicios) - 15%' },
  { value: 15, label: 'Retención en IVA (Compras) - 15%' }
];

// ICA (Impuesto de Comercio) - Porcentajes vigentes 2026 por municipio
export const icaOptions = [
  { value: 0, label: 'Exento/Excluido - 0%' },

  // ===== BOGOTÁ D.C. =====
  { value: 0.414, label: 'Bogotá: Agricultura/Ganadería - 0.414%' },
  { value: 0.69, label: 'Bogotá: Comercio - 0.69%' },
  { value: 0.69, label: 'Bogotá: Industria - 0.69%' },
  { value: 1.104, label: 'Bogotá: Servicios - 1.104%' },
  { value: 0.4, label: 'Bogotá: Transporte público - 0.4%' },

  // ===== MEDELLÍN =====
  { value: 0.69, label: 'Medellín: Comercio - 0.69%' },
  { value: 0.69, label: 'Medellín: Industria - 0.69%' },
  { value: 1.104, label: 'Medellín: Servicios - 1.104%' },

  // ===== CALI =====
  { value: 0.69, label: 'Cali: Comercio - 0.69%' },
  { value: 0.69, label: 'Cali: Industria - 0.69%' },
  { value: 0.966, label: 'Cali: Servicios - 0.966%' },

  // ===== BARRANQUILLA =====
  { value: 0.69, label: 'Barranquilla: Comercio - 0.69%' },
  { value: 0.69, label: 'Barranquilla: Industria - 0.69%' },
  { value: 0.966, label: 'Barranquilla: Servicios - 0.966%' },

  // ===== OTROS MUNICIPIOS (Típicos) =====
  { value: 0.276, label: 'Agricultura/Ganadería - 0.276%' },
  { value: 0.414, label: 'Comercio/Industria (ciudades intermedias) - 0.414%' },
  { value: 0.5, label: 'Comercio/Industria (ciudades pequeñas) - 0.5%' },
  { value: 0.69, label: 'Servicios (ciudades grandes) - 0.69%' },
  { value: 0.966, label: 'Servicios (ciudades intermedias) - 0.966%' },
  { value: 1.38, label: 'Servicios (tarifa especial) - 1.38%' },
  { value: 0.4, label: 'Transporte público - 0.4%' }
];
