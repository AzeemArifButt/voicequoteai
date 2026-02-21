'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuoteFormProps {
  companyName: string;
  clientName: string;
  clientEmail: string;
  totalPrice: string;
  logoDataUrl: string | null;
  onCompanyNameChange: (v: string) => void;
  onClientNameChange: (v: string) => void;
  onClientEmailChange: (v: string) => void;
  onTotalPriceChange: (v: string) => void;
  onLogoChange: (dataUrl: string | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
  isPro: boolean;
  quotesRemaining: number | null;
  onUpgrade: () => void;
}

export default function QuoteForm({
  companyName,
  clientName,
  clientEmail,
  totalPrice,
  logoDataUrl,
  onCompanyNameChange,
  onClientNameChange,
  onClientEmailChange,
  onTotalPriceChange,
  onLogoChange,
  onGenerate,
  isGenerating,
  error,
  isPro,
  quotesRemaining,
  onUpgrade,
}: QuoteFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (max 2MB)
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onLogoChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const inputStyle: React.CSSProperties = {
    height: '44px',
    fontSize: '14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#fafafa',
    color: '#0f172a',
    padding: '0 12px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
    display: 'block',
    marginBottom: '6px',
    letterSpacing: '0.01em',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Your Business Section ── */}
      <div style={{ backgroundColor: '#f0f7ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <svg style={{ width: '15px', height: '15px', color: '#2563eb', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Business</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Company name */}
          <div>
            <label style={labelStyle}>Company / Business Name <span style={{ color: '#ef4444' }}>*</span></label>
            <Input
              value={companyName}
              onChange={(e) => onCompanyNameChange(e.target.value)}
              placeholder="e.g. Smith Plumbing Co."
              style={{ ...inputStyle, backgroundColor: '#ffffff', borderColor: '#93c5fd' }}
            />
          </div>

          {/* Logo upload */}
          <div>
            <label style={labelStyle}>
              Company Logo <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional — appears on PDF)</span>
            </label>

            {logoDataUrl ? (
              // Logo preview
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', backgroundColor: '#ffffff', border: '1.5px solid #93c5fd', borderRadius: '10px' }}>
                <img
                  src={logoDataUrl}
                  alt="Company logo"
                  style={{ height: '40px', maxWidth: '120px', objectFit: 'contain', borderRadius: '4px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>Logo uploaded ✓</p>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>Will appear on the PDF</p>
                </div>
                <button
                  onClick={() => { onLogoChange(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '4px 8px', borderRadius: '6px', backgroundColor: '#fef2f2' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              // Upload zone
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', padding: '14px', border: '1.5px dashed #93c5fd', borderRadius: '10px', backgroundColor: '#f8fbff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fbff')}
              >
                <svg style={{ width: '18px', height: '18px', color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>Upload Logo</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>· PNG, JPG, SVG · Max 2MB</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>Client Details</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
      </div>

      {/* ── Client fields ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Client Name <span style={{ color: '#ef4444' }}>*</span></label>
          <Input
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder="John Smith"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Client Email <span style={{ color: '#ef4444' }}>*</span></label>
          <Input
            type="email"
            value={clientEmail}
            onChange={(e) => onClientEmailChange(e.target.value)}
            placeholder="john@example.com"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Total Price <span style={{ color: '#ef4444' }}>*</span></label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700, fontSize: '15px', userSelect: 'none', pointerEvents: 'none' }}>$</span>
          <Input
            value={totalPrice}
            onChange={(e) => onTotalPriceChange(e.target.value)}
            placeholder="2,500.00"
            style={{ ...inputStyle, paddingLeft: '28px' }}
          />
        </div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}
          >
            <svg style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0, marginTop: '1px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p style={{ fontSize: '13px', color: '#dc2626', lineHeight: 1.4 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quota indicator (free users) ── */}
      {!isPro && quotesRemaining !== null && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: quotesRemaining === 0 ? '#fef2f2' : '#f0f7ff', borderRadius: '10px', border: `1px solid ${quotesRemaining === 0 ? '#fecaca' : '#bfdbfe'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg style={{ width: '14px', height: '14px', color: quotesRemaining === 0 ? '#ef4444' : '#2563eb', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 600, color: quotesRemaining === 0 ? '#dc2626' : '#1e40af' }}>
              {quotesRemaining === 0 ? 'Free quote limit reached' : `${quotesRemaining} free quote${quotesRemaining === 1 ? '' : 's'} remaining`}
            </span>
          </div>
          <button
            onClick={onUpgrade}
            style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', backgroundColor: quotesRemaining === 0 ? '#dc2626' : '#2563eb', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}
          >
            Upgrade →
          </button>
        </div>
      )}

      {/* ── Generate button OR upgrade CTA ── */}
      {quotesRemaining === 0 ? (
        <motion.button
          onClick={onUpgrade}
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
          onClick={onGenerate}
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

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '-4px' }}>
        {isPro ? '✓ Unlimited quotes · Pro plan active' : 'AI-generated · Professional quality · Fast delivery'}
      </p>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
