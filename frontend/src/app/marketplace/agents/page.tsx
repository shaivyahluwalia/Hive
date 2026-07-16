"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Cpu, Zap, Star, Loader2, Play, CheckCircle, Search, X } from 'lucide-react';
import Link from 'next/link';

const FALLBACK_AGENTS = [
  {
    _id: 'a1', slug: 'marketing',
    name: 'Digital Marketing Executive',
    category: 'Marketing',
    description: 'Creates Instagram captions, ad copy, product descriptions, and email campaigns tailored to your brand voice.',
    price: 2499, speed: 'Instant', accuracy: '94%', rating: 4.9,
  },
  {
    _id: 'a2', slug: 'analyst',
    name: 'Digital Business Analyst',
    category: 'Analytics',
    description: 'Analyses CSV/Excel data, generates sales insights, trend reports, and concise business performance summaries.',
    price: 4199, speed: '< 1 min', accuracy: '91%', rating: 4.8,
  },
  {
    _id: 'a3', slug: 'documentation',
    name: 'Digital Documentation Executive',
    category: 'Documentation',
    description: 'Proofreads and rewrites documents, corrects grammar, restructures formatting, and produces polished final drafts.',
    price: 2499, speed: 'Instant', accuracy: '97%', rating: 4.9,
  },
  {
    _id: 'a4', slug: 'hr',
    name: 'Digital HR Executive',
    category: 'HR & Recruitment',
    description: 'Writes job descriptions, summarises resumes, generates interview questions, and evaluates candidates objectively.',
    price: 3349, speed: '< 1 min', accuracy: '93%', rating: 4.7,
  },
];

const CATEGORIES = ['All', 'Marketing', 'Analytics', 'Documentation', 'HR & Recruitment'];

export default function AgentsMarketplace() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<typeof FALLBACK_AGENTS>([]);
  const [loading, setLoading] = useState(true);
  const [deployedIds, setDeployedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await fetch('/api/marketplace/agents');
        if (res.ok) {
          const data = await res.json();
          if (data.agents?.length > 0) {
            const mapped = data.agents.map((a: any, i: number) => ({
              ...a,
              slug: FALLBACK_AGENTS[i % FALLBACK_AGENTS.length]?.slug || 'marketing'
            }));
            setAgents(mapped);
          } else throw new Error('empty');
        } else throw new Error('api error');
      } catch {
        setAgents(FALLBACK_AGENTS);
      } finally {
        setLoading(false);
      }
    };
    loadAgents();
  }, []);

  const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    Marketing: { bg: 'rgba(239,68,68,0.08)', text: '#dc2626' },
    Analytics: { bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
    Documentation: { bg: 'rgba(139,92,246,0.1)', text: '#7c3aed' },
    'HR & Recruitment': { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  };

  const filtered = agents.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    const matchesCat = activeCategory === 'All' || a.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.75rem' }}>// AI-Powered Workforce</span>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>AI Digital Employees</h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--fg-muted)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Deploy pre-trained digital agents for marketing, analytics, documentation, and HR — instantly, at a flat monthly rate.
          </p>
        </div>

        {/* Search + Category filter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {/* Search input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
            <Search style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, category, or skill..."
              className="hive-input"
              style={{ paddingLeft: '2.5rem', paddingRight: search ? '2.25rem' : '0.9rem', fontSize: '0.875rem', width: '100%' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'flex' }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.3rem 0.875rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.15s',
                  background: activeCategory === cat ? 'var(--fg-primary)' : 'rgba(24,24,26,0.06)',
                  color: activeCategory === cat ? '#fff' : 'var(--fg-muted)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent-blue)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--fg-muted)' }}>
            <Search style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--fg-primary)' }}>No agents found</p>
            <p style={{ fontSize: '0.8125rem', marginTop: '0.3rem' }}>Try a different keyword or category</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {filtered.map(agent => {
              const cat = CATEGORY_COLORS[agent.category] || { bg: 'rgba(26,127,212,0.08)', text: 'var(--accent-blue)' };
              const deployed = deployedIds.includes(agent._id);
              return (
                <div key={agent._id} className="hive-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

                  {/* Category + Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.25rem 0.7rem', borderRadius: '999px', background: cat.bg, color: cat.text }}>
                      {agent.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(234,179,8,0.1)', color: '#a16207' }}>
                      <Star className="h-3.5 w-3.5" style={{ fill: 'currentColor' }} />
                      {agent.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* Icon + Name */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      background: 'var(--tint-digital)', border: '1px solid var(--border-digital)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Cpu className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--fg-primary)', lineHeight: 1.25, fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>{agent.name}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>{agent.description}</p>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid rgba(24,24,26,0.06)', borderBottom: '1px solid rgba(24,24,26,0.06)', padding: '0.875rem 0' }}>
                    {[
                      { icon: Zap, label: 'Speed', value: agent.speed, color: '#f59e0b' },
                      { icon: Star, label: 'Accuracy', value: agent.accuracy, color: '#3b82f6' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>{s.label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-primary)' }}>
                          <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price + CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-muted)' }}>Flat Rate</div>
                      <div style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", lineHeight: 1.1, marginTop: '0.1rem' }}>
                        ₹{agent.price.toLocaleString('en-IN')}<span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--fg-muted)' }}>/mo</span>
                      </div>
                    </div>

                    {user && user.role === 'Business' ? (
                      <Link
                        href={`/workspace/ai/${(agent as any).slug || 'marketing'}`}
                        onClick={() => setDeployedIds(p => [...p, agent._id])}
                        className="btn-blue"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}
                      >
                        {deployed ? <><CheckCircle className="h-3.5 w-3.5" /> Deployed</> : <><Play className="h-3.5 w-3.5" fill="currentColor" /> Deploy</>}
                      </Link>
                    ) : (
                      <Link href="/signup" className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.55rem 1.125rem' }}>
                        Deploy
                      </Link>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
