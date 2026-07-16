"use client";

import React, { useState } from 'react';
import { Search, Filter, Star, Briefcase, MapPin, Loader2, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

// Fallback data for when API is unavailable
const FALLBACK_WORKERS = [
  { _id: '1', username: 'Ananya Rao', skills: ['Hospitality', 'Customer Service', 'POS'], location: 'Mumbai', hourlyPrice: 14, experience: '2+ yrs Experience', rating: 4.8, availability: 'Available', avatar: '' },
  { _id: '2', username: 'Ravi Patel', skills: ['Cashier', 'Retail Ops', 'Inventory'], location: 'Ahmedabad', hourlyPrice: 13, experience: '1+ yr Experience', rating: 4.7, availability: 'Available', avatar: '' },
  { _id: '3', username: 'Priya Mehta', skills: ['Reception', 'Scheduling', 'MS Office'], location: 'Pune', hourlyPrice: 18, experience: '3+ yrs Experience', rating: 4.9, availability: 'Available', avatar: '' },
  { _id: '4', username: 'Carlos Rivera', skills: ['Delivery', 'Logistics', 'Navigation'], location: 'Bangalore', hourlyPrice: 16, experience: '2+ yrs Experience', rating: 4.6, availability: 'Available', avatar: '' },
  { _id: '5', username: 'Fatima Al-Hassan', skills: ['Sales', 'CRM', 'B2C'], location: 'Hyderabad', hourlyPrice: 20, experience: '4+ yrs Experience', rating: 5.0, availability: 'Available', avatar: '' },
  { _id: '6', username: 'Tom Bradley', skills: ['Admin', 'Organization', 'Coordination'], location: 'Chennai', hourlyPrice: 15, experience: '2+ yrs Experience', rating: 4.5, availability: 'On Request', avatar: '' },
];

export default function WorkersMarketplace() {
  const { user } = useAuth();
  const [skillSearch, setSkillSearch] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filtered = FALLBACK_WORKERS.filter(w => {
    if (skillSearch && !w.skills.some(s => s.toLowerCase().includes(skillSearch.toLowerCase()))) return false;
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
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Max Rate ($/hr)</label>
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
                      ${w.hourlyPrice}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--fg-muted)' }}>/hr</span>
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

        </div>
      </div>
    </div>
  );
}
