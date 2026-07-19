"use client";

import React, { useState, useRef } from 'react';
import { Search, Filter, Star, Briefcase, MapPin, Loader2, ArrowRight, User, X, Mic, Square } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

// Fallback data for when API is unavailable
const FALLBACK_WORKERS = [
  { _id: '1', username: 'Ananya Rao', skills: ['Hospitality', 'Customer Service', 'POS'], location: 'Mumbai', hourlyPrice: 200, experience: '2+ yrs Experience', rating: 4.8, availability: 'Available', avatar: '' },
  { _id: '2', username: 'Ravi Patel', skills: ['Cashier', 'Retail Ops', 'Inventory'], location: 'Ahmedabad', hourlyPrice: 190, experience: '1+ yr Experience', rating: 4.7, availability: 'Available', avatar: '' },
  { _id: '3', username: 'Priya Mehta', skills: ['Reception', 'Scheduling', 'MS Office'], location: 'Pune', hourlyPrice: 210, experience: '3+ yrs Experience', rating: 4.9, availability: 'Available', avatar: '' },
  { _id: '4', username: "Carlos D'Souza", skills: ['Delivery', 'Logistics', 'Navigation'], location: 'Bangalore', hourlyPrice: 200, experience: '2+ yrs Experience', rating: 4.6, availability: 'Available', avatar: '' },
  { _id: '5', username: 'Fatima Al-Hassan', skills: ['Sales', 'CRM', 'B2C'], location: 'Hyderabad', hourlyPrice: 170, experience: '4+ yrs Experience', rating: 5.0, availability: 'Available', avatar: '' },
  { _id: '6', username: 'Tom Bradley', skills: ['Admin', 'Organization', 'Coordination'], location: 'Chennai', hourlyPrice: 350, experience: '2+ yrs Experience', rating: 4.5, availability: 'On Request', avatar: '' },
];

export default function WorkersMarketplace() {
  const { user, csrfToken } = useAuth();
  
  // --- EXISTING FILTERS ---
  const [skillSearch, setSkillSearch] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // --- NEW GLOBAL VOICE SEARCH STATES ---
  const [globalSearch, setGlobalSearch] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  
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
        const res = await fetch('http://127.0.0.1:5000/api/chat/voice-transcribe', {          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken 
          },
          body: JSON.stringify({ 
            audio: base64String,
            languageCode: language
          })
        });
        
        const data = await res.json();
        if (data.transcript) {
          setGlobalSearch(data.transcript); 
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

  // --- FILTERING LOGIC ---
  const filtered = FALLBACK_WORKERS.filter(w => {
    // 1. Global Voice/Text Search (with two-way matching)
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      const matchesGlobal = 
        w.username.toLowerCase().includes(q) || 
        w.location.toLowerCase().includes(q) || 
        w.skills.some(s => {
          const skill = s.toLowerCase();
          // Check if skill is in the query OR query is in the skill
          return skill.includes(q) || q.includes(skill); 
        });
      if (!matchesGlobal) return false;
    }
    
    // 2. Sidebar Filters (with two-way matching)
    if (skillSearch) {
      const sq = skillSearch.toLowerCase();
      const matchesSkill = w.skills.some(s => {
        const skill = s.toLowerCase();
        return skill.includes(sq) || sq.includes(skill);
      });
      if (!matchesSkill) return false;
    }
    
    if (maxRate && w.hourlyPrice > parseFloat(maxRate)) return false;
    if (minRating && w.rating < parseFloat(minRating)) return false;
    return true;
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.75rem' }}>// Vetted Human Talent</span>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>Human Workforce</h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--fg-muted)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Hire skilled professionals for hospitality, retail, admin, sales, and operations.
          </p>
        </div>

        {/* Global Search + Voice */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', width: '100%', maxWidth: '640px', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
            
            {/* Search input */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder={voiceLoading ? "Listening & Transcribing..." : "Search by name, skill, or location..."}
                className="hive-input"
                style={{ paddingLeft: '2.5rem', paddingRight: globalSearch ? '2.25rem' : '0.9rem', fontSize: '0.875rem', width: '100%', opacity: voiceLoading ? 0.7 : 1 }}
                disabled={voiceLoading}
              />
              {globalSearch && !voiceLoading && (
                <button
                  onClick={() => setGlobalSearch('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'flex' }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording || voiceLoading}
              style={{
                padding: '0.6rem 0.5rem', fontSize: '0.75rem', borderRadius: '8px', 
                border: '1px solid var(--border-digital)', background: '#fff', 
                color: 'var(--fg-primary)', cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="en-IN">EN</option>
              <option value="hi-IN">HI</option>
              <option value="mr-IN">MR</option>
            </select>

            {/* Mic Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={voiceLoading}
              style={{
                padding: '0.65rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: isRecording ? '#ef4444' : 'var(--fg-primary)', 
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', opacity: voiceLoading ? 0.5 : 1
              }}
            >
              {isRecording ? <Square style={{ width: '16px', height: '16px' }} /> : <Mic style={{ width: '16px', height: '16px' }} />}
            </button>
            
            {/* Recording Pulse Animation Overlay */}
            {isRecording && (
              <div style={{ position: 'absolute', top: '-30px', right: '0', display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: 'bold' }}>
                <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                Listening in {language === 'en-IN' ? 'English' : language === 'hi-IN' ? 'Hindi' : 'Marathi'}...
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── Filter Panel ── */}
          <div className="hive-card" style={{ padding: '1.25rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(24,24,26,0.06)', marginBottom: '1rem' }}>
              <Filter className="h-3.5 w-3.5" style={{ color: 'var(--accent-red)' }} />
              Filters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Search Skill</label>
                <input type="text" value={skillSearch} onChange={e => setSkillSearch(e.target.value)} placeholder="e.g. Sales, Admin..." className="hive-input" style={{ fontSize: '0.8125rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Max Rate (₹/hr)</label>
                <input type="number" value={maxRate} onChange={e => setMaxRate(e.target.value)} placeholder="e.g. 20" className="hive-input" style={{ fontSize: '0.8125rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Min Rating</label>
                <select value={minRating} onChange={e => setMinRating(e.target.value)} className="hive-input" style={{ fontSize: '0.8125rem' }}>
                  <option value="">Any</option>
                  <option value="4.9">4.9★+</option>
                  <option value="4.7">4.7★+</option>
                  <option value="4.5">4.5★+</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-muted)' }}>Remote Only</span>
                <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              </div>
            </div>
          </div>

          {/* ── Worker Cards ── */}
          {filtered.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--fg-muted)', width: '100%' }}>
               <Search style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', opacity: 0.4 }} />
               <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--fg-primary)' }}>No professionals found</p>
               <p style={{ fontSize: '0.8125rem', marginTop: '0.3rem' }}>Try adjusting your search criteria or voice prompt</p>
             </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
              {filtered.map(w => (
                <div key={w._id} className="hive-card" style={{ padding: '1.375rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: 'var(--tint-human)', border: '2px solid var(--border-human)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <User className="h-5 w-5" style={{ color: 'var(--accent-red)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--fg-primary)' }}>{w.username}</div>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.15rem' }}>{w.experience}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(234,179,8,0.1)', color: '#a16207', flexShrink: 0 }}>
                      <Star className="h-3.5 w-3.5" style={{ fill: 'currentColor' }} />
                      {w.rating.toFixed(1)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', color: 'var(--fg-muted)' }}>
                    <MapPin className="h-3.5 w-3.5" style={{ flexShrink: 0 }} />
                    {w.location}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {w.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(24,24,26,0.06)', paddingTop: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>Hourly Rate</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", lineHeight: 1.1, marginTop: '0.15rem' }}>
                       ₹{w.hourlyPrice.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--fg-muted)' }}>/hr</span>
                      </div>
                    </div>
                    {user && user.role === 'Business' ? (
                      <Link href="/payment" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.55rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        Hire <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link href="/signup" className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.55rem 1.125rem' }}>
                        Hire
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}