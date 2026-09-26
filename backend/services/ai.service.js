const { resolverIntencionLocal } = require('./intents');
const MockAIProvider = require('./providers/mock.provider');

function createAIProvider() {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

  if (provider === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      console.warn('[AI] AI_PROVIDER=groq pero GROQ_API_KEY no está configurada. Usando mock.');
      return new MockAIProvider();
    }
    try {
      const GroqAIProvider = require('./providers/groq.provider');
      console.log('[AI] Usando provider Groq');
      return new GroqAIProvider();
    } catch (err) {
      console.error('[AI] Error cargando Groq provider:', err.message);
      return new MockAIProvider();
    }
  }

  // Claude y OpenAI no tienen implementación: se avisa y se usa el mock en lugar de fallar en cada mensaje
  if (provider !== 'mock') {
    console.warn(`[AI] AI_PROVIDER=${provider} no está implementado (disponibles: groq, mock). Usando mock.`);
    return new MockAIProvider();
  }

  console.log('[AI] Usando provider Mock (default)');
  return new MockAIProvider();
}

const aiService = createAIProvider();
const respaldo = new MockAIProvider();

function ultimoMensajeUsuario(messages) {
  const delUsuario = (messages || []).filter(m => m && m.role === 'user');
  return delUsuario.length ? delUsuario[delUsuario.length - 1].content : '';
}

// Enrutador del chat:
// 1) intenciones locales (navegación, datos del usuario, cálculos, seguridad): exactas y sin LLM
// 2) proveedor de IA para preguntas abiertas
// 3) si el proveedor falla, respuesta basada en reglas (nunca un error genérico)
async function responder(messages, context, provider = aiService) {
  const local = resolverIntencionLocal(ultimoMensajeUsuario(messages), context);
  if (local) return { ...local, source: 'local' };

  if (provider.name !== 'mock') {
    try {
      return { ...(await provider.chat(messages, context)), source: provider.name };
    } catch (err) {
      console.error(`[AI] Falló el proveedor ${provider.name}: ${err.message}. Respondiendo con reglas locales.`);
    }
  }
  return { ...(await respaldo.chat(messages, context)), source: 'mock' };
}

module.exports = { aiService, createAIProvider, responder };
