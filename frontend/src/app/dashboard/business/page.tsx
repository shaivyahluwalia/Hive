"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Search, Mic, ArrowRight, Play, Briefcase, Users, Cpu, ChevronRight, Square, Loader2 } from 'lucide-react';
import Link from 'next/link';

const HUMAN_ROLES = [
  { title: 'Waiter / Server', rate: '₹1,100/hr', avail: 'Available Today' },
  { title: 'Cashier', rate: '₹1,000/hr', avail: 'Available Today' },
  { title: 'Receptionist', rate: '₹1,400/hr', avail: 'Available Tomorrow' },
  { title: 'Cleaner', rate: '₹900/hr', avail: 'Available Today' },
  { title: 'Delivery Executive', rate: '₹1,200/hr', avail: 'Available Today' },
  { title: 'Salesperson', rate: '₹1,600/hr', avail: 'On Request' },
];

const AI_AGENTS = [
  {
    title: 'Digital Marketing Executive',
    desc: 'Instagram captions, ad copy, product descriptions, email campaigns',
    price: '₹2,499/mo',
    slug: 'marketing',
  },
  {
    title: 'Digital Business Analyst',
    desc: 'CSV analysis, sales insights, trend reports, business summaries',
    price: '₹4,199/mo',
    slug: 'analyst',
  },
  {
    title: 'Digital Documentation Executive',
    desc: 'Proofreading, grammar correction, document rewriting & formatting',
    price: '₹2,499/mo',
    slug: 'documentation',
  },
  {
    title: 'Digital HR Executive',
    desc: 'Job descriptions, resume summaries, interview questions, candidate evaluation',
    price: '₹3,349/mo',
    slug: 'hr',
  },
];

export default function BusinessDashboard() {
  const { user, csrfToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // --- VOICE SEARCH STATES & REFS ---
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const leftChannel = useRef<Float32Array[]>([]);
  const recordingLength = useRef<number>(0);

  // --- VOICE SEARCH LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
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
    setVoiceLoading(true);

    processorRef.current.disconnect();
    audioContextRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const flattened = new Float32Array(recordingLength.current);
    let offset = 0;
    for (let i = 0; i < leftChannel.current.length; i++) {
      flattened.set(leftChannel.current[i], offset);
      offset += leftChannel.current[i].length;
    }

    const buffer = new ArrayBuffer(44 + flattened.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + flattened.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 16000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, flattened.length * 2, true);

    let index = 44;
    for (let i = 0; i < flattened.length; i++) {
      const s = Math.max(-1, Math.min(1, flattened[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      index += 2;
    }

    const audioBlob = new Blob([view], { type: 'audio/wav' });
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
          body: JSON.stringify({ 
            audio: base64String,
            languageCode: 'en-IN'
          })
        });
        
        const data = await res.json();
        if (data.transcript) {
          setSearchQuery(data.transcript); 
        }
      } catch (apiErr) {
        console.error("Backend API Error:", apiErr);
      } finally {
        setVoiceLoading(false);
      }
    };
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };


  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ── Greeting ── */}
        <header>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.35rem' }}>
            Business Dashboard
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
            Welcome back, {user?.username || 'Business Owner'} 👋
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--fg-muted)', marginTop: '0.35rem' }}>
            What are you hiring for today?
          </p>
        </header>

        {/* ── Search Bar ── */}
        <div className="hive-card" style={{ padding: '1.5rem 1.75rem' }}>
          <form
            onSubmit={e => { e.preventDefault(); }}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--fg-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={voiceLoading ? "Transcribing audio..." : isRecording ? "Listening..." : "Describe what you need — e.g. 'I need someone to manage Instagram'"}
                className="hive-input"
                disabled={voiceLoading}
                style={{ 
                  paddingLeft: '2.5rem', 
                  paddingRight: '3rem', 
                  fontSize: '0.9375rem',
                  opacity: voiceLoading ? 0.6 : 1,
                  borderColor: isRecording ? '#ef4444' : 'var(--border-digital)'
                }}
              />
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={voiceLoading}
                title="Voice search"
                style={{ 
                  position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', 
                  background: isRecording ? '#ef4444' : 'none', 
                  border: 'none', cursor: 'pointer', 
                  color: isRecording ? '#fff' : 'var(--fg-muted)',
                  padding: '0.4rem', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {voiceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <Square className="h-4 w-4" fill="currentColor" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
            <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-muted)' }}>Quick search:</span>
            {['Social Media Manager', 'Copywriter', 'Data Entry', 'Receptionist', 'Customer Support'].map(s => (
              <button
                key={s}
                onClick={() => setSearchQuery(s)}
                style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.75rem',
                  borderRadius: '999px', border: '1px solid rgba(24,24,26,0.1)',
                  background: 'rgba(24,24,26,0.03)', cursor: 'pointer', color: 'var(--fg-primary)',
                  transition: 'background 0.15s'
                }}
                className="hover:bg-black/5"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Workforce Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '2rem' }}>

          {/* Human Workforce */}
          <section className="human-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'rgba(200,57,45,0.12)', border: '1px solid rgba(200,57,45,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Users className="h-5 w-5" style={{ color: 'var(--accent-red)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg-primary)' }}>Human Workforce</h2>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', marginTop: '0.1rem' }}>Vetted human professionals</p>
                </div>
              </div>
              <Link href="/marketplace/workers" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {HUMAN_ROLES.map(role => (
                <div key={role.title} style={{
                  background: '#fff', border: '1px solid var(--border-human)',
                  borderRadius: '0.625rem', padding: '0.875rem 1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'box-shadow 0.15s'
                }}
                  className="hive-card"
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>{role.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', marginTop: '0.2rem' }}>
                      <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{role.rate}</span>
                      {' · '}{role.avail}
                    </div>
                  </div>
                  <Link href="/payment" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                    Hire
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Digital Employees */}
          <section className="digital-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'rgba(26,127,212,0.12)', border: '1px solid rgba(26,127,212,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Cpu className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--fg-primary)' }}>Digital Employees</h2>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', marginTop: '0.1rem' }}>Powered by AI — deploy instantly</p>
                </div>
              </div>
              <Link href="/marketplace/agents" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {AI_AGENTS.map(agent => {
                const numericPrice = agent.price.replace(/\D/g, '');
                const paymentUrl = `/payment?agentId=${agent.slug}&name=${encodeURIComponent(agent.title)}&price=${numericPrice}&slug=${agent.slug}`;

                return (
                  <div key={agent.slug} style={{
                    background: '#fff', border: '1px solid var(--border-digital)',
                    borderRadius: '0.625rem', padding: '0.875rem 1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem'
                  }}
                    className="hive-card"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>{agent.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {agent.desc}
                      </div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
                        {agent.price} · Instant
                      </div>
                    </div>
                    <Link href={paymentUrl} className="btn-blue" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Play className="h-3.5 w-3.5" fill="currentColor" />
                      Launch
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* ── My Workforce CTA ── */}
        <div className="hive-card" style={{
          padding: '1.5rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          background: 'var(--fg-primary)'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
              Manage Your Workforce
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
              View active hires, track ongoing tasks, and review payments.
            </p>
          </div>
          <Link href="/dashboard/business/my-workforce" style={{
            background: '#fff', color: 'var(--fg-primary)',
            padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
            fontSize: '0.8125rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            flexShrink: 0, whiteSpace: 'nowrap'
          }}>
            <Briefcase className="h-4 w-4" />
            My Workforce
          </Link>
        </div>

      </div>
    </div>
  );
}