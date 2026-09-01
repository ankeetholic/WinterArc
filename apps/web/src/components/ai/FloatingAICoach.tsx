'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

export function FloatingAICoach() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Hello! How can I assist your workout and progressive overload today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only show on the Workout / Gym routine page
  const isWorkoutPage = pathname === '/workout' || pathname.startsWith('/workout/');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  if (!isWorkoutPage) {
    return null;
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsgId = 'u-' + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAICoach({
        message: userText,
      });

      const assistantMsg: Message = {
        id: 'a-' + Date.now(),
        role: 'assistant',
        content: res.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        isError: true,
        content: `⚠️ ${err.message || 'LLM API Key missing or request failed. Please set GEMINI_API_KEY or OPENAI_API_KEY.'}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Messenger Icon Button (Bottom-Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
          isOpen
            ? 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white scale-95'
            : 'bg-gradient-to-tr from-arc-500 to-sky-400 text-slate-950 shadow-lg shadow-arc-500/35 hover:scale-110 active:scale-95'
        }`}
        title={isOpen ? 'Close chat' : 'Open workout chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-950 ring-2 ring-arc-400 animate-pulse" />
          </div>
        )}
      </button>

      {/* Floating Clean Messenger Box */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[380px] h-[520px] max-h-[80vh] rounded-3xl bg-[#0b121e] border border-slate-800/90 shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in-50 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-[#0d1624] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-arc-500/15 border border-arc-500/30 text-arc-400 font-bold text-sm flex items-center justify-center font-mono">
                A
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">AI Coach</h3>
                <p className="text-[11px] text-slate-400">Typically replies instantly</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] leading-relaxed break-words ${
                      isUser
                        ? 'bg-arc-500 text-slate-950 font-medium rounded-tr-sm shadow-md shadow-arc-500/20'
                        : m.isError
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm shadow-sm'
                        : 'bg-[#121c2d] border border-slate-800/80 text-slate-100 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl bg-[#121c2d] border border-slate-800/80 text-slate-400 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Field & Send Button */}
          <form
            onSubmit={handleSend}
            className="p-3.5 bg-[#0d1624] border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-[#080d16] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-arc-400 focus:ring-1 focus:ring-arc-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-arc-500 hover:bg-arc-400 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-center transition shadow-md shadow-arc-500/20 flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
