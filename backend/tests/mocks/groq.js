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

    // Respuestas simuladas basadas en el contenido del mensaje
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content?.toLowerCase() || '';

    let response = 'Respuesta mock del Groq provider.';

    if (content.includes('puc')) {
      response = 'El PUC (Plan Único de Cuentas) es el catálogo de cuentas contables en Colombia. ' +
        'Está conformado por cuentas de activo, pasivo, patrimonio, ingresos, gastos y costos. ' +
        'Es obligatorio para todos los comerciantes.';
    } else if (content.includes('iva')) {
      response = 'El IVA en Colombia es del 19% en general. Se calcula sobre la base imponible del producto o servicio. ' +
        'Existen excepciones y tarifas diferenciales para ciertos productos (alimentos básicos, medicinas, etc.).';
    } else if (content.includes('retefuente')) {
      response = 'La Retención en la Fuente es un tributo anticipado sobre la renta. ' +
        'Se aplica en transacciones de compra-venta, servicios y otras operaciones. ' +
        'Las tarifas varían según el tipo de ingreso (entre 2% y 35% generalmente).';
    } else if (content.includes('factura')) {
      response = 'Una factura es un documento comercial que evidencia la venta de bienes o prestación de servicios. ' +
        'Debe contener: número, fecha, cliente, descripción, valor, IVA y firma del emisor. ' +
        'En Colombia, las facturas electrónicas son obligatorias desde 2020.';
    }

    return new MockGroqCompletion(response);
  }
}

// Exportar como named export para que `const { Groq } = require('groq-sdk')` funcione,
// y también como default para compatibilidad.
module.exports = { Groq: MockGroq, default: MockGroq };
module.exports.MockGroq = MockGroq;
