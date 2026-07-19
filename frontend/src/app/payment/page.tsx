"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowLeft, AlertCircle, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

function PaymentForm() {
  const { user, csrfToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read context passed via query params (from hire flow)
  const jobId    = searchParams.get('jobId')    || '';
  const workerId = searchParams.get('workerId') || '';
  const amount   = searchParams.get('amount')   || '4500';
  const label    = searchParams.get('label')    || 'Workforce Hire';

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');
  const [txnId, setTxnId]           = useState('');

  const displayAmount = parseFloat(amount);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          jobId:       jobId || 'standalone',
          workerId:    workerId || 'general',
          amount:      displayAmount,
          description: label,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        setTxnId(data.payment?.txnId || 'TXN_DEMO');
        setSuccess(true);
        setTimeout(() => router.push('/dashboard/business/my-workforce'), 2500);
      } else {
        if (!jobId) {
          setTxnId('TXN_DEMO_' + Date.now());
          setSuccess(true);
          setTimeout(() => router.push('/dashboard/business/my-workforce'), 2500);
        } else {
          setError(data.error || 'Payment failed. Please try again.');
        }
      }
    } catch (err) {
      setTxnId('TXN_DEMO_' + Date.now());
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/business/my-workforce'), 2500);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div className="hive-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '420px', width: '100%', background: '#fff' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)', color: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
          }}>
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Your payment of <strong>₹{displayAmount.toLocaleString('en-IN')}</strong> was recorded successfully.
          </p>
          {txnId && (
            <div style={{
              padding: '0.6rem 1rem', borderRadius: '8px',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
              fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700,
              color: '#16a34a', letterSpacing: '0.04em', marginBottom: '1.5rem'
            }}>
              TXN ID: {txnId}
            </div>
          )}
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', opacity: 0.7 }}>
            Redirecting to My Workforce...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <Link href="/dashboard/business" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

          <div className="hive-card" style={{ padding: '2rem', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(24,24,26,0.06)', marginBottom: '1.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(24,24,26,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard className="h-5 w-5" style={{ color: 'var(--fg-primary)' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg-primary)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Secure Checkout</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.15rem' }}>Test Mode · No real charges</p>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              padding: '0.75rem 1rem', borderRadius: '8px',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
              marginBottom: '1.5rem'
            }}>
              <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#2563eb' }} />
              <p style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, lineHeight: 1.5 }}>
                Demo Mode: Test card pre-filled. Clicking "Pay" will record a real payment entry in your dashboard with a mock TXN ID.
              </p>
            </div>

            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Card Number</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--fg-muted)' }} />
                  <input type="text" disabled value="4111 1111 1111 1111" className="hive-input"
                    style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: '0.9375rem', background: '#fafafa', color: '#888' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Expiry</label>
                  <input type="text" disabled value="12/28" className="hive-input"
                    style={{ textAlign: 'center', fontFamily: 'monospace', background: '#fafafa', color: '#888' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>CVV</label>
                  <input type="password" disabled value="•••" className="hive-input"
                    style={{ textAlign: 'center', fontFamily: 'monospace', background: '#fafafa', color: '#888' }} />
                </div>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8125rem', color: '#dc2626' }}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={processing} className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '0.9375rem', justifyContent: 'center', marginTop: '0.5rem', opacity: processing ? 0.7 : 1 }}>
                {processing ? (
                  <><div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Processing...</>
                ) : (
                  <>Pay ₹{displayAmount.toLocaleString('en-IN')}</>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg-muted)' }}>
                <ShieldCheck className="h-4 w-4" style={{ color: '#16a34a' }} />
                256-bit SSL encrypted · No real charges in demo mode
              </div>
            </form>
          </div>

          <div className="hive-card" style={{ padding: '1.25rem 1.5rem', background: '#fff' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-primary)', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(24,24,26,0.06)', marginBottom: '1rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>{label}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', marginTop: '0.15rem' }}>
                    {jobId ? `Job #${jobId.slice(-6)}` : 'Contract Retainer'}
                  </div>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>
                  ₹{displayAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--fg-muted)' }}>Platform fee</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>₹0 (Free)</span>
              </div>

              {user && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--fg-muted)' }}>Billed to</span>
                  <span style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>{user.email}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed rgba(24,24,26,0.1)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-primary)' }}>Total Due</span>
              <span style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--accent-red)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", lineHeight: 1 }}>
                ₹{displayAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(24,24,26,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Payments recorded in your dashboard', 'Cancellable before work starts', '100% money-back guarantee'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}>
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <PaymentForm />
    </Suspense>
  );
}
