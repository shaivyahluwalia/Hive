'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agentId = searchParams.get('agentId');
  const agentName = searchParams.get('name') || 'AI Agent';
  const price = searchParams.get('price') || '0';
  
  const targetSlug = searchParams.get('slug') || 'marketing'; 

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // FIX: Explicitly typed as React.FormEvent for TypeScript
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/payment/deploy-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/workspace/ai/${targetSlug}`);
        }, 2000);
      } else {
        alert(data.message || 'Payment Failed');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error contacting server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">Secure Checkout</h2>
        <p className="text-gray-400 mb-6">Deploying: <span className="text-white font-semibold">{agentName}</span></p>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-5xl text-emerald-400 animate-bounce">✓</div>
            <h3 className="text-xl font-bold text-emerald-400">Payment Successful!</h3>
            <p className="text-sm text-gray-400">Initializing AI memory environment...</p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Due:</span>
              <span className="text-2xl font-extrabold text-purple-400">₹{price}</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">Dummy Card Number</label>
              <input type="text" placeholder="4242 •••• •••• 4242" disabled className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-gray-500 cursor-not-allowed" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 font-bold p-4 rounded-xl transition duration-200 shadow-lg shadow-purple-900/30 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing Transaction...' : `Pay & Deploy Agent`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading checkout engine...</div>}>
      <PaymentContent />
    </Suspense>
  );
}