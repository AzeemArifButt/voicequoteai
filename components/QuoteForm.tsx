'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'CAD', symbol: '$' },
  { code: 'AUD', symbol: '$' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' },
];

interface QuoteFormProps {
  companyName: string;
  clientName: string;
  clientEmail: string;
  totalPrice: string;
  logoDataUrl: string | null;
  currency: string;
  onCompanyNameChange: (v: string) => void;
  onClientNameChange: (v: string) => void;
  onClientEmailChange: (v: string) => void;
  onTotalPriceChange: (v: string) => void;
  onLogoChange: (dataUrl: string | null) => void;
  onCurrencyChange: (v: string) => void;
  error: string | null;
}

export default function QuoteForm({
  companyName,
  clientName,
  clientEmail,
  totalPrice,
  logoDataUrl,
  currency,
  onCompanyNameChange,
  onClientNameChange,
  onClientEmailChange,
  onTotalPriceChange,
  onLogoChange,
  onCurrencyChange,
  error,
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
        <label style={labelStyle}>Currency &amp; Total Price <span style={{ color: '#ef4444' }}>*</span></label>
        {/* Currency pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => onCurrencyChange(c.code)}
              style={{
                padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                border: `1.5px solid ${currency === c.code ? '#2563eb' : '#e2e8f0'}`,
                backgroundColor: currency === c.code ? '#eff6ff' : '#ffffff',
                color: currency === c.code ? '#1d4ed8' : '#64748b',
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              {c.code}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700, fontSize: '15px', userSelect: 'none', pointerEvents: 'none' }}>
            {CURRENCIES.find((c) => c.code === currency)?.symbol ?? '$'}
          </span>
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

    </div>
  );
}
