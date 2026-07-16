"use client";

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Mock Razorpay processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      
      // Redirect after showing success
      setTimeout(() => {
        router.push('/dashboard/business/my-workforce');
      }, 2200);
    }, 2000);
  };

  if (success) {
    return (
      <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', itemsCenter: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div className="hive-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%', margin: '0 auto', background: '#fff' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.1)', color: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Payment Successful
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Your transaction was completed via Razorpay Test Mode. The worker has been added to your active workforce.
          </p>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', animation: 'pulse 1.5s infinite' }}>
            Redirecting to My Workforce...
          </div>
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Back Link */}
        <div>
          <Link href="/dashboard/business" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }} className="flex-col md:flex-row">
          
          {/* Checkout Panel */}
          <div className="hive-card" style={{ padding: '2rem', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(24,24,26,0.06)', marginBottom: '1.75rem' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(24,24,26,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <CreditCard className="h-5 w-5" style={{ color: 'var(--fg-primary)' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg-primary)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Secure Checkout</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.15rem' }}>Razorpay Test Mode Integration</p>
              </div>
            </div>

            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Card Number</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--fg-muted)' }} />
                  <input
                    type="text"
                    disabled
                    value="4111 1111 1111 1111"
                    className="hive-input"
                    style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: '0.9375rem', background: '#fafafa', color: '#888' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>Expiry Date</label>
                  <input
                    type="text"
                    disabled
                    value="12/28"
                    className="hive-input"
                    style={{ textAlign: 'center', fontFamily: 'monospace', background: '#fafafa', color: '#888' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>CVV Code</label>
                  <input
                    type="password"
                    disabled
                    value="•••"
                    className="hive-input"
                    style={{ textAlign: 'center', fontFamily: 'monospace', background: '#fafafa', color: '#888' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '0.9375rem', justifyContent: 'center', marginTop: '0.75rem', opacity: processing ? 0.7 : 1 }}
              >
                {processing ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Processing Payment...
                  </>
                ) : (
                  <>Proceed to Pay $45.00</>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                <ShieldCheck className="h-4 w-4" style={{ color: '#16a34a' }} />
                Secure 256-bit SSL encrypted connection
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="hive-card animate-fade-in" style={{ padding: '1.25rem 1.5rem', background: '#fff' }}>
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-primary)', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(24,24,26,0.06)', marginBottom: '1rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>Receptionist</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', marginTop: '0.15rem' }}>Contract Job Retainer</div>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>$45.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--fg-muted)' }}>Platform processing fee</span>
                <span style={{ fontWeight: 700, color: 'var(--fg-primary)' }}>$0.00</span>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed rgba(24,24,26,0.1)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-primary)' }}>Total Due</span>
              <span style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--accent-red)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", lineHeight: 1 }}>
                $45.00
              </span>
            </div>
          </div>

        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
