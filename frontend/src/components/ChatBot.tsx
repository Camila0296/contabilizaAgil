import React, { useState, useRef, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import type { ChatMessage, ChatResponse } from '../types/chat';

interface ChatBotProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '¡Hola! Soy tu asesor contable de **Contabiliza Ágil**. Puedo ayudarte con el uso de la plataforma, tus facturas y conceptos contables colombianos.\n\nEscribe **"ayuda"** para ver todo lo que puedo hacer.',
  timestamp: new Date()
};

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const italicMatch = remaining.match(/_(.+?)_/);

      let nextBold = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
      let nextItalic = italicMatch ? remaining.indexOf(italicMatch[0]) : Infinity;

      if (nextBold === Infinity && nextItalic === Infinity) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }

      if (nextBold <= nextItalic && boldMatch) {
        if (nextBold > 0) parts.push(<span key={key++}>{remaining.slice(0, nextBold)}</span>);
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(nextBold + boldMatch[0].length);
      } else if (italicMatch) {
        if (nextItalic > 0) parts.push(<span key={key++}>{remaining.slice(0, nextItalic)}</span>);
        parts.push(<em key={key++}>{italicMatch[1]}</em>);
        remaining = remaining.slice(nextItalic + italicMatch[0].length);
      }
    }

    return (
      <React.Fragment key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function ChatBot({ onNavigate, isLoggedIn }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg]
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await apiFetch('/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      if (!res.ok) throw new Error('Error del servidor');

      const data: ChatResponse = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.action?.type === 'navigate') {
        setTimeout(() => {
          onNavigate(data.action!.payload);
          setIsOpen(false);
        }, 800);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Lo siento, ocurrió un error al procesar tu mensaje. Intenta de nuevo.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages, onNavigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Panel de chat */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col bg-white rounded-2xl shadow-strong border border-gray-200 overflow-hidden"
          style={{ height: '520px' }}
          role="dialog"
          aria-label="Asistente contable"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Asesor Contable</p>
                <p className="text-xs text-primary-200">Contabiliza Ágil</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              aria-label="Cerrar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-soft border border-gray-100'
                  }`}
                >
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-sm shadow-soft border border-gray-100 flex space-x-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 bg-gray-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Enviar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Burbuja flotante */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 rounded-full shadow-strong flex items-center justify-center text-white hover:bg-primary-700 active:scale-95 transition-all duration-200"
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente contable'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {hasUnread && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-danger-500 rounded-full border-2 border-white" />
            )}
          </>
        )}
      </button>
    </>
  );
}
