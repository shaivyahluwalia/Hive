"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MessageSquare, X, Send, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendation?: {
    type: 'Human Worker' | 'AI Employee' | 'Human + AI Collaboration';
    reasoning: string;
    suggestions: string[];
  };
}

export default function FloatingChat() {
  const { csrfToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I am the Hive Recommendation Engine. Describe the task you need done (e.g. 'I need a logo designed' or 'I need someone to write copywriting emails'), and I will suggest the best fit!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Math.random().toString(), sender: 'user', text: userMsgText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ message: userMsgText })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'assistant',
          text: data.reasoning,
          recommendation: {
            type: data.recommendation,
            reasoning: data.reasoning,
            suggestions: data.suggestions
          }
        }]);
      } else {
        throw new Error(data.error || 'Request failed');
      }
    } catch (err) {
      const mockReply = localMockPrediction(userMsgText);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'assistant',
        text: mockReply.reasoning,
        recommendation: {
          type: mockReply.recommendation as any,
          reasoning: mockReply.reasoning,
          suggestions: mockReply.suggestions
        }
      }]);
    } finally {
      setLoading(false);
    }
  };

  const localMockPrediction = (msg: string) => {
    const text = msg.toLowerCase();
    if (text.includes('logo') || text.includes('design') || text.includes('graphic') || text.includes('banner')) {
      return {
        recommendation: 'AI Employee',
        reasoning: "I recommend launching the Graphic Designer AI. It can design high-quality graphics and layouts instantly.",
        suggestions: ['Graphic Designer AI']
      };
    }
    if (text.includes('code') || text.includes('website') || text.includes('site') || text.includes('app')) {
      return {
        recommendation: 'Human + AI Collaboration',
        reasoning: "For application building, we recommend hiring a Human Developer partnered with a Coding Assistant AI to ensure rapid delivery.",
        suggestions: ['Coding Assistant AI', 'React Developer']
      };
    }
    if (text.includes('wedding') || text.includes('photo') || text.includes('shoot') || text.includes('event')) {
      return {
        recommendation: 'Human Worker',
        reasoning: "This involves physical coordination. We suggest hiring a Freelance Human Photographer.",
        suggestions: ['Freelance Photographer']
      };
    }
    return {
      recommendation: 'Human + AI Collaboration',
      reasoning: "This request involves strategic scoping. We recommend combining human oversight with specialized AI agent outputs.",
      suggestions: ['Content Writer AI']
    };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mb-4 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-black px-4 py-3 text-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-outfit tracking-tight">Hive Assistant</h3>
                  <span className="text-[10px] text-gray-300 font-medium">Smart Sourcing Recommendation</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium ${
                      m.sender === 'user'
                        ? 'bg-[var(--foreground)] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    
                    {m.recommendation && (
                      <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                            Recommend: {m.recommendation.type}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1 pt-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ready to deploy?</span>
                          {m.recommendation.type === 'AI Employee' ? (
                            <Link
                              href="/marketplace/agents"
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold"
                            >
                              Browse AI Directory <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : m.recommendation.type === 'Human Worker' ? (
                            <Link
                              href="/marketplace/workers"
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-xs text-[var(--accent-red)] hover:underline font-bold"
                            >
                              Browse Freelancers <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <Link
                                href="/marketplace/agents"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-bold"
                              >
                                View AI Agents <ArrowRight className="h-3 w-3" />
                              </Link>
                              <Link
                                href="/marketplace/workers"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 text-xs text-[var(--accent-red)] hover:underline font-bold"
                              >
                                Hire Human Experts <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce [animation-delay:0.2s]">●</span>
                  <span className="animate-bounce [animation-delay:0.4s]">●</span>
                  <span>Hive is analyzing your query...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="border-t border-gray-150 p-3 flex gap-2 bg-white">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your task..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-black focus:outline-none bg-gray-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center rounded-lg bg-black p-2 text-white hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg hover:scale-105 transition-all text-white cursor-pointer"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
}
