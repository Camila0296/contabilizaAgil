export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type ChatAction = {
  type: 'navigate';
  payload: string;
};

export type ChatResponse = {
  reply: string;
  action?: ChatAction;
};
