// Configurar variables de entorno
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = 'mock-key-for-testing';

// Mock groq-sdk ANTES de importar GroqAIProvider
jest.mock('groq-sdk', () => require('../mocks/groq'));

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const GroqAIProvider = require('../../services/providers/groq.provider');

describe('GroqAIProvider - Validación de Respuestas', () => {
  let provider;

  beforeAll(() => {
    provider = new GroqAIProvider();
  });

  describe('Sin tags <think>', () => {
    test('NO contiene <think> en respuesta a pregunta simple', async () => {
      const messages = [
        { role: 'user', content: 'Hola, necesito ayuda' }
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      expect(result.reply).toBeDefined();
      expect(result.reply.toLowerCase()).not.toContain('<think>');
      expect(result.reply.toLowerCase()).not.toContain('</think>');
      expect(result.reply).not.toMatch(/<think[\s\S]*?<\/think>/i);
    }, 30000);

    test('NO contiene "thinking process" en respuesta', async () => {
      const messages = [
        { role: 'user', content: '¿Qué es PUC?' }
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      expect(result.reply).toBeDefined();
      expect(result.reply.toLowerCase()).not.toContain('thinking process');
      expect(result.reply.toLowerCase()).not.toContain('here\'s a thinking');
    }, 30000);

    test('NO contiene <analysis> u otros tags internos', async () => {
      const messages = [
        { role: 'user', content: 'Dime sobre IVA' }
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 5, totalMonto: 1000000, totalIva: 190000, facturasMes: 2 },
        facturas: [
          {
            numero: 'F001',
            fecha: new Date().toISOString(),
            proveedor: 'Test Provider',
            monto: 500000,
            naturaleza: 'DÉBITO'
          }
        ]
      };

      const result = await provider.chat(messages, context);

      expect(result.reply).toBeDefined();
      expect(result.reply).not.toMatch(/<analysis>/i);
      expect(result.reply).not.toMatch(/<\/analysis>/i);
      expect(result.reply).not.toMatch(/<draft>/i);
      expect(result.reply).not.toMatch(/<plan>/i);
    }, 30000);
  });

  describe('Respuestas en Español', () => {
    test('Respuesta está en español', async () => {
      const messages = [
        { role: 'user', content: 'ayuda' }
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      expect(result.reply).toBeDefined();
      // Palabras clave en español que debería contener
      const hasSpanish =
        result.reply.toLowerCase().includes('ayud') ||
        result.reply.toLowerCase().includes('contab') ||
        result.reply.toLowerCase().includes('factur') ||
        result.reply.toLowerCase().includes('puedo');

      expect(hasSpanish).toBe(true);
    }, 30000);

    test('Respuesta NO está mayoritariamente en inglés', async () => {
      const messages = [
        { role: 'user', content: '¿Qué es el PUC?' }
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      // Palabras clave en inglés que NO deberían estar (de forma prominente)
      const englishKeywords = ['the ', 'is ', 'you ', 'your ', 'here\'s', 'here is'];
      const englishCount = englishKeywords.filter(keyword =>
        result.reply.toLowerCase().includes(keyword)
      ).length;

      // Debería haber pocas palabras en inglés (si acaso)
      expect(englishCount).toBeLessThan(3);
    }, 30000);
  });

  describe('Contenido apropiado', () => {
    test('Respuesta contiene información útil sobre contabilidad', async () => {
      const messages = [
        { role: 'user', content: '¿Cuál es el PUC para una compra de productos de aseo?' }
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      expect(result.reply).toBeDefined();
      expect(result.reply.length).toBeGreaterThan(50);
      // Debería mencionar PUC o clasificación
      const isRelevant =
        result.reply.toLowerCase().includes('puc') ||
        result.reply.toLowerCase().includes('clasificaci') ||
        result.reply.toLowerCase().includes('cuenta');

      expect(isRelevant).toBe(true);
    }, 30000);

    test('Respuesta es menor a 2000 caracteres', async () => {
      const messages = [
        { role: 'user', content: 'Cuéntame todo sobre contabilidad' }
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      expect(result.reply).toBeDefined();
      expect(result.reply.length).toBeLessThanOrEqual(2000);
    }, 30000);
  });

  describe('Manejo de errores', () => {
    test('Rechaza un historial de mensajes vacío', async () => {
      const messages = [];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      // El controlador valida antes; el provider rechaza un historial vacío
      await expect(provider.chat(messages, context)).rejects.toThrow(/empty or invalid/);
    }, 30000);

    test('Retorna respuesta fallback si hay error en Groq', async () => {
      // Simular mensaje que podría causar error
      const messages = [
        { role: 'user', content: 'a'.repeat(10000) } // Mensaje muy largo
      ];
      const context = {
        user: { nombres: 'Test', role: 'user' },
        stats: { totalFacturas: 0, totalMonto: 0, totalIva: 0, facturasMes: 0 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      // Debe retornar algo
      expect(result.reply).toBeDefined();
      expect(typeof result.reply).toBe('string');
    }, 30000);
  });

  describe('Sanitización', () => {
    test('NO expone datos sensibles en respuesta', async () => {
      const messages = [
        { role: 'user', content: '¿Cuáles son mis datos?' }
      ];
      const context = {
        user: {
          nombres: 'TestUser',
          apellidos: 'TestLastname',
          email: 'test@example.com',
          role: 'admin'
        },
        stats: { totalFacturas: 5, totalMonto: 1000000, totalIva: 190000, facturasMes: 2 },
        facturas: []
      };

      const result = await provider.chat(messages, context);

      // No debería mostrar password ni info sensible
      expect(result.reply.toLowerCase()).not.toContain('password');
      expect(result.reply.toLowerCase()).not.toContain('token');
      expect(result.reply.toLowerCase()).not.toContain('secret');
    }, 30000);
  });
});
