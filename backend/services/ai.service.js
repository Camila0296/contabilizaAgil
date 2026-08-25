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

  if (provider === 'claude') {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('[AI] AI_PROVIDER=claude pero ANTHROPIC_API_KEY no está configurada. Usando mock.');
      return new MockAIProvider();
    }
    try {
      const ClaudeAIProvider = require('./providers/claude.provider');
      console.log('[AI] Usando provider Claude');
      return new ClaudeAIProvider();
    } catch (err) {
      console.error('[AI] Error cargando Claude provider:', err.message);
      return new MockAIProvider();
    }
  }

  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[AI] AI_PROVIDER=openai pero OPENAI_API_KEY no está configurada. Usando mock.');
      return new MockAIProvider();
    }
    try {
      const OpenAIProvider = require('./providers/openai.provider');
      console.log('[AI] Usando provider OpenAI');
      return new OpenAIProvider();
    } catch (err) {
      console.error('[AI] Error cargando OpenAI provider:', err.message);
      return new MockAIProvider();
    }
  }

  console.log('[AI] Usando provider Mock (default)');
  return new MockAIProvider();
}

const aiService = createAIProvider();

module.exports = { aiService, createAIProvider };
