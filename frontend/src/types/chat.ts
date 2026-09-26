export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // Mensaje de error del asistente que permite reintentar la última pregunta
  error?: boolean;
  retryText?: string;
};

export type ChatAction = {
  type: 'navigate';
  payload: string;
};

export type ChatResponse = {
  reply: string;
  action?: ChatAction;
};
