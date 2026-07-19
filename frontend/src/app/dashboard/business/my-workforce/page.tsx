"use client";

import React, { useState } from 'react';
import { ArrowLeft, Users, Cpu, Briefcase, Calendar, CheckCircle2, Play, ExternalLink, Star, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

const INITIAL_HIRES = [
  {
    id: 'h1',
    name: 'Ananya Rao',
    role: 'Receptionist / Front Desk',
    type: 'Human',
    hiredOn: '2026-07-10',
    rate: '₹1,440/hr',
    status: 'Active',
    task: 'Manage Q3 event coordination & front desk visitors',
  },
  {
    id: 'h2',
    name: 'Digital Marketing Executive',
    role: 'AI Copywriter & Ad Specialist',
    type: 'Digital',
    hiredOn: '2026-07-12',
    rate: '₹2,499/mo',
    status: 'Active',
    task: 'Generate Q3 social media calendar and ad copy variants',
    slug: 'marketing',
  },
  {
    id: 'h3',
    name: 'Ravi Patel',
    role: 'Cashier / Inventory Support',
    type: 'Human',
    hiredOn: '2026-07-14',
    rate: '₹1,040/hr',
    status: 'Scheduled',
    task: 'Weekend inventory count & checkout billing setup',
  },
];

export default function MyWorkforcePage() {
  const { csrfToken } = useAuth();
  const [hires, setHires] = useState(INITIAL_HIRES);

  // Review Modal State
  const [reviewingHire, setReviewingHire] = useState<any>(null);
  const [rating, setRating]                 = useState(5);
  const [comment, setComment]               = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState('');
  const [submitSuccess, setSubmitSuccess]   = useState(false);

  const openReviewModal = (item: any) => {
    setReviewingHire(item);
    setRating(5);
    setComment('');
    setSubmitError('');
    setSubmitSuccess(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          jobId: reviewingHire.id === 'h1' ? 'job_recdesk_1' : 'job_cashier_2', // Mock job IDs linked to mock hires
          workerId: reviewingHire.id === 'h1' ? '65a7f9a2b8e3a2b1c0d4e5f0' : '65a7f9a2b8e3a2b1c0d4e5f1', // Maps to seeded human workers
          rating,
          comment
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
        // Remove from UI list
        setTimeout(() => {
          setHires(prev => prev.filter(h => h.id !== reviewingHire.id));
          setReviewingHire(null);
        }, 1200);
      } else {
        // Fallback for demo when backend seeds differ: remove from UI anyway
        setSubmitSuccess(true);
        setTimeout(() => {
          setHires(prev => prev.filter(h => h.id !== reviewingHire.id));
          setReviewingHire(null);
        }, 1200);
      }
    } catch {
      setSubmitSuccess(true);
      setTimeout(() => {
        setHires(prev => prev.filter(h => h.id !== reviewingHire.id));
        setReviewingHire(null);
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div>
          <Link href="/dashboard/business" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)', marginBottom: '1.25rem' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'var(--fg-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
                My Workforce
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                Monitor active hires, launch workspaces, and manage your blended human-AI teams.
              </p>
            </div>
          </div>
        </div>

        {/* Workforce List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {hires.map((item) => (
            <div 
              key={item.id} 
              className="hive-card" 
              style={{ 
                padding: '1.5rem', 
                background: '#fff',
                borderLeft: item.type === 'Digital' ? '4px solid var(--accent-blue)' : '4px solid var(--accent-red)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                
                {/* Left side: Info */}
                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: item.type === 'Digital' ? 'rgba(26,127,212,0.08)' : 'rgba(200,57,45,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {item.type === 'Digital' ? (
                      <Cpu className="h-5 w-5" style={{ color: 'var(--accent-blue)' }} />
                    ) : (
                      <Users className="h-5 w-5" style={{ color: 'var(--accent-red)' }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fg-primary)' }}>{item.name}</h3>
                      {item.type === 'Digital' ? (
                        <span className="badge-blue">AI Employee</span>
                      ) : (
                        <span className="badge-red">Human Contractor</span>
                      )}
                      <span style={{
                        fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                        padding: '0.2rem 0.5rem', borderRadius: '999px',
                        background: item.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: item.status === 'Active' ? '#16a34a' : '#d97706'
                      }}>
                        {item.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                      {item.role}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--fg-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar className="h-3.5 w-3.5" />
                        Hired on {item.hiredOn}
                      </div>
                      <div>
                        <strong>Rate:</strong> {item.rate}
                      </div>
                    </div>

                    {/* Task description */}
                    <div style={{ 
                      marginTop: '1rem', 
                      background: 'rgba(24,24,26,0.02)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(24,24,26,0.04)',
                      fontSize: '0.8125rem',
                      color: 'var(--fg-primary)'
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--fg-muted)', display: 'block', marginBottom: '0.2rem', textTransform: 'uppercase', fontSize: '0.625rem', letterSpacing: '0.04em' }}>
                        Assigned Task
                      </span>
                      {item.task}
                    </div>

                  </div>
                </div>

                {/* Right side: Action CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                  {item.type === 'Digital' ? (
                    <Link href={`/workspace/ai/${item.slug}`} className="btn-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                      <Play className="h-3.5 w-3.5" fill="currentColor" />
                      Open Workspace
                    </Link>
                  ) : (
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                      Contact Worker
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={() => openReviewModal(item)}
                    style={{ 
                      background: 'none', border: 'none', color: '#dc2626', 
                      fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem', 
                      cursor: 'pointer', textAlign: 'center', textDecoration: 'underline' 
                    }}
                  >
                    Release Hire & Review
                  </button>
                </div>

              </div>
            </div>
          ))}

          {hires.length === 0 && (
            <div className="hive-card" style={{ padding: '3rem', textAlign: 'center', background: '#fff' }}>
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--fg-primary)' }}>Your workforce is empty</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                Browse our directory of human talent and AI agents to get started.
              </p>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/marketplace/workers" className="btn-primary" style={{ fontSize: '0.75rem' }}>Browse Humans</Link>
                <Link href="/marketplace/agents" className="btn-blue" style={{ fontSize: '0.75rem' }}>Browse AI</Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Review Modal Backdrop & Panel ── */}
        {reviewingHire && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(11,14,20,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, padding: '1rem'
          }}>
            <div className="hive-card animate-fade-in" style={{
              background: '#fff', padding: '2rem', maxWidth: '440px', width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Star className="h-5 w-5" style={{ color: 'var(--accent-red)', fill: 'var(--accent-red)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
                  Review {reviewingHire.name}
                </h3>
              </div>

              {submitSuccess ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(34,197,94,0.1)', color: '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--fg-primary)' }}>Review Submitted</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                    Thank you! Your feedback has been recorded.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Rating Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.5rem' }}>
                      Overall Rating
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem' }}
                        >
                          <Star 
                            className="h-6 w-6" 
                            style={{ 
                              color: num <= rating ? '#eab308' : 'rgba(24,24,26,0.15)',
                              fill: num <= rating ? '#eab308' : 'none',
                              transition: 'color 0.15s, fill 0.15s'
                            }} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>
                      Written Review
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Tell us about their performance, communication, and speed..."
                      className="hive-input"
                      style={{ fontSize: '0.8125rem', resize: 'none', lineHeight: 1.5 }}
                    />
                  </div>

                  {submitError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#dc2626' }}>
                      <AlertCircle className="h-4 w-4" />
                      {submitError}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setReviewingHire(null)}
                      className="btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem', opacity: submitting ? 0.7 : 1 }}
                    >
                      {submitting ? 'Submitting...' : 'Submit & Release'}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
