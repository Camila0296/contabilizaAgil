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

module.exports = { aiService, createAIProvider };
