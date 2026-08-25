// Claude AI Provider - Por implementar
// Este archivo es un placeholder. Para usar Claude como proveedor de IA:
// 1. Instala: npm install @anthropic-ai/sdk
// 2. Configura ANTHROPIC_API_KEY en .env
// 3. Implementa esta clase con los métodos requeridos

class ClaudeAIProvider {
  get name() {
    return 'claude';
  }

  async chat(messages, context) {
    throw new Error(
      'Claude provider no está implementado aún. ' +
      'Para usar Claude, implementa backend/services/providers/claude.provider.js ' +
      'siguiendo la estructura de groq.provider.js'
    );
  }
}

module.exports = ClaudeAIProvider;
