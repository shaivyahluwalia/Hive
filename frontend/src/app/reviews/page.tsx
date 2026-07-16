"use client";

import React from 'react';
import { Star, Cpu, User, Sparkles, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: "Sarah Jenkins",
    role: "Founder",
    company: "Sweet Crumbs Bakery",
    type: "Hybrid Hire",
    rating: 5,
    avatar: "S",
    review:
      "Hive helped us reduce our branding cost by 70% while combining a human designer with Graphic AI. The workflow was smooth and the results exceeded our expectations.",
  },
  {
    name: "David Vance",
    role: "Product Manager",
    company: "ByteWorks Inc.",
    type: "AI Hire",
    rating: 5,
    avatar: "D",
    review:
      "Our engineering team now ships features twice as fast after integrating Hive AI Employees. It's like hiring an extra developer who never sleeps.",
  },
  {
    name: "Marcus Aurelius",
    role: "CEO",
    company: "GrowFast Agency",
    type: "Hybrid Hire",
    rating: 5,
    avatar: "M",
    review:
      "Everything from hiring freelancers to deploying AI happens inside one dashboard. Hive completely changed how we build our teams.",
  },
  {
    name: "Elena Rostova",
    role: "Creative Lead",
    company: "Apex Creators",
    type: "Human Hire",
    rating: 5,
    avatar: "E",
    review:
      "Hiring talented creatives has never been this easy. Beautiful UI, quick onboarding, and excellent support throughout.",
  },
];

const TYPE_CONFIG: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string; borderColor: string }> = {
  'AI Hire':     { bg: 'rgba(74,107,130,0.08)',  text: '#4a6b82', icon: <Cpu className="h-3.5 w-3.5"      />, label: 'AI HIRE',     borderColor: '#4a6b82' },
  'Human Hire':  { bg: 'rgba(168,61,49,0.08)',   text: '#a83d31', icon: <User className="h-3.5 w-3.5"     />, label: 'HUMAN HIRE',  borderColor: '#a83d31' },
  'Hybrid Hire': { bg: 'rgba(140,75,123,0.08)',  text: '#8c4b7b', icon: <Sparkles className="h-3.5 w-3.5" />, label: 'HYBRID HIRE', borderColor: '#8c4b7b' },
};

export default function ReviewsPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* Header — identical structure to agents page */}
        <div style={{ textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginBottom: '0.75rem' }}>
            // Customer Stories
          </span>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
            Reviews & Feedback
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--fg-muted)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            See how businesses are leveraging human contractors and AI digital employees to hit their goals — rated by real users.
          </p>
        </div>

        {/* Card grid — identical column template to agents page */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
          {REVIEWS.map((r, i) => {
            const cfg = TYPE_CONFIG[r.type] ?? TYPE_CONFIG['Hybrid Hire'];
            return (
              <div key={i} className="hive-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

                {/* Row 1 — hire-type pill + star rating (mirrors: category + rating) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', padding: '0.25rem 0.7rem',
                    borderRadius: '999px', background: cfg.bg, color: cfg.text,
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.75rem', fontWeight: 700,
                    padding: '0.2rem 0.5rem', borderRadius: '6px',
                    background: 'rgba(234,179,8,0.1)', color: '#a16207'
                  }}>
                    <Star className="h-3.5 w-3.5" style={{ fill: 'currentColor' }} />
                    {r.rating}.0
                  </div>
                </div>

                {/* Row 2 — avatar + reviewer name (mirrors: icon + name) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: cfg.bg,
                    border: `1px solid ${cfg.borderColor}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 800, color: cfg.text,
                    fontFamily: "var(--font-outfit,'Outfit',sans-serif)"
                  }}>
                    {r.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--fg-primary)', lineHeight: 1.25, fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
                      {r.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.2rem', fontWeight: 500 }}>
                      {r.role} · {r.company}
                    </div>
                  </div>
                </div>

                {/* Row 3 — review quote (mirrors: description) */}
                <p style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                  "{r.review}"
                </p>

                {/* Row 4 — 2-col stat strip (mirrors: Speed / Accuracy) */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                  borderTop: '1px solid rgba(24,24,26,0.06)',
                  borderBottom: '1px solid rgba(24,24,26,0.06)',
                  padding: '0.875rem 0'
                }}>
                  {[
                    { label: 'Hire Type', value: r.type },
                    { label: 'Verified', value: 'Yes ✓' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-primary)', marginTop: '0.2rem' }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row 5 — star rating display (mirrors: price + CTA) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--fg-muted)' }}>
                      Rating
                    </div>
                    <div style={{ display: 'flex', gap: '0.15rem', marginTop: '0.3rem' }}>
                      {Array.from({ length: r.rating }).map((_, idx) => (
                        <Star key={idx} className="h-4 w-4" style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(34,197,94,0.08)',
                    color: '#16a34a',
                    border: '1px solid rgba(34,197,94,0.15)'
                  }}>
                    Verified Review
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
