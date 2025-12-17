import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Привет! Я ваш AI-ассистент по стилю. Помочь с выбором позы или настроек камеры?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Извините, произошла ошибка связи с сервером.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-105"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="text-indigo-400" size={20} />
              <h3 className="font-semibold text-white">Gemini Pro Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-700 text-slate-100 rounded-bl-none'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-400 px-4 py-2 rounded-2xl rounded-bl-none text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-900 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Спросите что-нибудь..."
                className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white p-2 rounded-xl hover:bg-indigo-500 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
