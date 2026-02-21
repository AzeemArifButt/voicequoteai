'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MicrophoneButton from '@/components/MicrophoneButton';
import QuoteForm from '@/components/QuoteForm';
import QuotePreview from '@/components/QuotePreview';
import { useSubscription } from '@/hooks/useSubscription';

export interface QuoteData {
  companyName: string;
  clientName: string;
  clientEmail: string;
  totalPrice: string;
  proposalText: string;
  logoDataUrl: string | null;
}

const FF = 'ui-sans-serif, system-ui, -apple-system, Arial, sans-serif';

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Record Your Voice',
    desc: 'Tap the mic and describe the job in plain English. No forms, no typing — just talk.',
  },
  {
    num: '02',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI Writes It For You',
    desc: 'Our AI turns your rough notes into a polished, professional proposal in seconds.',
  },
  {
    num: '03',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Download & Send',
    desc: 'Edit any detail inline, download a print-ready PDF, and send it to your client immediately.',
  },
];

export default function HomePage() {
  const [transcript, setTranscript] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Restore Access modal state
  const [showRestore, setShowRestore] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const {
    isPro,
    quotesRemaining,
    recordQuoteUsed,
    upgradeToCheckout,
    restoreAccess,
    isRestoring,
    restoreError,
  } = useSubscription();

  const handleGenerateQuote = async () => {
    if (!transcript.trim()) { setApiError('Please record or type a voice note before generating.'); return; }
    if (!companyName.trim()) { setApiError('Please enter your company or business name.'); return; }
    if (!clientName.trim() || !clientEmail.trim() || !totalPrice.trim()) {
      setApiError('Please fill in the Client Name, Email, and Total Price fields.'); return;
    }
    setIsGenerating(true); setApiError(null); setQuoteData(null);
    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcribedText: transcript, clientName, clientEmail, totalPrice }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${response.status})`);
      }
      const data = await response.json();
      setQuoteData({ companyName, clientName, clientEmail, totalPrice, proposalText: data.proposalText, logoDataUrl });
      recordQuoteUsed();
      setTimeout(() => {
        document.getElementById('quote-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setQuoteData(null); setTranscript(''); setClientName('');
    setClientEmail(''); setTotalPrice(''); setApiError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestoreSubmit = async () => {
    const ok = await restoreAccess(restoreEmail.trim());
    if (ok) setRestoreSuccess(true);
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: FF, backgroundColor: '#0c1225' }}>

      {/* ══ HEADER ══ */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(12,18,37,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(96,165,250,0.4)' }}>
              <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff', letterSpacing: '-0.4px', lineHeight: 1 }}>VoiceQuote AI</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', lineHeight: 1, marginTop: '3px' }}>Instant professional proposals</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isPro && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9973B', backgroundColor: 'rgba(201,151,59,0.15)', border: '1px solid rgba(201,151,59,0.35)', borderRadius: '999px', padding: '4px 12px', letterSpacing: '0.04em' }}>
                ✦ PRO
              </span>
            )}
            <a href="#create" style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '999px', padding: '6px 18px', textDecoration: 'none' }}>
              Create Quote →
            </a>
          </div>
        </div>
      </motion.header>

      {/* ══ HERO ══ */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #0c1225 0%, #0f172a 35%, #1a2355 65%, #1e3a8a 100%)' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(56,189,248,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', padding: '90px 24px 96px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', backgroundColor: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '999px', marginBottom: '30px' }}>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.8)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI-Powered Proposal Generator</span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 8vw, 66px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-3px', lineHeight: 1.03, marginBottom: '22px' }}>
              Win More Jobs.<br />
              <span style={{ background: 'linear-gradient(130deg, #60a5fa 0%, #a78bfa 50%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Quote Faster.</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.55)', maxWidth: '460px', margin: '0 auto 44px', lineHeight: 1.72, letterSpacing: '-0.1px' }}>
              Speak your project details out loud. Get a polished, professional proposal and a print-ready PDF in seconds — no typing required.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {[{ icon: '🎙️', text: 'Voice-to-proposal' }, { icon: '⚡', text: 'Under 30 seconds' }, { icon: '📄', text: 'PDF ready instantly' }, { icon: '✏️', text: 'Fully editable' }].map((p) => (
                <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '999px', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: '13px' }}>{p.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.01em' }}>{p.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <svg viewBox="0 0 1440 50" style={{ display: 'block', marginBottom: '-2px' }} preserveAspectRatio="none">
          <path fill="#f0f6ff" d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" />
        </svg>
      </div>

      {/* ══ HOW IT WORKS ══ */}
      <div style={{ backgroundColor: '#f0f6ff', padding: '72px 24px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', lineHeight: 1.12 }}>Three steps to a winning quote</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }} style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e0eaf8', padding: '28px 24px', boxShadow: '0 2px 16px rgba(37,99,235,0.07)', position: 'relative', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', top: '-8px', right: '16px', fontSize: '72px', fontWeight: 900, color: 'rgba(37,99,235,0.05)', lineHeight: 1, userSelect: 'none' }}>{step.num}</span>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', color: '#ffffff' }}>{step.icon}</div>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', marginBottom: '8px' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.65 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══ PRICING ══ */}
      <div id="pricing" style={{ backgroundColor: '#f0f6ff', padding: '0 24px 0' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '20px' }}>
          <div style={{ textAlign: 'center', paddingTop: '72px', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', lineHeight: 1.12, marginBottom: '14px' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '380px', margin: '0 auto' }}>Start free. Upgrade when you&apos;re ready. Cancel anytime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', alignItems: 'stretch' }}>

            {/* Starter */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e0eaf8', padding: '28px 24px', boxShadow: '0 2px 16px rgba(37,99,235,0.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Starter</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '42px', fontWeight: 900, color: '#0f172a', letterSpacing: '-2px', lineHeight: 1 }}>Free</span>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px' }}>Forever — no credit card needed</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {['3 quotes per month', 'Voice to proposal', 'PDF download', 'Basic AI generation'].map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <svg style={{ width: '15px', height: '15px', color: '#16a34a', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span style={{ fontSize: '13px', color: '#475569' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' })} style={{ width: '100%', height: '44px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', color: '#374151', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '28px' }}>
                Get Started Free
              </button>
            </motion.div>

            {/* Pro */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }} style={{ backgroundColor: '#1e3a8a', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 12px 40px rgba(37,99,235,0.4)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#C9973B', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '4px 16px', borderRadius: '999px', letterSpacing: '0.06em', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(201,151,59,0.5)' }}>MOST POPULAR</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Pro</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#93c5fd', marginTop: '8px' }}>$</span>
                  <span style={{ fontSize: '46px', fontWeight: 900, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1 }}>29</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>per month, billed monthly</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {['Unlimited quotes', 'Voice to proposal', 'Unlimited PDF downloads', 'Custom branding', 'Logo upload on proposals', 'Priority AI generation'].map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <svg style={{ width: '15px', height: '15px', color: '#60a5fa', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              {isPro ? (
                <button disabled style={{ width: '100%', height: '46px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'default', marginTop: '28px' }}>
                  ✓ You&apos;re on Pro
                </button>
              ) : (
                <button onClick={() => upgradeToCheckout('pro')} style={{ width: '100%', height: '46px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #C9973B, #EFD89A)', color: '#7c2d00', fontSize: '13px', fontWeight: 800, cursor: 'pointer', marginTop: '28px', boxShadow: '0 4px 16px rgba(201,151,59,0.5)' }}>
                  Start Free Trial →
                </button>
              )}
            </motion.div>

            {/* Business */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.26 }} style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e0eaf8', padding: '28px 24px', boxShadow: '0 2px 16px rgba(37,99,235,0.06)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Business</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#94a3b8', marginTop: '8px' }}>$</span>
                  <span style={{ fontSize: '46px', fontWeight: 900, color: '#0f172a', letterSpacing: '-2px', lineHeight: 1 }}>79</span>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px' }}>per month, billed monthly</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {['Everything in Pro', 'Team accounts (5 users)', 'Custom proposal templates', 'White-label PDF output', 'API access', 'Priority support'].map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <svg style={{ width: '15px', height: '15px', color: '#16a34a', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span style={{ fontSize: '13px', color: '#475569' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => upgradeToCheckout('business')} style={{ width: '100%', height: '44px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '28px', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
                Get Business →
              </button>
            </motion.div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '22px', paddingBottom: '12px' }}>
            No long-term contracts · Secure payment via Stripe · Cancel anytime
          </p>
        </div>

        <svg viewBox="0 0 1440 50" style={{ display: 'block', marginBottom: '-2px' }} preserveAspectRatio="none">
          <path fill="#1e3a8a" d="M0,25 C360,50 1080,0 1440,25 L1440,50 L0,50 Z" />
        </svg>
      </div>

      {/* ══ FORM ══ */}
      <div id="create" style={{ background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 40%, #1d4ed8 100%)', padding: '0 20px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(96,165,250,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ textAlign: 'center', padding: '60px 0 44px', position: 'relative' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#93c5fd', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>Create your quote</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-1.2px', lineHeight: 1.15 }}>Ready in under 60 seconds</h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }} style={{ maxWidth: '620px', margin: '0 auto', position: 'relative' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Step 1 — Details first */}
            <div style={{ padding: '30px 30px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(37,99,235,0.45)' }}>1</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', lineHeight: 1 }}>Enter Your Details</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>Business info and client details</p>
                </div>
              </div>
              <QuoteForm
                companyName={companyName}
                clientName={clientName}
                clientEmail={clientEmail}
                totalPrice={totalPrice}
                logoDataUrl={logoDataUrl}
                onCompanyNameChange={setCompanyName}
                onClientNameChange={setClientName}
                onClientEmailChange={setClientEmail}
                onTotalPriceChange={setTotalPrice}
                onLogoChange={setLogoDataUrl}
                error={apiError}
              />
            </div>

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0 30px' }} />

            {/* Step 2 — Voice note */}
            <div style={{ padding: '26px 30px 30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(37,99,235,0.45)' }}>2</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', lineHeight: 1 }}>Record Your Voice Note</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>Tap the mic and describe the job in your own words</p>
                </div>
              </div>
              <MicrophoneButton transcript={transcript} onTranscriptChange={setTranscript} />
            </div>

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0 30px' }} />

            {/* Step 3 — Generate */}
            <div style={{ padding: '26px 30px 30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(37,99,235,0.45)' }}>3</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', lineHeight: 1 }}>Generate Your Quote</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>AI writes a professional proposal from your voice note</p>
                </div>
              </div>

              {/* Quota indicator (free users) */}
              {!isPro && quotesRemaining !== null && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: quotesRemaining === 0 ? '#fef2f2' : '#f0f7ff', borderRadius: '10px', border: `1px solid ${quotesRemaining === 0 ? '#fecaca' : '#bfdbfe'}`, marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg style={{ width: '14px', height: '14px', color: quotesRemaining === 0 ? '#ef4444' : '#2563eb', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: quotesRemaining === 0 ? '#dc2626' : '#1e40af' }}>
                      {quotesRemaining === 0 ? 'Free quote limit reached' : `${quotesRemaining} free quote${quotesRemaining === 1 ? '' : 's'} remaining`}
                    </span>
                  </div>
                  <button
                    onClick={() => upgradeToCheckout('pro')}
                    style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', backgroundColor: quotesRemaining === 0 ? '#dc2626' : '#2563eb', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}
                  >
                    Upgrade →
                  </button>
                </div>
              )}

              {/* Generate button OR upgrade CTA */}
              {quotesRemaining === 0 ? (
                <motion.button
                  onClick={() => upgradeToCheckout('pro')}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', height: '56px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #C9973B, #EFD89A)',
                    color: '#7c2d00', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.2px',
                    boxShadow: '0 4px 20px rgba(201,151,59,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to Pro — Unlimited Quotes
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleGenerateQuote}
                  disabled={isGenerating}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', height: '56px', borderRadius: '14px', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer',
                    background: isGenerating ? 'linear-gradient(135deg, #93c5fd, #60a5fa)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: '#ffffff', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.2px',
                    boxShadow: isGenerating ? 'none' : '0 4px 20px rgba(37,99,235,0.45), 0 1px 4px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'box-shadow 0.15s, background 0.15s',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating your proposal...
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Professional Quote ✨
                      {isPro && <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', padding: '2px 7px', letterSpacing: '0.05em' }}>PRO</span>}
                    </>
                  )}
                </motion.button>
              )}

              <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>
                {isPro ? '✓ Unlimited quotes · Pro plan active' : 'AI-generated · Professional quality · Fast delivery'}
              </p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '18px', letterSpacing: '0.02em' }}>
            🔒 Your data is never stored &nbsp;·&nbsp; Works on iOS, Android &amp; Desktop
          </p>
        </motion.div>
      </div>

      {/* ══ QUOTE PREVIEW ══ */}
      <AnimatePresence>
        {quoteData && (
          <motion.div
            id="quote-preview"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            style={{ backgroundColor: '#f0f6ff', padding: '0 20px 72px' }}
          >
            <div style={{ maxWidth: '880px', margin: '0 auto', paddingTop: '52px' }}>
              <QuotePreview quoteData={quoteData} onReset={handleReset} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ FOOTER ══ */}
      <footer style={{ backgroundColor: '#0c1225', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px 32px', textAlign: 'center', fontFamily: FF }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '14px', height: '14px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>VoiceQuote AI</p>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>© 2026 · All rights reserved</p>
        <button
          onClick={() => { setShowRestore(true); setRestoreSuccess(false); setRestoreEmail(''); }}
          style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Restore Pro Access
        </button>
      </footer>

      {/* ══ RESTORE ACCESS MODAL ══ */}
      <AnimatePresence>
        {showRestore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowRestore(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}
            >
              {restoreSuccess ? (
                <>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg style={{ width: '28px', height: '28px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '8px' }}>Pro Access Restored!</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>Your Pro subscription has been verified and is now active in this browser.</p>
                  <button onClick={() => setShowRestore(false)} style={{ width: '100%', height: '44px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                    Back to App
                  </button>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Restore Pro Access</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>Enter the email you used when subscribing to verify your active subscription.</p>
                  <input
                    type="email"
                    value={restoreEmail}
                    onChange={(e) => setRestoreEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && restoreEmail) handleRestoreSubmit(); }}
                    placeholder="your@email.com"
                    style={{ width: '100%', height: '44px', borderRadius: '10px', border: '1.5px solid #e2e8f0', padding: '0 12px', fontSize: '14px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {restoreError && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '10px' }}>{restoreError}</p>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowRestore(false)} style={{ flex: 1, height: '44px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button
                      onClick={handleRestoreSubmit}
                      disabled={!restoreEmail || isRestoring}
                      style={{ flex: 2, height: '44px', borderRadius: '10px', border: 'none', background: !restoreEmail || isRestoring ? '#e2e8f0' : 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: !restoreEmail || isRestoring ? '#94a3b8' : '#ffffff', fontSize: '13px', fontWeight: 700, cursor: !restoreEmail || isRestoring ? 'not-allowed' : 'pointer' }}
                    >
                      {isRestoring ? 'Checking…' : 'Restore Access'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
