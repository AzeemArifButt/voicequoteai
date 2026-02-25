'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import type { QuoteData } from '@/app/page';

// ─── Theme definitions ──────────────────────────────────────────────────────
interface PdfTheme { name: string; color: string; dark: string; light: string; border: string; }

const PDF_THEMES: PdfTheme[] = [
  { name: 'Gold',    color: '#C9973B', dark: '#92400E', light: '#FEF6E4', border: '#ECD68A' },
  { name: 'Blue',    color: '#2563EB', dark: '#1E3A8A', light: '#EFF6FF', border: '#BFDBFE' },
  { name: 'Teal',    color: '#0D9488', dark: '#134E4A', light: '#F0FDFA', border: '#99F6E4' },
  { name: 'Ruby',    color: '#DC2626', dark: '#7F1D1D', light: '#FEF2F2', border: '#FECACA' },
  { name: 'Purple',  color: '#7C3AED', dark: '#4C1D95', light: '#F5F3FF', border: '#DDD6FE' },
  { name: 'Green',   color: '#16A34A', dark: '#14532D', light: '#F0FDF4', border: '#BBF7D0' },
  { name: 'Slate',   color: '#475569', dark: '#1E293B', light: '#F8FAFC', border: '#CBD5E1' },
  { name: 'Black',   color: '#111827', dark: '#030712', light: '#F9FAFB', border: '#D1D5DB' },
];

// ─── Template definitions ────────────────────────────────────────────────────
type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive';

interface PdfTemplate { id: TemplateId; name: string; industry: string; }

const PDF_TEMPLATES: PdfTemplate[] = [
  { id: 'classic',   name: 'Classic',   industry: 'Trades & Construction' },
  { id: 'modern',    name: 'Modern',    industry: 'Tech & Digital' },
  { id: 'minimal',   name: 'Minimal',   industry: 'Design & Creative' },
  { id: 'executive', name: 'Executive', industry: 'Consulting & Legal' },
];

function detectTemplate(proposalText: string, companyName: string): TemplateId {
  const text = (proposalText + ' ' + companyName).toLowerCase();
  const score = (kws: string[]) => kws.reduce((n, kw) => n + (text.includes(kw) ? 1 : 0), 0);
  const scores: Record<TemplateId, number> = {
    classic:   0,
    modern:    score(['tech', 'software', 'app', 'website', 'digital', 'development', 'saas', 'api', 'cloud', 'mobile']),
    minimal:   score(['design', 'creative', 'branding', 'marketing', 'art', 'graphic', 'ux', 'ui', 'campaign', 'logo']),
    executive: score(['consulting', 'legal', 'audit', 'finance', 'strategy', 'management', 'advisory', 'compliance', 'accounting']),
  };
  const best = (Object.entries(scores) as [TemplateId, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)[0];
  return best ? best[0] : 'classic';
}

// ─── Currency symbols ─────────────────────────────────────────────────────────
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$', JPY: '¥', INR: '₹',
};

// ─── Theme context ────────────────────────────────────────────────────────────
const ThemeCtx = React.createContext<PdfTheme>(PDF_THEMES[0]);

// ─── Inline-editable field ────────────────────────────────────────────────────
function Field({ text, style, block = false }: { text: string; style: React.CSSProperties; block?: boolean }) {
  const theme = React.useContext(ThemeCtx);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const elRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elRef.current) elRef.current.textContent = text;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bg = focus ? 'rgba(0,0,0,0.06)' : hover ? 'rgba(0,0,0,0.03)' : 'transparent';
  const shadow = focus ? `inset 0 -2px 0 ${theme.color}` : hover ? `inset 0 -1.5px 0 ${theme.border}` : 'none';

  return React.createElement(block ? 'div' : 'span', {
    ref: elRef,
    contentEditable: true,
    suppressContentEditableWarning: true,
    style: {
      ...style,
      display: block ? 'block' : 'inline',
      outline: 'none', cursor: 'text', borderRadius: '3px',
      backgroundColor: bg, boxShadow: shadow,
      transition: 'background-color 0.12s, box-shadow 0.12s',
      minWidth: '20px', WebkitUserSelect: 'text', userSelect: 'text',
    } as React.CSSProperties,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: () => { setFocus(true); setHover(false); },
    onBlur: () => setFocus(false),
  });
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ label, style: extraStyle }: { label: string; style?: React.CSSProperties }) {
  const theme = React.useContext(ThemeCtx);
  return (
    <p style={{
      fontSize: '10px', fontWeight: 800, color: theme.color,
      letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '13px', lineHeight: 1,
      fontFamily: 'ui-sans-serif, system-ui, Arial, Helvetica, sans-serif',
      ...extraStyle,
    }}>
      {label}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface QuotePreviewProps {
  quoteData: QuoteData;
  onReset: () => void;
  isPro: boolean;
  onTemplateChange?: (id: string) => void;
}

export default function QuotePreview({ quoteData, onReset, isPro, onTemplateChange }: QuotePreviewProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const quoteNum = useRef(quoteData.quoteRef || `QT-${Date.now().toString().slice(-6)}`);
  const [editBannerVisible, setEditBannerVisible] = useState(true);
  const [theme, setTheme] = useState<PdfTheme>(PDF_THEMES[0]);
  const [templateId, setTemplateId] = useState<TemplateId>(() =>
    detectTemplate(quoteData.proposalText, quoteData.companyName)
  );
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copyLinkState, setCopyLinkState] = useState<'idle' | 'copied'>('idle');

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const paragraphs = quoteData.proposalText.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const currencySymbol = CURRENCY_SYMBOLS[quoteData.currency] ?? '$';

  // Notify parent of auto-detected template on mount
  useEffect(() => {
    onTemplateChange?.(templateId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTemplateChange = useCallback((id: TemplateId) => {
    setTemplateId(id);
    onTemplateChange?.(id);
  }, [onTemplateChange]);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    await new Promise(r => setTimeout(r, 120));
    const html2pdf = (await import('html2pdf.js')).default;
    const options = {
      margin: [10, 0, 10, 0] as [number, number, number, number],
      filename: `quote-${quoteData.clientName.replace(/\s+/g, '-').toLowerCase()}-${quoteNum.current}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2, useCORS: true, allowTaint: true, logging: false, backgroundColor: '#ffffff',
        onclone: (_doc: Document, el: HTMLElement) => {
          el.querySelectorAll('*').forEach(node => {
            const n = node as HTMLElement;
            n.removeAttribute('class');
            n.removeAttribute('contenteditable');
            n.style.boxShadow = '';
            n.style.outline = '';
            n.style.cursor = '';
            n.style.transition = '';
            if (n.style.backgroundColor?.startsWith('rgba')) n.style.backgroundColor = '';
          });
        },
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css'] },
    };
    html2pdf().set(options).from(documentRef.current).save();
  };

  const handleEmailClient = async () => {
    if (emailState === 'sending') return;
    setEmailState('sending');
    setEmailError(null);
    try {
      const res = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: quoteData.clientName,
          clientEmail: quoteData.clientEmail,
          companyName: quoteData.companyName,
          totalPrice: quoteData.totalPrice,
          currency: quoteData.currency,
          proposalText: quoteData.proposalText,
          quoteRef: quoteNum.current,
          today,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send.');
      setEmailState('sent');
      setTimeout(() => setEmailState('idle'), 4000);
    } catch (err) {
      setEmailState('error');
      setEmailError(err instanceof Error ? err.message : 'Could not send email.');
    }
  };

  const sans: React.CSSProperties = { fontFamily: 'ui-sans-serif, system-ui, Arial, Helvetica, sans-serif' };
  const g = { white: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 900: '#111827' };

  // ── Shared acceptance section (used by all templates) ──
  const AcceptanceSection = () => (
    <div style={{ padding: '24px 44px 36px', borderTop: `1px solid ${g[100]}`, marginTop: '4px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <SectionHead label="ACCEPTANCE" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {[{ label: 'Authorized by', name: quoteData.companyName }, { label: 'Accepted by', name: quoteData.clientName }].map(sig => (
          <div key={sig.label}>
            <p style={{ fontSize: '9px', color: g[400], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '28px' }}>{sig.label}</p>
            <div style={{ borderTop: `1.5px solid ${g[300]}`, paddingTop: '8px' }}>
              <p style={{ fontSize: '10px', color: g[400] }}>Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</p>
              <p style={{ fontSize: '12px', fontWeight: 700, color: g[700], marginTop: '5px' }}>{sig.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  // TEMPLATE: CLASSIC (original layout)
  // ══════════════════════════════════════════════════════════════════
  const ClassicDocument = () => (
    <div style={{ backgroundColor: g.white, borderLeft: `16px solid ${theme.color}`, maxWidth: '794px', margin: '0 auto', ...sans }}>
      {/* Header */}
      <div style={{ padding: '36px 44px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-block', border: '2.5px solid #111827', borderRadius: '14px', padding: '14px 32px 16px' }}>
            <p style={{ fontSize: '42px', fontWeight: 900, color: '#111827', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '7px' }}>PROPOSAL</p>
            <Field text={quoteData.companyName.toUpperCase()} style={{ fontSize: '12px', fontWeight: 700, color: g[600], letterSpacing: '0.22em' }} />
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: '6px' }}>
          {quoteData.logoDataUrl && (
            <img src={quoteData.logoDataUrl} alt="logo" style={{ height: '42px', maxWidth: '110px', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginBottom: '12px' }} />
          )}
          <p style={{ fontSize: '13px', color: g[700], marginBottom: '3px' }}>
            Prepared by: <strong style={{ color: '#111827' }}>{quoteData.companyName}</strong>
          </p>
          <p style={{ fontSize: '13px', color: g[600], marginBottom: '5px' }}>{today}</p>
          <p style={{ fontSize: '10px', color: g[400] }}>Ref: {quoteNum.current}</p>
          <div style={{ display: 'inline-block', marginTop: '6px', padding: '3px 10px', backgroundColor: theme.light, borderRadius: '999px', border: `1px solid ${theme.border}` }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: theme.color }}>Valid 30 days</p>
          </div>
        </div>
      </div>
      <div style={{ height: '2px', backgroundColor: theme.color, margin: '0 44px' }} />
      {/* Prepared by/for */}
      <div style={{ backgroundColor: theme.light, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, padding: '16px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, color: g[400], textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '8px' }}>PREPARED BY</p>
          <Field text={quoteData.companyName} style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '3px' }} block />
          <Field text="your@email.com" style={{ fontSize: '11px', color: g[500], display: 'block', marginBottom: '2px' }} block />
          <Field text="+1 (555) 000-0000" style={{ fontSize: '11px', color: g[500], display: 'block', marginBottom: '2px' }} block />
          <Field text="123 Business Ave, City, ST" style={{ fontSize: '11px', color: g[500], display: 'block' }} block />
        </div>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, color: g[400], textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '8px' }}>PREPARED FOR</p>
          <Field text={quoteData.clientName} style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '3px' }} block />
          <Field text={quoteData.clientEmail} style={{ fontSize: '11px', color: g[500], display: 'block' }} block />
        </div>
      </div>
      {/* Description */}
      <div style={{ padding: '28px 44px 0' }}>
        <SectionHead label="PROJECT DESCRIPTION" />
        {paragraphs[0] && <Field text={paragraphs[0]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify', marginBottom: '13px' }} block />}
        {paragraphs[1] && <Field text={paragraphs[1]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify' }} block />}
      </div>
      {/* Timeline + Cost */}
      <div style={{ padding: '24px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', borderTop: `1px solid ${g[100]}`, marginTop: '24px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div>
          <SectionHead label="TIMELINE" />
          <Field text="• Start: Upon acceptance of quote" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Completion: As mutually agreed" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Revisions: Included in scope" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Final delivery: Upon full payment" style={{ fontSize: '12px', color: g[700], display: 'block' }} block />
        </div>
        <div>
          <SectionHead label="COST" />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginTop: '10px', lineHeight: 1 }}>{currencySymbol}</span>
            <Field text={quoteData.totalPrice} style={{ fontSize: '44px', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1 }} />
          </div>
          <Field text="• Total project cost, all inclusive" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Payment terms to be discussed" style={{ fontSize: '12px', color: g[700], display: 'block' }} block />
        </div>
      </div>
      {/* Other Notes */}
      {paragraphs.length > 2 && (
        <div style={{ padding: '0 44px', borderTop: `1px solid ${g[100]}`, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div style={{ paddingTop: '24px' }}>
            <SectionHead label="OTHER NOTES" />
            {paragraphs.slice(2).map((para, i) => (
              <Field key={i} text={para} style={{ fontSize: '13px', color: g[700], lineHeight: '1.75', display: 'block', textAlign: 'justify', marginBottom: '12px' }} block />
            ))}
          </div>
        </div>
      )}
      <AcceptanceSection />
      <div style={{ height: '10px', backgroundColor: theme.color }} />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  // TEMPLATE: MODERN (top color band, card sections)
  // ══════════════════════════════════════════════════════════════════
  const ModernDocument = () => (
    <div style={{ backgroundColor: g.white, maxWidth: '794px', margin: '0 auto', ...sans }}>
      {/* Color band header */}
      <div style={{ backgroundColor: theme.color, padding: '28px 44px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            {quoteData.logoDataUrl && (
              <img src={quoteData.logoDataUrl} alt="logo" style={{ height: '34px', maxWidth: '100px', objectFit: 'contain', display: 'block', marginBottom: '10px', filter: 'brightness(0) invert(1)' }} />
            )}
            <p style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1, marginBottom: '6px' }}>PROPOSAL</p>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {quoteData.companyName}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: '4px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '4px' }}>{today}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginBottom: '8px' }}>Ref: {quoteNum.current}</p>
            <div style={{ display: 'inline-block', padding: '3px 12px', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: '999px' }}>
              <p style={{ fontSize: '10px', color: '#ffffff', fontWeight: 700 }}>Valid 30 days</p>
            </div>
          </div>
        </div>
      </div>
      {/* Prepared by/for cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '20px 44px', backgroundColor: g[50], pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        {[
          { label: 'From', name: quoteData.companyName, sub: 'your@email.com', extra: '+1 (555) 000-0000' },
          { label: 'To', name: quoteData.clientName, sub: quoteData.clientEmail, extra: '' },
        ].map((party) => (
          <div key={party.label} style={{ backgroundColor: g.white, border: `1px solid ${g[200]}`, borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, color: g[400], textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '8px' }}>{party.label}</p>
            <Field text={party.name} style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '3px' }} block />
            <Field text={party.sub} style={{ fontSize: '11px', color: g[500], display: 'block', marginBottom: '2px' }} block />
            {party.extra && <Field text={party.extra} style={{ fontSize: '11px', color: g[500], display: 'block' }} block />}
          </div>
        ))}
      </div>
      {/* Description card */}
      <div style={{ padding: '0 44px 16px' }}>
        <div style={{ backgroundColor: g.white, border: `1px solid ${g[200]}`, borderRadius: '12px', padding: '20px 22px' }}>
          <SectionHead label="PROJECT DESCRIPTION" />
          {paragraphs[0] && <Field text={paragraphs[0]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify', marginBottom: '12px' }} block />}
          {paragraphs[1] && <Field text={paragraphs[1]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify' }} block />}
        </div>
      </div>
      {/* Timeline + Cost cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '0 44px 16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div style={{ backgroundColor: g[50], border: `1px solid ${g[200]}`, borderRadius: '12px', padding: '20px 22px' }}>
          <SectionHead label="TIMELINE" />
          <Field text="• Start: Upon acceptance of quote" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Completion: As mutually agreed" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Revisions: Included in scope" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Final delivery: Upon full payment" style={{ fontSize: '12px', color: g[700], display: 'block' }} block />
        </div>
        <div style={{ backgroundColor: theme.light, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '20px 22px' }}>
          <SectionHead label="TOTAL COST" />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px', marginBottom: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: theme.dark, marginTop: '8px', lineHeight: 1 }}>{currencySymbol}</span>
            <Field text={quoteData.totalPrice} style={{ fontSize: '40px', fontWeight: 900, color: theme.dark, letterSpacing: '-2px', lineHeight: 1 }} />
          </div>
          <Field text="• All inclusive" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Payment terms to be discussed" style={{ fontSize: '12px', color: g[700], display: 'block' }} block />
        </div>
      </div>
      {/* Other Notes */}
      {paragraphs.length > 2 && (
        <div style={{ padding: '0 44px 16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div style={{ backgroundColor: g.white, border: `1px solid ${g[200]}`, borderRadius: '12px', padding: '20px 22px' }}>
            <SectionHead label="OTHER NOTES" />
            {paragraphs.slice(2).map((para, i) => (
              <Field key={i} text={para} style={{ fontSize: '13px', color: g[700], lineHeight: '1.75', display: 'block', textAlign: 'justify', marginBottom: '12px' }} block />
            ))}
          </div>
        </div>
      )}
      {/* Acceptance */}
      <div style={{ padding: '0 44px 28px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div style={{ backgroundColor: g[50], border: `1px solid ${g[200]}`, borderRadius: '12px', padding: '20px 22px' }}>
          <SectionHead label="ACCEPTANCE" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {[{ label: 'Authorized by', name: quoteData.companyName }, { label: 'Accepted by', name: quoteData.clientName }].map(sig => (
              <div key={sig.label}>
                <p style={{ fontSize: '9px', color: g[400], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '28px' }}>{sig.label}</p>
                <div style={{ borderTop: `1.5px solid ${g[300]}`, paddingTop: '8px' }}>
                  <p style={{ fontSize: '10px', color: g[400] }}>Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</p>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: g[700], marginTop: '5px' }}>{sig.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div style={{ height: '8px', backgroundColor: theme.color }} />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  // TEMPLATE: MINIMAL (pure typography)
  // ══════════════════════════════════════════════════════════════════
  const MinimalDocument = () => (
    <div style={{ backgroundColor: g.white, maxWidth: '794px', margin: '0 auto', ...sans }}>
      {/* Top rule */}
      <div style={{ height: '3px', backgroundColor: theme.color }} />
      {/* Header */}
      <div style={{ padding: '36px 52px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
        <div>
          {quoteData.logoDataUrl && (
            <img src={quoteData.logoDataUrl} alt="logo" style={{ height: '38px', maxWidth: '120px', objectFit: 'contain', display: 'block', marginBottom: '16px' }} />
          )}
          <p style={{ fontSize: '36px', fontWeight: 900, color: '#111827', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '6px' }}>Proposal</p>
          <p style={{ fontSize: '13px', color: g[500] }}>{quoteData.companyName}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: '6px' }}>
          <p style={{ fontSize: '12px', color: g[500], marginBottom: '3px' }}>{today}</p>
          <p style={{ fontSize: '10px', color: g[400], marginBottom: '6px' }}>Ref: {quoteNum.current}</p>
          <p style={{ fontSize: '10px', fontWeight: 700, color: theme.color }}>Valid 30 days</p>
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: g[200], margin: '0 52px' }} />
      {/* Prepared by/for */}
      <div style={{ padding: '18px 52px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, color: g[400], textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '9px' }}>Prepared By</p>
          <Field text={quoteData.companyName} style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '3px' }} block />
          <Field text="your@email.com" style={{ fontSize: '11px', color: g[500], display: 'block', marginBottom: '2px' }} block />
          <Field text="+1 (555) 000-0000" style={{ fontSize: '11px', color: g[500], display: 'block' }} block />
        </div>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, color: g[400], textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '9px' }}>Prepared For</p>
          <Field text={quoteData.clientName} style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '3px' }} block />
          <Field text={quoteData.clientEmail} style={{ fontSize: '11px', color: g[500], display: 'block' }} block />
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: g[200], margin: '0 52px' }} />
      {/* Description */}
      <div style={{ padding: '24px 52px 0' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '14px' }}>Project Description</p>
        {paragraphs[0] && <Field text={paragraphs[0]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.85', display: 'block', marginBottom: '13px' }} block />}
        {paragraphs[1] && <Field text={paragraphs[1]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.85', display: 'block' }} block />}
      </div>
      <div style={{ height: '1px', backgroundColor: g[200], margin: '24px 52px 0' }} />
      {/* Timeline + Cost */}
      <div style={{ padding: '22px 52px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '14px' }}>Timeline</p>
          <Field text="• Start: Upon acceptance" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Completion: As mutually agreed" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Revisions: Included in scope" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Delivery: Upon full payment" style={{ fontSize: '12px', color: g[700], display: 'block' }} block />
        </div>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '14px' }}>Investment</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px', marginBottom: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '9px', lineHeight: 1 }}>{currencySymbol}</span>
            <Field text={quoteData.totalPrice} style={{ fontSize: '42px', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1 }} />
          </div>
          <Field text="• All inclusive" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Payment terms TBD" style={{ fontSize: '12px', color: g[700], display: 'block' }} block />
        </div>
      </div>
      {paragraphs.length > 2 && (
        <>
          <div style={{ height: '1px', backgroundColor: g[200], margin: '0 52px' }} />
          <div style={{ padding: '22px 52px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '14px' }}>Additional Notes</p>
            {paragraphs.slice(2).map((para, i) => (
              <Field key={i} text={para} style={{ fontSize: '13px', color: g[700], lineHeight: '1.75', display: 'block', marginBottom: '12px' }} block />
            ))}
          </div>
        </>
      )}
      <div style={{ height: '1px', backgroundColor: g[200], margin: '0 52px' }} />
      {/* Acceptance */}
      <div style={{ padding: '22px 52px 36px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '18px' }}>Acceptance</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {[{ label: 'Authorized by', name: quoteData.companyName }, { label: 'Accepted by', name: quoteData.clientName }].map(sig => (
            <div key={sig.label}>
              <p style={{ fontSize: '9px', color: g[400], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '28px' }}>{sig.label}</p>
              <div style={{ borderTop: `1px solid ${g[300]}`, paddingTop: '8px' }}>
                <p style={{ fontSize: '10px', color: g[400] }}>Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</p>
                <p style={{ fontSize: '12px', fontWeight: 700, color: g[700], marginTop: '5px' }}>{sig.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom rule */}
      <div style={{ height: '2px', backgroundColor: theme.color }} />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  // TEMPLATE: EXECUTIVE (dark header block)
  // ══════════════════════════════════════════════════════════════════
  const ExecutiveDocument = () => (
    <div style={{ backgroundColor: g.white, maxWidth: '794px', margin: '0 auto', ...sans }}>
      {/* Dark header */}
      <div style={{ backgroundColor: '#111827', padding: '32px 48px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            {quoteData.logoDataUrl && (
              <img src={quoteData.logoDataUrl} alt="logo" style={{ height: '36px', maxWidth: '110px', objectFit: 'contain', display: 'block', marginBottom: '14px', filter: 'brightness(0) invert(1)' }} />
            )}
            <p style={{ fontSize: '11px', fontWeight: 700, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '8px' }}>Business Proposal</p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.8px', lineHeight: 1.1, marginBottom: '10px' }}>{quoteData.companyName}</p>
            <div style={{ width: '40px', height: '3px', backgroundColor: theme.color, borderRadius: '2px' }} />
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: '4px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>{today}</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>Ref: {quoteNum.current}</p>
            <div style={{ display: 'inline-block', padding: '4px 14px', backgroundColor: theme.color, borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#ffffff', fontWeight: 800, letterSpacing: '0.06em' }}>VALID 30 DAYS</p>
            </div>
          </div>
        </div>
      </div>
      {/* Prepared by/for - accent band */}
      <div style={{ backgroundColor: theme.dark, padding: '14px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div>
          <p style={{ fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '7px' }}>Submitted By</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>{quoteData.companyName}</p>
          <Field text="your@email.com" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', display: 'block' }} block />
        </div>
        <div>
          <p style={{ fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '7px' }}>Submitted To</p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>{quoteData.clientName}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{quoteData.clientEmail}</p>
        </div>
      </div>
      {/* Description */}
      <div style={{ padding: '28px 48px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '4px', height: '20px', backgroundColor: theme.color, borderRadius: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '10px', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Scope of Work</p>
        </div>
        {paragraphs[0] && <Field text={paragraphs[0]} style={{ fontSize: '14px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify', marginBottom: '14px' }} block />}
        {paragraphs[1] && <Field text={paragraphs[1]} style={{ fontSize: '14px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify' }} block />}
      </div>
      {/* Timeline + Cost */}
      <div style={{ padding: '24px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', borderTop: `2px solid ${g[100]}`, marginTop: '24px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '4px', height: '16px', backgroundColor: theme.color, borderRadius: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Timeline</p>
          </div>
          <Field text="• Start: Upon acceptance of quote" style={{ fontSize: '13px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Completion: As mutually agreed" style={{ fontSize: '13px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Revisions: Included in scope" style={{ fontSize: '13px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Delivery: Upon full payment" style={{ fontSize: '13px', color: g[700], display: 'block' }} block />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '4px', height: '16px', backgroundColor: theme.color, borderRadius: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Investment</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#111827', marginTop: '10px', lineHeight: 1 }}>{currencySymbol}</span>
            <Field text={quoteData.totalPrice} style={{ fontSize: '46px', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1 }} />
          </div>
          <Field text="• All inclusive, no hidden fees" style={{ fontSize: '13px', color: g[700], display: 'block', marginBottom: '5px' }} block />
          <Field text="• Payment terms to be discussed" style={{ fontSize: '13px', color: g[700], display: 'block' }} block />
        </div>
      </div>
      {paragraphs.length > 2 && (
        <div style={{ padding: '0 48px', borderTop: `2px solid ${g[100]}`, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div style={{ paddingTop: '22px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '4px', height: '16px', backgroundColor: theme.color, borderRadius: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Additional Terms</p>
          </div>
          {paragraphs.slice(2).map((para, i) => (
            <Field key={i} text={para} style={{ fontSize: '14px', color: g[700], lineHeight: '1.75', display: 'block', textAlign: 'justify', marginBottom: '12px' }} block />
          ))}
        </div>
      )}
      {/* Acceptance */}
      <div style={{ padding: '24px 48px 36px', borderTop: `2px solid ${g[100]}`, marginTop: '4px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ width: '4px', height: '16px', backgroundColor: theme.color, borderRadius: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '10px', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Acceptance</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {[{ label: 'Authorized by', name: quoteData.companyName }, { label: 'Accepted by', name: quoteData.clientName }].map(sig => (
            <div key={sig.label}>
              <p style={{ fontSize: '9px', color: g[400], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '28px' }}>{sig.label}</p>
              <div style={{ borderTop: `2px solid ${g[300]}`, paddingTop: '8px' }}>
                <p style={{ fontSize: '10px', color: g[400] }}>Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: g[700], marginTop: '5px' }}>{sig.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom accent */}
      <div style={{ height: '8px', backgroundColor: '#111827' }} />
      <div style={{ height: '4px', backgroundColor: theme.color }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* ── Success banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}
      >
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg style={{ width: '15px', height: '15px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p style={{ ...sans, fontSize: '13px', fontWeight: 700, color: '#15803d' }}>
          Your proposal is ready! Review below, click any text to edit, then download.
        </p>
      </motion.div>

      {/* ── Edit hint ── */}
      {editBannerVisible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#fffbeb', border: `1px solid ${theme.border}`, borderRadius: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px' }}>✏️</span>
            <p style={{ ...sans, fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
              Click any text in the document to edit it — edits appear in the downloaded PDF.
            </p>
          </div>
          <button onClick={() => setEditBannerVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: g[400], fontSize: '18px', lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
        </motion.div>
      )}

      {/* ── PDF Color Theme Picker ── */}
      <div style={{ ...sans, backgroundColor: g.white, border: `1px solid ${g[200]}`, borderRadius: '14px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: g[700], marginBottom: '2px' }}>PDF Color Theme</p>
            <p style={{ fontSize: '11px', color: g[400] }}>Accent color for your proposal</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
            {PDF_THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t)}
                title={t.name}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: t.color, border: 'none', cursor: 'pointer', flexShrink: 0,
                  boxShadow: theme.name === t.name
                    ? `0 0 0 2px #ffffff, 0 0 0 4px ${t.color}`
                    : '0 1px 4px rgba(0,0,0,0.18)',
                  transform: theme.name === t.name ? 'scale(1.18)' : 'scale(1)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              />
            ))}
          </div>
          <div style={{ flexShrink: 0, padding: '4px 14px', backgroundColor: theme.light, border: `1px solid ${theme.border}`, borderRadius: '999px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: theme.color }}>{theme.name}</p>
          </div>
        </div>
      </div>

      {/* ── PDF Layout Template Picker ── */}
      <div style={{ ...sans, backgroundColor: g.white, border: `1px solid ${g[200]}`, borderRadius: '14px', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: g[700], marginBottom: '2px' }}>Layout Template</p>
            <p style={{ fontSize: '11px', color: g[400] }}>Auto-detected · manually override</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
            {PDF_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateChange(t.id)}
                title={t.industry}
                style={{
                  padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer',
                  border: `1.5px solid ${templateId === t.id ? theme.color : g[200]}`,
                  backgroundColor: templateId === t.id ? theme.light : g.white,
                  color: templateId === t.id ? theme.color : g[600],
                  transition: 'all 0.15s',
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div style={{ flexShrink: 0, padding: '4px 14px', backgroundColor: theme.light, border: `1px solid ${theme.border}`, borderRadius: '999px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: theme.color }}>
              {PDF_TEMPLATES.find((t) => t.id === templateId)?.industry}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DOCUMENT CARD
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}
        style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.10), 0 3px 12px rgba(0,0,0,0.06)', border: `1px solid ${g[200]}` }}
      >
        {/* Screen-only topbar */}
        <div style={{ ...sans, backgroundColor: g[50], borderBottom: `1px solid ${g[100]}`, padding: '9px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: g[400], textTransform: 'uppercase', letterSpacing: '0.1em' }}>PDF Preview — click any text to edit</span>
          <span style={{ fontSize: '10px', color: g[300] }}>A4 · Portrait · {PDF_TEMPLATES.find(t => t.id === templateId)?.name}</span>
        </div>

        {/* ═══ DOCUMENT START ═══ */}
        <ThemeCtx.Provider value={theme}>
          <div
            ref={documentRef}
            style={{ backgroundColor: g.white, maxWidth: '794px', margin: '0 auto', ...sans, position: 'relative' }}
          >
            {/* Free tier watermark */}
            {!isPro && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    top: `${8 + i * 12}%`,
                    left: '-20%',
                    width: '140%',
                    textAlign: 'center',
                    transform: 'rotate(-35deg)',
                    fontSize: '17px',
                    fontWeight: 800,
                    color: 'rgba(0,0,0,0.06)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    fontFamily: 'ui-sans-serif, system-ui, Arial, sans-serif',
                  }}>
                    VoiceQuote AI — Free Plan
                  </div>
                ))}
              </div>
            )}

            {/* Template-driven content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={templateId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {templateId === 'classic'   && <ClassicDocument />}
                {templateId === 'modern'    && <ModernDocument />}
                {templateId === 'minimal'   && <MinimalDocument />}
                {templateId === 'executive' && <ExecutiveDocument />}
              </motion.div>
            </AnimatePresence>
          </div>
        </ThemeCtx.Provider>
        {/* ═══ DOCUMENT END ═══ */}

        {/* Screen-only footer */}
        <div style={{ backgroundColor: g[50], borderTop: `1px solid ${g[100]}`, padding: '10px 20px', textAlign: 'center' }}>
          <p style={{ ...sans, fontSize: '11px', color: g[400] }}>
            Generated by VoiceQuote AI · {today} · Confidential — prepared for {quoteData.clientName}
          </p>
        </div>
      </motion.div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          style={{
            flex: 2, minWidth: '160px', height: '52px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${theme.dark}, ${theme.color})`,
            color: '#ffffff', fontSize: '14px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
          }}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>

        {/* Email to Client */}
        <button
          onClick={handleEmailClient}
          disabled={emailState === 'sending'}
          style={{
            flex: 1, minWidth: '130px', height: '52px', borderRadius: '12px', cursor: emailState === 'sending' ? 'not-allowed' : 'pointer',
            border: emailState === 'sent' ? '1.5px solid #bbf7d0' : emailState === 'error' ? '1.5px solid #fecaca' : `1.5px solid ${g[200]}`,
            backgroundColor: emailState === 'sent' ? '#f0fdf4' : emailState === 'error' ? '#fef2f2' : g.white,
            color: emailState === 'sent' ? '#16a34a' : emailState === 'error' ? '#dc2626' : g[700],
            fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          {emailState === 'sending' ? (
            <svg style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : emailState === 'sent' ? (
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
          {emailState === 'sent' ? 'Email Sent!' : emailState === 'error' ? 'Send Failed' : emailState === 'sending' ? 'Sending…' : 'Email Client'}
        </button>

        {/* Copy Share Link */}
        {quoteData.shareToken && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/quote/${quoteData.shareToken}`);
              setCopyLinkState('copied');
              setTimeout(() => setCopyLinkState('idle'), 2000);
            }}
            style={{
              flex: 1, minWidth: '130px', height: '52px', borderRadius: '12px', cursor: 'pointer',
              border: copyLinkState === 'copied' ? '1.5px solid #bbf7d0' : `1.5px solid ${g[200]}`,
              backgroundColor: copyLinkState === 'copied' ? '#f0fdf4' : g.white,
              color: copyLinkState === 'copied' ? '#16a34a' : g[700],
              fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {copyLinkState === 'copied' ? (
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
            {copyLinkState === 'copied' ? 'Link Copied!' : 'Copy Share Link'}
          </button>
        )}

        {/* New Quote */}
        <button
          onClick={onReset}
          style={{ height: '52px', padding: '0 24px', borderRadius: '12px', border: `1.5px solid ${g[200]}`, cursor: 'pointer', backgroundColor: g.white, color: g[700], fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
        >
          <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Quote
        </button>
      </div>

      {/* Email error feedback */}
      <AnimatePresence>
        {emailState === 'error' && emailError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{ ...sans, fontSize: '12px', color: '#dc2626', textAlign: 'center', marginTop: '-6px' }}
          >
            {emailError}
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  );
}
