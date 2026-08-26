// Mock para Groq SDK
class MockGroqMessage {
  constructor(content) {
    this.content = content;
  }
}

class MockGroqChoice {
  constructor(content) {
    this.message = new MockGroqMessage(content);
  }
}

class MockGroqCompletion {
  constructor(content) {
    this.choices = [new MockGroqChoice(content)];
  }
}

class MockGroq {
  constructor() {
    this.chat = {
      completions: {
        create: this.create.bind(this)
      }
    };
  }

  async create(options) {
    const { messages, model } = options;

    // Buscar el primer mensaje de usuario (no de sistema)
    const userMessage = messages.find(m => m.role === 'user');
    const content = (userMessage?.content || '').toLowerCase();

    // Base: siempre incluir palabras clave en español
    let response = 'Puedo ayudarte con tu contabilidad. ';

    if (content.includes('puc') || content.includes('clasificaci') || content.includes('aseo')) {
      response += 'El PUC (Plan Único de Cuentas) es el catálogo de cuentas contables obligatorio en Colombia. ' +
        'Para compras de productos de aseo, la clasificación correcta es importante. ' +
        'Generalmente se clasifica en la cuenta 5135 (Servicios de administración). ' +
        'La cuenta correcta depende de si es para administración o ventas, y del tipo de gasto. ' +
        'Puedo ayudarte a encontrar la cuenta exacta.';
    } else if (content.includes('iva')) {
      response += 'El IVA en Colombia es del 19% en general. Se calcula sobre la base imponible del producto o servicio. ' +
        'Existen excepciones y tarifas diferenciales para ciertos productos (alimentos básicos, medicinas, etc.). ' +
        'Puedo ayudarte a calcular el IVA de tus facturas.';
    } else if (content.includes('retefuente')) {
      response += 'La Retención en la Fuente es un tributo anticipado sobre la renta en la contabilidad. ' +
        'Se aplica en transacciones de compra-venta, servicios y otras operaciones comerciales. ' +
        'Las tarifas varían según el tipo de ingreso (entre 2% y 35% generalmente). ' +
        'Puedo ayudarte a calcular retenciones.';
    } else if (content.includes('factura')) {
      response += 'Una factura es un documento comercial que evidencia una transacción de venta o prestación de servicios. ' +
        'Debe contener: número, fecha, cliente, descripción, valor, IVA y firma del emisor. ' +
        'En Colombia, las facturas electrónicas son obligatorias desde 2020. ' +
        'Puedo ayudarte a gestionar tus facturas.';
    } else {
      response += 'Cuéntame más sobre qué necesitas en tu gestión financiera y contable. ' +
        'Puedo ayudarte con impuestos, clasificación de cuentas, facturas y mucho más.';
    }

    return new MockGroqCompletion(response);
  }
}

// Exportar como named export para que `const { Groq } = require('groq-sdk')` funcione,
// y también como default para compatibilidad.
module.exports = { Groq: MockGroq, default: MockGroq };
module.exports.MockGroq = MockGroq;
