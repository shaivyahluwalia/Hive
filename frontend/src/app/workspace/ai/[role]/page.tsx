"use client";

import React, { useState, use } from 'react';
import { Cpu, Send, Copy, CheckCircle2, Play, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
};

const MOCK_OUTPUTS: Record<string, string> = {
  marketing: `Here are 3 Instagram captions for your summer coffee blend:

☀️ Caption 1 (Casual & Fun):
"Rise & shine with a sip of summer ☕🌞 Our new seasonal blend hits different on a warm morning. Limited edition — get yours before it's gone! #HiveCoffee #SummerVibes"

📸 Caption 2 (Product-focused):
"Introducing our Summer Harvest Blend. Notes of citrus, caramel, and a hint of vanilla — because summer deserves a coffee that tastes like it. Shop the link in bio. 🌿"

💫 Caption 3 (Story-driven):
"The best summer memories start before 9 AM. Our new summer blend is your daily ritual, elevated. What's in your cup this morning? ☕ #SummerBlend #CoffeeCommunity"`,

  analyst: `📊 Business Performance Summary — Q2 2026:

Revenue Overview:
• Total Revenue: $142,800 (+18% YoY)
• Avg. Order Value: $68.40 (+7% vs Q1)
• Top Region: West (42% of total)

Key Insights:
1. Product Category Shift: Service bookings up 34%, replacing product sales as #1 contributor.
2. Customer Retention: Repeat customer rate improved to 64% (from 51% in Q1).
3. CAC decreased to $22 per customer after restructuring ad spend to performance channels.

Recommendations:
• Double down on West region with geo-targeted campaigns.
• Upsell subscription model to one-time buyers.
• Reduce spend on display ads, increase referral incentive program.`,

  documentation: `✅ Proofread & Revised Version:

[Original issues corrected: grammar, passive voice, punctuation, clarity]

Revised Document:

This policy outlines the expectations for remote work arrangements across all departments. Employees working remotely must maintain their standard working hours and remain reachable during core business hours (10:00 AM – 4:00 PM, local time).

All remote employees are required to:
• Attend weekly team stand-ups via video call.
• Submit a brief end-of-day progress report to their manager.
• Ensure their workspace meets security and ergonomic standards.

Violations of this policy may result in a review of remote work privileges.`,

  hr: `📋 Job Description: Senior React Developer

About the Role:
We are looking for a Senior React Developer to join our engineering team and lead the development of our consumer-facing web application. You will work closely with Product and Design to ship high-quality features used by thousands of users daily.

Responsibilities:
• Design and build scalable React/Next.js components
• Mentor junior developers and conduct code reviews
• Collaborate with backend teams on API integration
• Champion performance optimization and accessibility

Requirements:
• 4+ years of experience with React and modern JavaScript
• Strong TypeScript skills
• Experience with REST APIs and state management (Redux/Zustand)
• Excellent communication and documentation habits

Interview Questions:
1. Describe a complex performance issue you identified and resolved in a React app.
2. How do you approach component architecture for a large-scale application?
3. Walk me through how you would implement a real-time feature using WebSockets.`,
};

export default function AIWorkspace({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  const config = AGENT_CONFIG[role] || AGENT_CONFIG['marketing'];

  const [taskInput, setTaskInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const placeholder = config.placeholders[0];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setIsGenerating(true);
    setOutput('');
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
                placeholder={placeholder}
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
                    Generate Output
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
              {output ? (
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
