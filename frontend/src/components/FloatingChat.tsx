"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MessageSquare, X, Send, Cpu, Sparkles, ArrowRight, Mic, Square } from 'lucide-react';
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
  const [language, setLanguage] = useState('en-IN');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Add these references at the top of your component body with the other states/refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const leftChannel = useRef<Float32Array[]>([]);
  const recordingLength = useRef<number>(0);

  const startRecording = async () => {
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("Microphone access granted!");

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 }); // 16kHz is ideal for AI STT
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // Create a processor with a 4096 buffer size, 1 input channel, 1 output channel
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      leftChannel.current = [];
      recordingLength.current = 0;

      processor.onaudioprocess = (e) => {
        const samples = new Float32Array(e.inputBuffer.getChannelData(0));
        leftChannel.current.push(samples);
        recordingLength.current += samples.length;
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);

    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Could not access the microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (!processorRef.current || !audioContextRef.current) return;

    setIsRecording(false);
    setLoading(true);

    // Disconnect audio nodes
    processorRef.current.disconnect();
    audioContextRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Flatten the recorded audio chunks
    const flattened = new Float32Array(recordingLength.current);
    let offset = 0;
    for (let i = 0; i < leftChannel.current.length; i++) {
      flattened.set(leftChannel.current[i], offset);
      offset += leftChannel.current[i].length;
    }

    // Encode to an actual standard 16-bit PCM WAV file buffer
    const buffer = new ArrayBuffer(44 + flattened.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + flattened.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw PCM) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, 16000, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, 16000 * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, flattened.length * 2, true);

    // Write PCM audio samples
    let index = 44;
    for (let i = 0; i < flattened.length; i++) {
      const s = Math.max(-1, Math.min(1, flattened[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      index += 2;
    }

    const audioBlob = new Blob([view], { type: 'audio/wav' });

    // Send across the Base64 JSON connection pipeline
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const res = await fetch('/api/chat/voice-transcribe', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken 
          },
          body: JSON.stringify({ audio: base64String, languageCode: language })
        });
        
        const data = await res.json();
        if (data.transcript) {
          setInput(data.transcript); 
        }
      } catch (apiErr) {
        console.error("Backend API Error:", apiErr);
      } finally {
        setLoading(false);
      }
    };
  };

  // Small helper utility function to write headers into the DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

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
<form onSubmit={handleSend} className="relative border-t border-gray-200 p-3 flex gap-2 bg-white w-full items-center z-10">
  
  {/* Recording Pulse Animation */}
  {isRecording && (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute -top-10 left-3 flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      Hive is listening...
    </motion.div>
  )}

  <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isRecording}
                className="p-2 text-xs bg-gray-100 text-gray-600 rounded-lg border-none outline-none cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <option value="en-IN">EN</option>
                <option value="hi-IN">HI</option>
                <option value="mr-IN">MR</option>
              </select>

  <button
    type="button"
    onClick={isRecording ? stopRecording : startRecording}
    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
  >
    {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
  </button>
  
  <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Describe your task..."
    autoComplete="off"
    className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-black focus:outline-none bg-gray-50"
  />
  
  <button 
    type="submit" 
    disabled={loading} 
    className="flex-shrink-0 flex items-center justify-center rounded-lg bg-black p-2 text-white hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
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
