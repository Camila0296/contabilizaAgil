// OpenAI Provider - Por implementar
// Este archivo es un placeholder. Para usar OpenAI como proveedor de IA:
// 1. Instala: npm install openai
// 2. Configura OPENAI_API_KEY en .env
// 3. Implementa esta clase con los métodos requeridos

class OpenAIProvider {
  get name() {
    return 'openai';
  }

  async chat(messages, context) {
    throw new Error(
      'OpenAI provider no está implementado aún. ' +
      'Para usar OpenAI, implementa backend/services/providers/openai.provider.js ' +
      'siguiendo la estructura de groq.provider.js'
    );
  }
}

module.exports = OpenAIProvider;
