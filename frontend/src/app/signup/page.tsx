"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { User, Mail, Lock, UserPlus, Hexagon, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const { signup, user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Business');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'Admin') router.push('/dashboard/admin');
      else if (user.role === 'Business') router.push('/dashboard/business');
      else router.push('/dashboard/worker');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !role) {
      setError('Please fill in all registration fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError('');
    setSubmitting(true);

    const result = await signup(username, email, password, role);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Registration failed. Email might be in use.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', background: 'var(--bg-canvas)' }}>
      
      {/* Left decorative panel */}
      <div className="hidden md:flex" style={{ width: '50%', background: 'var(--bg-hero-left)', flexDirection: 'column', justifyContent: 'center', padding: '5rem 4.5rem' }}>
        <div style={{ maxWidth: '420px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-primary)', opacity: 0.45, display: 'block', marginBottom: '1.25rem' }}>
            // Get Started
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Join the Hive
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--fg-primary)', opacity: 0.7, lineHeight: 1.65, marginBottom: '2rem' }}>
            Create your account to browse or hire vetted contractors, launch digital assistants, and list job openings instantly.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: '100%', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} className="md:w-1/2">
        <div className="hive-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2.25rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="logo-mark" style={{ margin: '0 auto 1rem' }}>
              <Hexagon className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
              Create your account
            </h2>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              borderRadius: '0.5rem', border: '1px solid rgba(220,38,38,0.2)',
              background: 'rgba(220,38,38,0.05)', padding: '0.75rem 1rem',
              fontSize: '0.8125rem', color: '#dc2626', fontWeight: 600,
              marginBottom: '1.5rem'
            }}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--fg-muted)' }} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Jane Doe"
                  className="hive-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--fg-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="hive-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--fg-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="hive-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRole('Business')}
                  style={{
                    borderRadius: '0.5rem', border: '1.5px solid', padding: '0.75rem 0',
                    fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: role === 'Business' ? 'var(--fg-primary)' : 'rgba(24,24,26,0.12)',
                    background: role === 'Business' ? 'rgba(24,24,26,0.04)' : '#fff',
                    color: role === 'Business' ? 'var(--fg-primary)' : 'var(--fg-muted)'
                  }}
                >
                  Business Owner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Worker')}
                  style={{
                    borderRadius: '0.5rem', border: '1.5px solid', padding: '0.75rem 0',
                    fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: role === 'Worker' ? 'var(--fg-primary)' : 'rgba(24,24,26,0.12)',
                    background: role === 'Worker' ? 'rgba(24,24,26,0.04)' : '#fff',
                    color: role === 'Worker' ? 'var(--fg-primary)' : 'var(--fg-muted)'
                  }}
                >
                  Job Seeker
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Registering...' : 'Sign Up'}
              {!submitting && <UserPlus className="h-4 w-4" />}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--fg-muted)', fontWeight: 500 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent-red)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              Log In <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
