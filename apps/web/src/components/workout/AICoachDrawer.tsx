'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Bot,
  Sparkles,
  Send,
  Flame,
  Dumbbell,
  ShieldAlert,
  Zap,
  Copy,
  Check,
  RotateCcw,
  User,
  Activity,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeExerciseName?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: string[];
  timestamp: string;
  isError?: boolean;
}

const CATEGORY_PROMPTS = [
  { label: '🏋️‍♂️ Progressive Overload', prompt: 'Analyze my previous workout volume and tell me how to apply double progression today.' },
  { label: '🏠 Traps & Neck Protocol', prompt: 'Give me the step-by-step form cues, tempo, and safety rules for today\'s Home Traps and Neck workout.' },
  { label: '⚽ Futsal & Leg Day Balance', prompt: 'I have intense futsal training and matches. How should I balance Saturday leg volume to avoid heavy fatigue?' },
  { label: '📈 Break a Plateau', prompt: 'I feel stuck on my pressing / rowing movements. What micro-loading or tempo adjustments should I use to break through?' },
];

export function AICoachDrawer({ isOpen, onClose, activeExerciseName }: AICoachDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content:
        "👋 Welcome to your **Hypertrophy & Progressive Overload AI Coach**!\n\nI monitor your exercise history, volume trends, and recovery to prescribe exact double progression targets.\n\nAsk me about target weights, form cues, plateaus, or futsal recovery balance.",
      recommendations: [
        'Ask about overload targets for today\'s lifts',
        'Ask for Home Traps & Neck safety cues',
        'Ask how to balance Saturday legs with futsal',
      ],
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (!confirm('Clear chat history?')) return;
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: 'Conversation reset. How can I optimize your workout progression today?',
        timestamp: 'Just now',
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsgId = 'u-' + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithAICoach({
        message: query,
        context: { exercise_name: activeExerciseName },
      });

      const assistantMsg: Message = {
        id: 'a-' + Date.now(),
        role: 'assistant',
        content: res.reply,
        recommendations: res.recommendations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        isError: true,
        content: `⚠️ **LLM Request Failed:** ${err.message || 'Please verify that GEMINI_API_KEY or OPENAI_API_KEY is configured in your environment.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hypertrophy AI Coach"
      className="max-w-2xl"
    >
      <div className="flex flex-col h-[600px] max-h-[80vh] -mx-4 -my-4 p-4 sm:p-6 bg-gradient-to-b from-[#080e18] via-[#050912] to-[#04060c]">
        {/* Header Status Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-arc-500/20 to-sky-500/20 border border-arc-500/30 text-arc-400 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase font-mono tracking-wider">
                  Live Hypertrophy AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeExerciseName ? `Context: ${activeExerciseName}` : '6-Day Aesthetic + Futsal Program Engine'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 text-xs flex items-center gap-1 transition"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-2 custom-scrollbar">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group animate-in fade-in-50 duration-200`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    {isUser ? 'You' : 'AI Hypertrophy Coach'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600">{m.timestamp}</span>
                </div>

                <div
                  className={`relative p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[92%] transition-all ${
                    isUser
                      ? 'bg-gradient-to-br from-arc-500 via-sky-500 to-teal-400 text-slate-950 font-semibold shadow-lg shadow-arc-500/20 rounded-tr-sm'
                      : m.isError
                      ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm shadow-xl'
                      : 'bg-[#0b1322] border border-slate-800/90 text-slate-200 shadow-2xl rounded-tl-sm backdrop-blur-xl'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Recommendations Pills */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                        Action Directives:
                      </span>
                      {m.recommendations.map((rec, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-2.5 rounded-xl bg-[#060b14] border border-slate-800/80 text-arc-300 text-xs flex items-start gap-2 shadow-inner"
                        >
                          <Zap className="w-3.5 h-3.5 text-arc-400 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Copy Tool */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Wave Animation */}
          {loading && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0b1322] border border-slate-800/80 w-fit animate-pulse">
              <Bot className="w-4 h-4 text-arc-400" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-arc-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
              </div>
              <span className="text-xs text-slate-400 font-mono">Querying LLM & evaluating overload...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Topic Badges */}
        <div className="py-2.5 border-t border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_PROMPTS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(item.prompt)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-arc-500/50 hover:text-white text-slate-300 whitespace-nowrap transition shadow-sm hover:shadow-arc-500/10"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-2 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask AI Coach about progressive overload, target weights, sets..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-[#080d16] border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-arc-400 focus:ring-2 focus:ring-arc-400/20 shadow-inner"
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            size="md"
            className="font-bold px-5 bg-gradient-to-r from-arc-400 to-sky-400 text-slate-950 shadow-lg shadow-arc-500/20 rounded-2xl flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Modal>
  );
}
