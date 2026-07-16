"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Search, Mic, ArrowRight, Play, Briefcase, Users, Cpu, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const HUMAN_ROLES = [
  { title: 'Waiter / Server', rate: '$14/hr', avail: 'Available Today' },
  { title: 'Cashier', rate: '$13/hr', avail: 'Available Today' },
  { title: 'Receptionist', rate: '$18/hr', avail: 'Available Tomorrow' },
  { title: 'Cleaner', rate: '$12/hr', avail: 'Available Today' },
  { title: 'Delivery Executive', rate: '$16/hr', avail: 'Available Today' },
  { title: 'Salesperson', rate: '$20/hr', avail: 'On Request' },
];

const AI_AGENTS = [
  {
    title: 'Digital Marketing Executive',
    desc: 'Instagram captions, ad copy, product descriptions, email campaigns',
    price: '$29/mo',
    slug: 'marketing',
  },
  {
    title: 'Digital Business Analyst',
    desc: 'CSV analysis, sales insights, trend reports, business summaries',
    price: '$49/mo',
    slug: 'analyst',
  },
  {
    title: 'Digital Documentation Executive',
    desc: 'Proofreading, grammar correction, document rewriting & formatting',
    price: '$29/mo',
    slug: 'documentation',
  },
  {
    title: 'Digital HR Executive',
    desc: 'Job descriptions, resume summaries, interview questions, candidate evaluation',
    price: '$39/mo',
    slug: 'hr',
  },
];

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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
                placeholder="Describe what you need — e.g. 'I need someone to manage Instagram'"
                className="hive-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem', fontSize: '0.9375rem' }}
              />
              <button
                type="button"
                title="Voice search"
                style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}
              >
                <Mic className="h-4 w-4" />
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
              {AI_AGENTS.map(agent => (
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
                  <Link href={`/workspace/ai/${agent.slug}`} className="btn-blue" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Play className="h-3.5 w-3.5" fill="currentColor" />
                    Launch
                  </Link>
                </div>
              ))}
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
