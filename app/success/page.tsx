'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const SUB_KEY = 'voicequote_sub';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // LemonSqueezy appends ?order_id=xxx to whatever redirect URL you configure.
  // We configure the redirect URL in LemonSqueezy dashboard as:
  //   Pro:      https://yourdomain.com/success?plan=pro
  //   Business: https://yourdomain.com/success?plan=business
  // So the final URL becomes: /success?plan=pro&order_id=xxx
  const orderId = searchParams.get('order_id');
  const planParam = searchParams.get('plan') ?? 'pro';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [plan, setPlan] = useState(planParam);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function verify() {
      try {
        // Fetch email from the order (server-side LemonSqueezy API call)
        if (orderId) {
          const res = await fetch(`/api/lemon/order-details?order_id=${orderId}`);
          const data = await res.json();
          if (res.ok && data.email) {
            setEmail(data.email);
          }
        }

        // Store subscription in localStorage
        const resolvedPlan = planParam === 'business' ? 'business' : 'pro';
        const subData = {
          isPro: true,
          plan: resolvedPlan,
          email: email,
          sessionId: orderId ?? 'lemon',
          // LemonSqueezy subscriptions renew monthly; store 31 days as safe default
          expiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
        };
        localStorage.setItem(SUB_KEY, JSON.stringify(subData));
        setPlan(resolvedPlan);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    }

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, planParam]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Verifying your payment…</h1>
            <p className="text-gray-500 mt-2 text-sm">Just a moment, please.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-9 h-9 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-gray-600 mt-2">
              Welcome to <span className="font-semibold capitalize text-blue-600">{plan === 'business' ? 'Business' : 'Pro'}</span>!
            </p>
            {email && (
              <p className="text-sm text-gray-400 mt-1">Confirmation sent to {email}</p>
            )}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              Your Pro access is active in this browser. If you switch devices, use <strong>Restore Access</strong> on the main page.
            </div>
            <button
              onClick={() => router.push('/')}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Start Creating Quotes →
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-500 mt-2 text-sm">
              We couldn&apos;t verify your payment. If you were charged, please use <strong>Restore Access</strong> on the main page with your email.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Back to App
            </button>
          </>
        )}
      </motion.div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
