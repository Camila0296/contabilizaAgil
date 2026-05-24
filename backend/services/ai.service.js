const MockAIProvider = require('./providers/mock.provider');

function createAIProvider() {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();

  if (provider === 'claude' && process.env.ANTHROPIC_API_KEY) {
    const ClaudeAIProvider = require('./providers/claude.provider');
    return new ClaudeAIProvider();
  }

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    const OpenAIProvider = require('./providers/openai.provider');
    return new OpenAIProvider();
  }

  return new MockAIProvider();
}

const aiService = createAIProvider();

module.exports = { aiService, createAIProvider };
