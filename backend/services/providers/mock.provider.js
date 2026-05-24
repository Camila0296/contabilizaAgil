const LATENCY_MS = 700;

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function getLastUserMessage(messages) {
  const userMessages = messages.filter(m => m.role === 'user');
  return userMessages.length > 0 ? userMessages[userMessages.length - 1].content.toLowerCase() : '';
}

const RULES = [
  // Navegación — facturas
  {
    test: (msg) =>
      /(ir|abrir|mostrar|ver|navegar|llevar|llévame|abre|muéstrame).*(factura|facturación|facturacion)|(factura|facturación|facturacion).*(ir|abrir|mostrar|ver)/.test(msg) ||
      /^(facturas?|facturación|facturacion)$/.test(msg.trim()),
    handler: () => ({
      reply: 'Te llevo a la sección de **Facturación** ahora mismo.',
      action: { type: 'navigate', payload: 'facturacion' }
    })
  },
  // Navegación — reportes
  {
    test: (msg) =>
      /(ir|abrir|mostrar|ver|navegar|llevar).*(reporte|reportes)|(reporte|reportes).*(ir|abrir|mostrar|ver)/.test(msg) ||
      /^reportes?$/.test(msg.trim()),
    handler: () => ({
      reply: 'Te llevo a la sección de **Reportes** ahora mismo.',
      action: { type: 'navigate', payload: 'reportes' }
    })
  },
  // Navegación — panel
  {
    test: (msg) =>
      /(ir|abrir|mostrar|ver|navegar).*(panel|dashboard|inicio)|(panel|dashboard|inicio).*(ir|abrir|mostrar|ver)/.test(msg) ||
      /^(panel|inicio|dashboard)$/.test(msg.trim()),
    handler: () => ({
      reply: 'Te llevo al **Panel de control**.',
      action: { type: 'navigate', payload: 'panel' }
    })
  },
  // Navegación — perfil
  {
    test: (msg) =>
      /(ir|abrir|mostrar|ver|navegar|editar|cambiar).*(perfil|cuenta|mi\s+perfil)|(perfil|cuenta).*(ir|abrir|mostrar|ver)/.test(msg) ||
      /^perfil$/.test(msg.trim()),
    handler: () => ({
      reply: 'Te llevo a tu **Perfil**.',
      action: { type: 'navigate', payload: 'perfil' }
    })
  },
  // Navegación — usuarios
  {
    test: (msg) =>
      /(ir|abrir|mostrar|ver|navegar|gestionar).*(usuarios?)|(usuarios?).*(ir|abrir|mostrar|ver)/.test(msg),
    handler: () => ({
      reply: 'Te llevo a la sección de **Usuarios**.',
      action: { type: 'navigate', payload: 'usuarios' }
    })
  },
  // Navegación — aprobaciones
  {
    test: (msg) =>
      /(ir|abrir|mostrar|ver|navegar).*(aprobaci[oó]n|aprobaciones)/.test(msg),
    handler: () => ({
      reply: 'Te llevo a la sección de **Aprobaciones**.',
      action: { type: 'navigate', payload: 'aprobaciones' }
    })
  },

  // Datos del usuario — cantidad de facturas
  {
    test: (msg) =>
      /(cu[aá]ntas?|n[uú]mero|total).*(facturas?)/.test(msg) ||
      /(mis facturas|tengo facturas|facturas tengo)/.test(msg),
    handler: (ctx) => {
      const total = ctx.stats.totalFacturas;
      const mes = ctx.stats.facturasMes;
      return {
        reply: `Tienes **${total} factura${total !== 1 ? 's' : ''}** registrada${total !== 1 ? 's' : ''} en total. Este mes llevas **${mes} factura${mes !== 1 ? 's' : ''}**.`
      };
    }
  },
  // Datos del usuario — monto total facturado
  {
    test: (msg) =>
      /(cu[aá]nto|total|monto|valor).*(he facturado|facturado|gastado|registrado)/.test(msg) ||
      /(total|monto|valor).*(mis facturas|facturas)/.test(msg),
    handler: (ctx) => {
      const total = formatCOP(ctx.stats.totalMonto);
      const iva = formatCOP(ctx.stats.totalIva);
      return {
        reply: `El valor total de tus facturas es **${total}**, con un IVA acumulado de **${iva}**.`
      };
    }
  },
  // Datos del usuario — últimas facturas
  {
    test: (msg) =>
      /(últimas?|ultimas?|recientes?).*(facturas?)|(facturas?).*(recientes?|últimas?|ultimas?)/.test(msg),
    handler: (ctx) => {
      if (!ctx.facturas || ctx.facturas.length === 0) {
        return {
          reply: 'Aún no tienes facturas registradas. ¿Quieres que te lleve a Facturación para crear una?',
          action: { type: 'navigate', payload: 'facturacion' }
        };
      }
      const lista = ctx.facturas.slice(0, 5).map(f =>
        `• **${f.numero}** — ${f.proveedor} — ${formatCOP(f.monto)}`
      ).join('\n');
      return { reply: `Tus últimas facturas:\n\n${lista}` };
    }
  },

  // IVA
  {
    test: (msg) =>
      /\biva\b|impuesto.*(valor|venta)|valor.*agregado/.test(msg),
    handler: () => ({
      reply: `**IVA (Impuesto al Valor Agregado):**\n\nEn Colombia la tarifa general del IVA es del **19%**. Se calcula automáticamente sobre el monto base de la factura.\n\n_Ejemplo:_ Base $1.000.000 → IVA $190.000.\n\nEn Contabiliza Ágil el IVA se calcula solo al registrar cada factura.`
    })
  },
  // ReteFuente
  {
    test: (msg) =>
      /retefuente|retenci[oó]n.*(fuente)|ret\.?\s*fuente/.test(msg),
    handler: () => ({
      reply: `**Retención en la Fuente (ReteFuente):**\n\nEs un anticipo del impuesto de renta retenido por el pagador. Tarifas comunes (2024):\n\n• **Honorarios:** 10% o 11%\n• **Servicios:** 4% o 6%\n• **Compras:** 2.5% (si supera $935.000)\n• **Arrendamientos:** 3.5%\n\nEn Contabiliza Ágil seleccionas el % de ReteFuente al crear la factura.`
    })
  },
  // ICA
  {
    test: (msg) =>
      /\bica\b|industria.*(comercio)|comercio.*industria/.test(msg),
    handler: () => ({
      reply: `**ICA (Impuesto de Industria y Comercio):**\n\nEs un impuesto municipal. Su tarifa varía según municipio y actividad:\n\n• **Bogotá — industria:** 0.66% - 1.104%\n• **Bogotá — comercio:** 0.414% - 1.104%\n• **Bogotá — servicios:** 0.966% - 1.38%\n\nIngresa el porcentaje de tu municipio al crear cada factura en Contabiliza Ágil.`
    })
  },
  // PUC
  {
    test: (msg) =>
      /\bpuc\b|plan.*(único|unico).*(cuentas?)|c[oó]digo.*(contable|cuenta)/.test(msg),
    handler: () => ({
      reply: `**PUC (Plan Único de Cuentas):**\n\nClasificación contable colombiana:\n\n• **1 — Activos**\n• **2 — Pasivos**\n• **3 — Patrimonio**\n• **4 — Ingresos**\n• **5 — Gastos**\n• **6 — Costos de Ventas**\n• **7 — Costos de Producción**\n• **8-9 — Cuentas de Orden**\n\nSelecciona el código PUC correspondiente al registrar cada factura.`
    })
  },
  // Débito / Crédito / Naturaleza
  {
    test: (msg) =>
      /\bd[eé]bito\b|naturaleza.*deb/.test(msg) ||
      /\bcr[eé]dito\b|naturaleza.*cred/.test(msg) ||
      /naturaleza.*contable|qué es.*(d[eé]bito|cr[eé]dito|naturaleza)/.test(msg),
    handler: () => ({
      reply: `**Naturaleza Contable (Débito / Crédito):**\n\n• **DÉBITO:** Aumenta Activos y Gastos; disminuye Pasivos e Ingresos\n• **CRÉDITO:** Aumenta Pasivos, Ingresos y Patrimonio; disminuye Activos\n\n_Regla práctica:_\n— Gasto o compra → **Débito**\n— Ingreso o venta → **Crédito**`
    })
  },

  // Cómo crear una factura
  {
    test: (msg) =>
      /(c[oó]mo|pasos?|proceso|gu[ií]a).*(crear|registrar|nueva|agregar).*(factura)|(factura).*(c[oó]mo|crear|registrar|nueva)/.test(msg),
    handler: () => ({
      reply: `**¿Cómo crear una factura?**\n\n1. Ve a **Facturación** en el menú lateral\n2. Haz clic en **"Nueva Factura"**\n3. Completa los campos: número, fecha, proveedor, monto, código PUC, naturaleza, % ReteFuente e ICA\n4. El IVA (19%) se calcula automáticamente\n5. Haz clic en **Guardar**\n\nTe llevo a Facturación ahora.`,
      action: { type: 'navigate', payload: 'facturacion' }
    })
  },
  // Cómo exportar / reportes
  {
    test: (msg) =>
      /(c[oó]mo|exportar|descargar|generar).*(reporte|excel|pdf)|(reporte|excel|pdf).*(c[oó]mo|exportar|descargar)/.test(msg),
    handler: () => ({
      reply: `**¿Cómo exportar reportes?**\n\n1. Ve a **Reportes** en el menú lateral\n2. Aplica los filtros (mes, proveedor, fechas, etc.)\n3. Haz clic en **"Exportar PDF"** o **"Exportar Excel"**\n4. El archivo se descarga automáticamente\n\nTe llevo a Reportes.`,
      action: { type: 'navigate', payload: 'reportes' }
    })
  },

  // Saludo
  {
    test: (msg) =>
      /^(hola|buenos? d[ií]as?|buenas|buen d[ií]a|hi|hello|holis|hey)[\s!.]*$/.test(msg.trim()),
    handler: (ctx) => ({
      reply: `¡Hola${ctx.user.nombres ? ', ' + ctx.user.nombres : ''}! Soy tu asesor contable de **Contabiliza Ágil**.\n\nPuedo ayudarte con:\n• Guía de uso de la plataforma\n• Consultar tus facturas y estadísticas\n• Conceptos contables (IVA, ReteFuente, ICA, PUC)\n• Navegar a cualquier sección\n\n¿En qué te puedo ayudar?`
    })
  },
  // Ayuda general
  {
    test: (msg) =>
      /^(ayuda|help|qué puedes hacer|para qué sirves)[\s?]*$/.test(msg.trim()) ||
      /qu[eé].*(puedes.*(hacer|ayudar)|haces)|c[oó]mo.*puedes.*ayudar/.test(msg),
    handler: () => ({
      reply: `Puedo ayudarte con:\n\n**Plataforma:**\n• Crear y gestionar facturas\n• Exportar reportes en PDF o Excel\n• Navegar a cualquier sección\n\n**Tus datos:**\n• Cuántas facturas tienes\n• Montos totales e IVA acumulado\n• Tus últimas facturas\n\n**Asesoría contable colombiana:**\n• IVA (19%), ReteFuente, ICA\n• Plan Único de Cuentas (PUC)\n• Naturaleza contable (Débito/Crédito)\n\nEscribe tu pregunta y te ayudo.`
    })
  }
];

class MockAIProvider {
  get name() { return 'mock'; }

  async chat(messages, context) {
    await new Promise(resolve => setTimeout(resolve, LATENCY_MS));

    const lastMsg = getLastUserMessage(messages);

    for (const rule of RULES) {
      if (rule.test(lastMsg)) {
        return rule.handler(context);
      }
    }

    return {
      reply: `Como asesor contable de **Contabiliza Ágil**, puedo orientarte sobre el uso de la plataforma, tus facturas y conceptos contables colombianos como IVA, ReteFuente, ICA y PUC.\n\nEscribe **"ayuda"** para ver todo lo que puedo hacer.`
    };
  }
}

module.exports = MockAIProvider;
