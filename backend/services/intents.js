// Intenciones del chat que se responden sin LLM: rápidas, exactas y sin alucinaciones.
// Devuelve { reply, action? } o null si la pregunta debe ir al modelo de IA.
const { calcularImpuestos } = require('../utils/impuestosCalculator');

const TODOS = ['administrador', 'contador', 'analista', 'auxiliar'];

// Secciones de App.tsx y roles con acceso (misma matriz que el backend y el menú)
const SECCIONES = {
  'facturacion-cartera': { nombre: 'Cartera', roles: TODOS, claves: /cartera|cuentas por cobrar/ },
  facturacion: { nombre: 'Facturación', roles: TODOS, claves: /factura(s|ci[oó]n)?/ },
  reportes: { nombre: 'Reportes', roles: TODOS, claves: /reportes?|informes?/ },
  panel: { nombre: 'Panel de Control', roles: ['administrador', 'contador'], claves: /panel|dashboard|inicio/ },
  terceros: { nombre: 'Terceros', roles: TODOS, claves: /terceros?|clientes|proveedores/ },
  puc: { nombre: 'PUC', roles: TODOS, claves: /\bpuc\b|plan [uú]nico de cuentas|cat[aá]logo de cuentas/ },
  perfil: { nombre: 'Mi Perfil', roles: TODOS, claves: /perfil|mi cuenta|contrase[ñn]a/ },
  usuarios: { nombre: 'Usuarios', roles: ['administrador'], claves: /usuarios?/ },
  aprobaciones: { nombre: 'Aprobaciones', roles: ['administrador'], claves: /aprobaci[oó]n(es)?|solicitudes/ }
};

const VERBO_NAVEGAR = /\b(ir|ve|vamos|abrir|abre|ab[ií]reme|mostrar|muestra|mu[eé]strame|ver|navegar|navega|llevar|lleva|ll[eé]vame|entrar|entra|acceder|accede)\b/;

const cop = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const plural = (n, s, p = `${s}s`) => `${n} ${n === 1 ? s : p}`;

function normalizar(texto) {
  return String(texto || '').toLowerCase().trim();
}

// ---- Navegación ----
function detectarSeccion(msg) {
  for (const [id, sec] of Object.entries(SECCIONES)) {
    // El verbo debe ir seguido de la sección a pocas palabras ("llévame a cartera"), para no confundir
    // preguntas como "¿la factura de energía lleva IVA?"; o la sección sola ("reportes")
    const verboLuegoSeccion = new RegExp(`${VERBO_NAVEGAR.source}\\s+(?:[\\wáéíóúñ]+\\s+){0,3}(?:${sec.claves.source})`);
    if (verboLuegoSeccion.test(msg) || new RegExp(`^(${sec.claves.source})[.!?]*$`).test(msg)) return id;
  }
  return null;
}

function navegar(msg, ctx) {
  const id = detectarSeccion(msg);
  if (!id) return null;
  const sec = SECCIONES[id];
  const role = ctx?.user?.role;
  if (role && !sec.roles.includes(role)) {
    return { reply: `La sección **${sec.nombre}** no está disponible para tu rol (${role}). Si la necesitas, pídele acceso a un administrador.` };
  }
  return { reply: `Te llevo a **${sec.nombre}**.`, action: { type: 'navigate', payload: id } };
}

// ---- Montos y porcentajes escritos en el mensaje ----
function extraerMonto(msg) {
  const millones = msg.match(/(\d+(?:[.,]\d+)?)\s*(millones?|mill[oó]n|mm)\b/);
  if (millones) return parseFloat(millones[1].replace(',', '.')) * 1e6;
  const mil = msg.match(/(\d+(?:[.,]\d+)?)\s*mil\b/);
  if (mil) return parseFloat(mil[1].replace(',', '.')) * 1e3;
  // Números sin el porcentaje: 1.500.000 | 1,500,000 | 1500000 | 1.500.000,50
  const candidatos = [...msg.matchAll(/\$?\s*(\d{1,3}(?:[.,]\d{3})+(?:,\d{1,2})?|\d+(?:,\d{1,2})?)(?!\s*%)/g)]
    .map(m => m[1])
    .filter(n => !msg.includes(`${n}%`));
  if (!candidatos.length) return null;
  const mayor = candidatos
    .map(n => (/[.,]\d{3}/.test(n) ? n.replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.') : n.replace(',', '.')))
    .map(Number)
    // Un número suelto entre 1900 y 2100 es casi siempre un año ("facturas del 2026")
    .filter(n => !Number.isNaN(n) && !(n >= 1900 && n <= 2100 && !msg.includes('$')));
  return mayor.length ? Math.max(...mayor) : null;
}

function extraerPorcentaje(msg) {
  const m = msg.match(/(\d+(?:[.,]\d+)?)\s*(%|por ?ciento)/);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

function calcular(msg) {
  const impuesto = /\biva\b/.test(msg) ? 'iva'
    : /retenci[oó]n|retefuente|rete ?fuente/.test(msg) ? 'retefuente'
      : /\bica\b/.test(msg) ? 'ica' : null;
  const monto = extraerMonto(msg);
  // Montos pequeños suelen ser años o cantidades, no bases gravables
  if (!impuesto || !monto || monto < 100) return null;

  const pct = extraerPorcentaje(msg);
  if (impuesto === 'iva') {
    const { iva } = calcularImpuestos(monto);
    return { reply: `El **IVA (19%)** sobre una base de **${cop(monto)}** es **${cop(iva)}**, para un total con IVA de **${cop(monto + iva)}**.` };
  }
  const nombre = impuesto === 'retefuente' ? 'Retención en la Fuente' : 'ICA';
  if (pct === null) {
    return {
      reply: `Para calcular la **${nombre}** sobre ${cop(monto)} necesito el porcentaje. ` +
        (impuesto === 'retefuente'
          ? 'Tarifas comunes: **honorarios 10-11%**, **servicios 4-6%**, **compras 2.5%**, **arrendamientos 3.5%**. Ej.: "retención del 11% sobre 2 millones".'
          : 'Depende del municipio y la actividad (p. ej. **Bogotá servicios 0.966%**). Ej.: "ICA del 0.966% sobre 2 millones".')
    };
  }
  const r = calcularImpuestos(monto, impuesto === 'retefuente' ? pct : 0, impuesto === 'ica' ? pct : 0);
  const valor = impuesto === 'retefuente' ? r.retefuente : r.ica;
  return {
    reply: `${impuesto === 'ica' ? 'El' : 'La'} **${nombre} del ${pct}%** sobre **${cop(monto)}** es **${cop(valor)}**. ` +
      `Con IVA (${cop(r.iva)}) el total a pagar al proveedor sería **${cop(monto + r.iva - valor)}**.`
  };
}

// ---- Datos del usuario ----
function datosPropios(msg, ctx) {
  const stats = ctx?.stats || {};
  const cartera = ctx?.cartera || {};

  if (/vencid/.test(msg)) {
    const n = cartera.facturasVencidas || 0;
    return { reply: n ? `Tienes **${plural(n, 'factura vencida', 'facturas vencidas')}** en cartera. Revísalas en **Cartera**.` : 'No tienes facturas de cartera vencidas. ✅' };
  }
  if (/(me deben|por cobrar|saldo (pendiente|de cartera)|cartera pendiente|cu[aá]nto (me )?(deben|debe))/.test(msg)) {
    const saldo = cartera.saldoPendiente || 0;
    return {
      reply: saldo
        ? `Tus clientes te deben **${cop(saldo)}** en **${plural(cartera.facturasPendientes || 0, 'factura pendiente', 'facturas pendientes')}**.`
        : 'No tienes saldos pendientes por cobrar en cartera.'
    };
  }
  if (/(este mes|del mes|mes actual)/.test(msg) && /factur/.test(msg)) {
    return { reply: `Este mes llevas **${plural(stats.facturasMes || 0, 'factura')}** por **${cop(stats.montoMes || 0)}**.` };
  }
  if (/(cu[aá]ntas?|n[uú]mero( de)?|total( de)?)\s+(de\s+)?facturas?|mis facturas\b|facturas tengo/.test(msg) && !/(monto|valor|cu[aá]nto he|reciente|[uú]ltim)/.test(msg)) {
    return { reply: `Tienes **${plural(stats.totalFacturas || 0, 'factura')}** registradas en total; **${stats.facturasMes || 0}** este mes.` };
  }
  if (/(cu[aá]nto|total|monto|valor).*(he facturado|facturado|gastado|registrado|de mis facturas)|iva acumulado/.test(msg)) {
    return { reply: `El valor total de tus facturas es **${cop(stats.totalMonto)}**, con un IVA acumulado de **${cop(stats.totalIva)}**.` };
  }
  if (/(últimas?|ultimas?|recientes?).*(facturas?)|(facturas?).*(recientes?|últimas?|ultimas?)/.test(msg)) {
    const facturas = ctx?.facturas || [];
    if (!facturas.length) {
      return { reply: 'Aún no tienes facturas registradas. ¿Quieres que te lleve a **Facturación** para crear una?', action: { type: 'navigate', payload: 'facturacion' } };
    }
    const lista = facturas.slice(0, 5).map(f => `• **${f.numero}** — ${f.proveedor} — ${cop(f.monto)}`).join('\n');
    return { reply: `Tus últimas facturas:\n\n${lista}` };
  }
  return null;
}

// ---- Seguridad y temas ajenos ----
const INYECCION = /ignora(r)?\s+(todas?\s+)?(tus|las|los|estas)?\s*(instrucciones|reglas|indicaciones)|(system|sistema)\s*prompt|prompt del sistema|revela(r)?\s+(tu|el|las)\s+(prompt|instrucciones)|jailbreak|modo desarrollador|act[uú]a como (si|un)|sin (reglas|restricciones|filtros)|(clave|llave|key|token) (de (la )?)?(api|groq|openai)|api ?key|variables de entorno/;
const FUERA_DE_TEMA = /(f[uú]tbol|partido|mundial|selecci[oó]n colombia|pol[ií]tic|elecciones|presidente|religi[oó]n|receta|pel[ií]cula|serie|hor[oó]scopo|bitcoin|cripto|trading|chiste|canci[oó]n)/;

function seguridad(msg) {
  if (INYECCION.test(msg)) {
    return { reply: 'No puedo cambiar mis instrucciones ni compartirlas. Con gusto te ayudo con contabilidad o con el uso de **Contabiliza Ágil**.' };
  }
  if (FUERA_DE_TEMA.test(msg) && !/(factur|impuest|iva|puc|contab|retenci)/.test(msg)) {
    return { reply: 'Solo puedo ayudarte con **contabilidad colombiana** y con el uso de **Contabiliza Ágil** (facturas, cartera, impuestos, PUC y reportes). ¿En qué te ayudo sobre eso?' };
  }
  return null;
}

// ---- Saludo y ayuda ----
function conversacion(msg, ctx) {
  if (/^(hola|buen[oa]s?( d[ií]as| tardes| noches)?|buen d[ií]a|hey|holi(s)?|saludos)[\s!.,]*$/.test(msg)) {
    const nombre = ctx?.user?.nombres ? `, ${ctx.user.nombres}` : '';
    return { reply: `¡Hola${nombre}! Soy tu asesor contable. Puedo resolver dudas de **IVA, ReteFuente, ICA y PUC**, calcular impuestos, consultar **tus facturas y tu cartera**, o llevarte a cualquier sección. ¿Qué necesitas?` };
  }
  if (/^(ayuda|help|men[uú]|opciones)[\s?!.]*$/.test(msg) || /qu[eé] (puedes|sabes) hacer|c[oó]mo (me )?puedes ayudar/.test(msg)) {
    return {
      reply: 'Puedo ayudarte con:\n\n' +
        '• **Tus datos**: "¿cuántas facturas tengo?", "¿cuánto me deben?", "mis últimas facturas"\n' +
        '• **Cálculos**: "¿cuánto es el IVA de 1.500.000?", "retención del 11% sobre 2 millones"\n' +
        '• **Asesoría**: "¿qué PUC uso para arriendo?", "¿qué retención aplico a un abogado?"\n' +
        '• **Navegación**: "llévame a cartera", "abre reportes"'
    };
  }
  if (/^(gracias|muchas gracias|listo|ok|perfecto|vale)[\s!.]*$/.test(msg)) {
    return { reply: '¡Con gusto! Si necesitas algo más, aquí estoy.' };
  }
  return null;
}

function resolverIntencionLocal(mensaje, ctx) {
  const msg = normalizar(mensaje);
  if (!msg) return null;
  // "ver mis últimas facturas" es una consulta de datos aunque lleve un verbo de navegación
  const consultaDatos = /(cu[aá]nt|[uú]ltim|reciente|vencid|deben|saldo|total|acumulado|este mes)/.test(msg);
  return seguridad(msg)
    || conversacion(msg, ctx)
    || calcular(msg)
    || (consultaDatos
      ? datosPropios(msg, ctx) || navegar(msg, ctx)
      : navegar(msg, ctx) || datosPropios(msg, ctx));
}

module.exports = { resolverIntencionLocal, SECCIONES, extraerMonto, extraerPorcentaje };
