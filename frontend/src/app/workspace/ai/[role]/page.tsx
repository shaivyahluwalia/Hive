"use client";

import React, { useState, use, useRef } from 'react';
import { Cpu, Send, Copy, CheckCircle2, Play, AlertCircle, ArrowLeft, Mic, Square } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../../components/AuthContext';

const AGENT_CONFIG: Record<string, {
  title: string;
  desc: string;
  placeholders: string[];
}> = {
  marketing: {
    title: 'Digital Marketing Executive',
    desc: 'Instagram captions, ad copy, product descriptions, email campaigns',
    placeholders: [
      'Write 3 Instagram captions for our new summer coffee blend...',
      'Create ad copy for a shoe sale targeting young professionals...',
      'Write a product description for an organic face wash...',
    ]
  },
  analyst: {
    title: 'Digital Business Analyst',
    desc: 'CSV analysis, sales insights, trend reports, business summaries',
    placeholders: [
      'Summarize sales trends from this monthly data: [paste CSV]...',
      'Write a business performance summary for Q2 2026...',
      'Identify patterns in this customer acquisition data...',
    ]
  },
  documentation: {
    title: 'Digital Documentation Executive',
    desc: 'Proofreading, grammar correction, document rewriting & formatting',
    placeholders: [
      'Proofread and improve this paragraph: [paste text]...',
      'Rewrite this policy document in plain English...',
      'Format this meeting notes into a structured summary...',
    ]
  },
  hr: {
    title: 'Digital HR Executive',
    desc: 'Job descriptions, resume summaries, interview questions, candidate evaluation',
    placeholders: [
      'Write a job description for a Senior React Developer...',
      'Generate 8 interview questions for a Product Manager role...',
      'Summarize this candidate resume into 3 key highlights: [paste]...',
    ]
  },
  sales: {
    title: 'Sales Analysis Agent',
    desc: 'Revenue trends, top products, forecasts — pulled live from sales data',
    placeholders: [
      'What were our top products last month?',
      'Summarize revenue trends for Q2...',
      'Break down sales by region...',
    ]
  },
  design: {
    title: 'Design Agent',
    desc: 'Brand guidelines, asset lookup, layout suggestions',
    placeholders: [
      'What are our brand colors and fonts?',
      'Suggest a layout for a landing page hero section...',
      'Find our logo assets...',
    ]
  },
  'work-management': {
    title: 'Work Management Agent',
    desc: 'Task lists, deadlines, creating new tasks',
    placeholders: [
      'What tasks are open right now?',
      'Create a task: Finalize Q3 report, due next Friday...',
      'What is due this week?',
    ]
  },
  messaging: {
    title: 'Messaging Agent',
    desc: 'Draft and send Slack messages (asks for confirmation before sending)',
    placeholders: [
      'Draft a Slack message to #general about the demo being ready...',
      'Send a reminder to #team about tomorrow\'s standup...',
    ]
  },
};

const REAL_AGENT_ROLES = new Set(['sales', 'design', 'work-management', 'messaging']);

const MOCK_OUTPUTS: Record<string, string> = {
  marketing: `Here are 3 Instagram captions for your summer coffee blend:

☀️ Caption 1 (Casual & Fun):
"Rise & shine with a sip of summer ☕🌞 Our new seasonal blend hits different on a warm morning. Limited edition — get yours before it's gone! #HiveCoffee #SummerVibes"

📸 Caption 2 (Product-focused):
"Introducing our Summer Harvest Blend. Notes of citrus, caramel, and a hint of vanilla — because summer deserves a coffee that tastes like it. Shop the link in bio. 🌿"

💫 Caption 3 (Story-driven):
"The best summer memories start before 9 AM. Our new summer blend is your daily ritual, elevated. What's in your cup this morning? ☕ #SummerBlend #CoffeeCommunity"`,

  analyst: `📊 Business Performance Summary — Q2 2026:
Streamlined for local currency metrics:
• Total Revenue: ₹1,14,24,000 (+18% YoY)
• Avg. Order Value: ₹5,472 (+7% vs Q1)
• Top Region: West (42% of total)

Key Insights:
1. Product Category Shift: Service bookings up 34%, replacing product sales as #1 contributor.
2. Customer Retention: Repeat customer rate improved to 64% (from 51% in Q1).
3. CAC decreased to ₹1,760 per customer after restructuring ad spend to performance channels.

Recommendations:
- Double down on West region with geo-targeted campaigns.
- Upsell subscription model to one-time buyers.
- Reduce spend on display ads, increase referral incentive program.`,

  documentation: `✅ Proofread & Revised Version:

[Original issues corrected: grammar, passive voice, punctuation, clarity]

Revised Document:

This policy outlines the expectations for remote work arrangements across all departments. Employees working remotely must maintain their standard working hours and remain reachable during core business hours (10:00 AM – 4:00 PM, local time).

All remote employees are required to:
- Attend weekly team stand-ups via video call.
- Submit a brief end-of-day progress report to their manager.
- Ensure their workspace meets security and ergonomic standards.

Violations of this policy may result in a review of remote work privileges.`,

  hr: `📋 Job Description: Senior React Developer

About the Role:
We are looking for a Senior React Developer to join our engineering team and lead the development of our consumer-facing web application. You will work closely with Product and Design to ship high-quality features used by thousands of users daily.

Responsibilities:
- Design and build scalable React/Next.js components
- Mentor junior developers and conduct code reviews
- Collaborate with backend teams on API integration
- Champion performance optimization and accessibility

Requirements:
- 4+ years of experience with React and modern JavaScript
- Strong TypeScript skills
- Experience with REST APIs and state management (Redux/Zustand)
- Excellent communication and documentation habits

Interview Questions:
1. Describe a complex performance issue you identified and resolved in a React app.
2. How do you approach component architecture for a large-scale application?
3. Walk me through how you would implement a real-time feature using WebSockets.`,
};

export default function AIWorkspace({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  const { csrfToken } = useAuth();
  const config = AGENT_CONFIG[role] || AGENT_CONFIG['marketing'];
  const isRealAgent = REAL_AGENT_ROLES.has(role);

  const [taskInput, setTaskInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Audio Recording States & Refs
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const leftChannel = useRef<Float32Array[]>([]);
  const recordingLength = useRef<number>(0);

  const placeholder = config.placeholders[0];

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

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
      setError('');
    } catch (err) {
      console.error("Microphone access failed:", err);
      setError("Could not access the microphone. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (!processorRef.current || !audioContextRef.current) return;

    setIsRecording(false);
    setIsProcessingAudio(true);

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
          body: JSON.stringify({ audio: base64String, languageCode: language})
        });
        
        const data = await res.json();
        if (data.transcript) {
          setTaskInput(data.transcript); 
        } else if (data.error) {
          setError(data.error);
        }
      } catch (apiErr) {
        console.error("Backend API Error:", apiErr);
        setError("Transcription failed to connect to backend.");
      } finally {
        setIsProcessingAudio(false);
      }
    };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const message = taskInput.trim();
    setIsGenerating(true);
    setOutput('');
    setError('');

    if (isRealAgent) {
      try {
        const res = await fetch(`/api/agents/${role}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({ message, history }),
        });

        const data = await res.json();

        if (res.ok) {
          setOutput(data.reply);
          setHistory(data.history || []);
          setTaskInput('');
        } else {
          setError(data.error || 'The agent request failed.');
        }
      } catch (err) {
        setError('Could not reach the agent — check that the backend server is running.');
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    setTimeout(() => {
      setIsGenerating(false);
      setOutput(MOCK_OUTPUTS[role] || MOCK_OUTPUTS['marketing']);
    }, 1800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* ── Header ── */}
        <div>
          <Link href="/dashboard/business" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)', marginBottom: '1.25rem' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(26,127,212,0.1)', border: '1px solid rgba(26,127,212,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Cpu className="h-6 w-6" style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
                {config.title}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)', marginTop: '0.2rem' }}>
                {config.desc}
              </p>
            </div>
            <div className="badge-blue" style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              Online
            </div>
          </div>
        </div>

        {/* ── Workspace ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Input */}
          <div className="hive-card" style={{ display: 'flex', flexDirection: 'column', height: '520px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(24,24,26,0.06)', background: 'rgba(24,24,26,0.02)' }}>
              <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Input</h2>
            </div>
            <form onSubmit={handleGenerate} style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                placeholder={isProcessingAudio ? "Transcribing audio..." : placeholder}
                disabled={isProcessingAudio || isGenerating}
                style={{
                  flex: 1, width: '100%', padding: '0.875rem 1rem',
                  borderRadius: '0.5rem', border: '1.5px solid rgba(24,24,26,0.12)',
                  background: '#fafafa', color: 'var(--fg-primary)',
                  fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6,
                  outline: 'none', resize: 'none', transition: 'border-color 0.15s'
                }}
                required
                onFocus={e => (e.target.style.borderColor = 'var(--accent-blue)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(24,24,26,0.12)')}
              />
              
              {/* Voice Toolbar added right above Generate button */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isRecording || isProcessingAudio || isGenerating}
                  style={{
                    padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid rgba(24,24,26,0.12)', 
                    fontSize: '0.8125rem', background: '#fff', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="en-IN">EN</option>
                  <option value="hi-IN">HI</option>
                  <option value="mr-IN">MR</option>
                </select>
                <button
                  type="button"
                  disabled={isProcessingAudio || isGenerating}
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.625rem 1rem', borderRadius: '0.5rem',
                    background: isRecording ? '#dc2626' : '#f4f4f5',
                    color: isRecording ? '#fff' : '#3f3f46',
                    border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                    transition: 'all 0.2s', opacity: (isProcessingAudio || isGenerating) ? 0.5 : 1
                  }}
                >
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? 'Stop Recording' : (isProcessingAudio ? 'Transcribing...' : 'Voice Input')}
                </button>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !taskInput.trim()}
                className="btn-blue"
                style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', justifyContent: 'center', opacity: (isGenerating || !taskInput.trim()) ? 0.5 : 1 }}
              >
                {isGenerating ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" fill="currentColor" />
                    {isRealAgent && history.length > 0 ? 'Send' : 'Generate Output'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="hive-card" style={{ display: 'flex', flexDirection: 'column', height: '520px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(26,127,212,0.12)', background: 'rgba(26,127,212,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Output</h2>
              {output && (
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.75rem', fontWeight: 700,
                    padding: '0.3rem 0.875rem', borderRadius: '0.4rem',
                    background: '#fff', border: '1px solid rgba(26,127,212,0.2)',
                    color: 'var(--accent-blue)', cursor: 'pointer', transition: 'background 0.15s'
                  }}
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
              {error ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <AlertCircle className="h-10 w-10" style={{ color: 'var(--accent-red, #dc2626)' }} />
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-red, #dc2626)', textAlign: 'center', maxWidth: '320px' }}>
                    {error}
                  </p>
                </div>
              ) : output ? (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--fg-primary)' }}>
                  {output}
                </pre>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', opacity: 0.35 }}>
                  <AlertCircle className="h-10 w-10" style={{ color: 'var(--fg-muted)' }} />
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-muted)' }}>
                    Awaiting task input
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}