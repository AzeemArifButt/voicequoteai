'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface Quote {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  company_name: string;
  total_price: string;
  currency: string;
  proposal_text: string;
  share_token: string;
  created_at: string;
}

interface Props {
  quote: Quote;
  autoDownload: boolean;
}

const FF = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', NZD: 'NZ$',
  JPY: '¥', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', INR: '₹',
  BRL: 'R$', MXN: 'MX$', ZAR: 'R', SGD: 'S$', HKD: 'HK$', AED: 'AED',
};

export default function SharePageClient({ quote, autoDownload }: Props) {
  const docRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [downloading, setDownloading] = useState(false);

  const formattedDate = new Date(quote.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const currencySymbol = CURRENCY_SYMBOLS[quote.currency] ?? quote.currency;

  const handleDownloadPDF = async () => {
    if (!docRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const clientSlug = (quote.client_name || 'quote').toLowerCase().replace(/\s+/g, '-');
      await html2pdf()
        .set({
          margin: [10, 12, 10, 12],
          filename: `quote-${clientSlug}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(docRef.current)
        .save();
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (autoDownload) {
      const t = setTimeout(handleDownloadPDF, 800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload]);

  const paragraphs = quote.proposal_text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f6ff', fontFamily: FF }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#0c1225', padding: '0 24px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: '16px', height: '16px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>VoiceQuote AI</span>
        </a>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopyState('copied');
              setTimeout(() => setCopyState('idle'), 2000);
            }}
            style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.08)', color: '#e2e8f0',
              transition: 'all 0.2s',
            }}
          >
            {copyState === 'copied' ? '✓ Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              border: 'none', cursor: downloading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#ffffff',
              opacity: downloading ? 0.7 : 1,
            }}
          >
            {downloading ? 'Generating…' : '↓ Download PDF'}
          </button>
        </div>
      </header>

      {/* Document */}
      <main style={{ maxWidth: '820px', margin: '40px auto', padding: '0 24px 60px' }}>
        <div
          id="share-proposal-doc"
          ref={docRef}
          style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.10)', overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Blue header band */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            padding: '40px 48px 36px',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Professional Proposal
            </p>
            <h1 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              {quote.title || `Proposal for ${quote.client_name}`}
            </h1>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {quote.client_name && (
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Prepared for</p>
                  <p style={{ margin: '3px 0 0', fontSize: '15px', color: '#ffffff', fontWeight: 700 }}>{quote.client_name}</p>
                </div>
              )}
              {quote.company_name && (
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>From</p>
                  <p style={{ margin: '3px 0 0', fontSize: '15px', color: '#ffffff', fontWeight: 700 }}>{quote.company_name}</p>
                </div>
              )}
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Date</p>
                <p style={{ margin: '3px 0 0', fontSize: '15px', color: '#ffffff', fontWeight: 700 }}>{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '40px 48px' }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{
                margin: '0 0 16px', fontSize: '15px', lineHeight: '1.75',
                color: '#334155', fontFamily: FF,
              }}>
                {para}
              </p>
            ))}

            {/* Price box */}
            {quote.total_price && (
              <div style={{
                marginTop: '32px', backgroundColor: '#f0f7ff',
                border: '1.5px solid #bfdbfe', borderRadius: '12px',
                padding: '24px 28px',
              }}>
                <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Total Investment
                </p>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1e3a8a' }}>
                  {currencySymbol}{quote.total_price}
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginLeft: '8px' }}>
                    {quote.currency}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px 48px', borderTop: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
          }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              {quote.client_email && <span>Contact: {quote.client_email}</span>}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1' }}>
              Generated by{' '}
              <a href="https://voicequoteai.vercel.app" style={{ color: '#93c5fd', textDecoration: 'none' }}>VoiceQuote AI</a>
            </p>
          </div>
        </div>

        {/* CTA below doc */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px' }}>
            Want to create professional proposals like this?
          </p>
          <a href="/" style={{
            padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Try VoiceQuote AI Free →
          </a>
        </div>
      </main>
    </div>
  );
}
