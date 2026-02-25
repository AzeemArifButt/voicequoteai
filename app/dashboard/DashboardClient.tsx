'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

interface Quote {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  company_name: string;
  total_price: string;
  currency: string;
  share_token: string;
  created_at: string;
}

interface Props {
  quotes: Quote[];
  plan: string;
  isPro: boolean;
  quotesRemaining: number | null;
  userName: string;
}

const FF = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const PLAN_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  free:     { bg: 'rgba(255,255,255,0.1)', text: '#94a3b8', label: 'Free' },
  pro:      { bg: 'rgba(37,99,235,0.25)',  text: '#93c5fd', label: 'Pro' },
  business: { bg: 'rgba(124,58,237,0.25)', text: '#c4b5fd', label: 'Business' },
};

function CopyButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'copied'>('idle');
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(`${window.location.origin}/quote/${token}`);
        setState('copied');
        setTimeout(() => setState('idle'), 2000);
      }}
      style={{
        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', border: 'none', fontFamily: FF,
        backgroundColor: state === 'copied' ? '#dcfce7' : '#f1f5f9',
        color: state === 'copied' ? '#16a34a' : '#475569',
        transition: 'all 0.2s',
      }}
    >
      {state === 'copied' ? '✓ Copied' : 'Copy Link'}
    </button>
  );
}

export default function DashboardClient({ quotes, plan, isPro, quotesRemaining, userName }: Props) {
  const planStyle = PLAN_COLORS[plan] ?? PLAN_COLORS.free;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f6ff', fontFamily: FF }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(12,18,37,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>VoiceQuote AI</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{
            color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </a>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Welcome card */}
        <div style={{
          backgroundColor: '#0c1225', borderRadius: '16px', padding: '28px 32px',
          marginBottom: '28px', color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#f1f5f9' }}>
                {userName ? `Hi, ${userName} 👋` : 'Your Dashboard'}
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
                All your generated proposals in one place.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                backgroundColor: planStyle.bg, color: planStyle.text,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {planStyle.label} Plan
              </span>
            </div>
          </div>

          {!isPro && (
            <div style={{
              marginTop: '20px', backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '10px', padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  {quotesRemaining === 0
                    ? 'Monthly quota reached. Upgrade for unlimited quotes.'
                    : `${quotesRemaining} quote${quotesRemaining === 1 ? '' : 's'} remaining this month`}
                </p>
              </div>
              {quotesRemaining === 0 && (
                <a href="/#pricing" style={{
                  padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}>
                  Upgrade to Pro →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Quotes list */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Your Quotes ({quotes.length})
          </h2>
          <a href="/" style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', textDecoration: 'none',
          }}>
            + New Quote
          </a>
        </div>

        {quotes.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '14px', padding: '56px 32px',
            textAlign: 'center', border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg style={{ width: '28px', height: '28px', color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px' }}>No quotes yet</p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>
              Head back to the app to generate your first proposal.
            </p>
            <a href="/" style={{
              padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', textDecoration: 'none',
            }}>
              Generate My First Quote →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quotes.map((q) => (
              <div key={q.id} style={{
                backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px 24px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
              }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {q.title || q.client_name || 'Untitled Quote'}
                    </p>
                    {q.total_price && (
                      <span style={{
                        padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                        backgroundColor: '#eff6ff', color: '#1d4ed8',
                      }}>
                        {q.currency} {q.total_price}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    {q.client_name && <span>{q.client_name}</span>}
                    {q.client_name && q.company_name && <span> · </span>}
                    {q.company_name && <span>{q.company_name}</span>}
                    {(q.client_name || q.company_name) && <span> · </span>}
                    <span>{new Date(q.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  <a
                    href={`/quote/${q.share_token}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: '#0c1225', color: '#ffffff', textDecoration: 'none',
                    }}
                  >
                    View →
                  </a>
                  <a
                    href={`/quote/${q.share_token}?download=1`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: '#f1f5f9', color: '#475569', textDecoration: 'none',
                    }}
                  >
                    Download PDF
                  </a>
                  <CopyButton token={q.share_token} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '32px 24px', color: '#94a3b8',
        fontSize: '12px', borderTop: '1px solid #e2e8f0', marginTop: '40px',
      }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} VoiceQuote AI. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
          {[
            { href: '/privacy-policy', label: 'Privacy Policy' },
            { href: '/terms-and-conditions', label: 'Terms' },
            { href: '/refund-policy', label: 'Refund Policy' },
          ].map((link) => (
            <a key={link.href} href={link.href} style={{ color: '#94a3b8', textDecoration: 'none' }}>
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
