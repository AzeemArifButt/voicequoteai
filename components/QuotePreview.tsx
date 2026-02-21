'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';
import type { QuoteData } from '@/app/page';

// ─── Theme definitions ─────────────────────────────────────────────────────
interface PdfTheme { name: string; color: string; dark: string; light: string; border: string; }

const PDF_THEMES: PdfTheme[] = [
  { name: 'Gold',   color: '#C9973B', dark: '#92400E', light: '#FEF6E4', border: '#ECD68A' },
  { name: 'Blue',   color: '#2563EB', dark: '#1E3A8A', light: '#EFF6FF', border: '#BFDBFE' },
  { name: 'Teal',   color: '#0D9488', dark: '#134E4A', light: '#F0FDFA', border: '#99F6E4' },
  { name: 'Ruby',   color: '#DC2626', dark: '#7F1D1D', light: '#FEF2F2', border: '#FECACA' },
  { name: 'Purple', color: '#7C3AED', dark: '#4C1D95', light: '#F5F3FF', border: '#DDD6FE' },
  { name: 'Green',  color: '#16A34A', dark: '#14532D', light: '#F0FDF4', border: '#BBF7D0' },
  { name: 'Slate',  color: '#475569', dark: '#1E293B', light: '#F8FAFC', border: '#CBD5E1' },
  { name: 'Black',  color: '#111827', dark: '#030712', light: '#F9FAFB', border: '#D1D5DB' },
];

// ─── Theme context (avoids passing accent through every Field call) ─────────
const ThemeCtx = React.createContext<PdfTheme>(PDF_THEMES[0]);

// ─── Inline-editable field ─────────────────────────────────────────────────
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

// ─── Section heading (reads accent from context) ───────────────────────────
function SectionHead({ label }: { label: string }) {
  const theme = React.useContext(ThemeCtx);
  return (
    <p style={{
      fontSize: '10px', fontWeight: 800, color: theme.color,
      letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '13px', lineHeight: 1,
      fontFamily: 'ui-sans-serif, system-ui, Arial, Helvetica, sans-serif',
    }}>
      {label}
    </p>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
interface QuotePreviewProps { quoteData: QuoteData; onReset: () => void; }

export default function QuotePreview({ quoteData, onReset }: QuotePreviewProps) {
  const documentRef = useRef<HTMLDivElement>(null);
  const quoteNum = useRef(`QT-${Date.now().toString().slice(-6)}`);
  const [editBannerVisible, setEditBannerVisible] = useState(true);
  const [theme, setTheme] = useState<PdfTheme>(PDF_THEMES[0]);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const paragraphs = quoteData.proposalText.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

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
    };
    html2pdf().set(options).from(documentRef.current).save();
  };

  const sans: React.CSSProperties = { fontFamily: 'ui-sans-serif, system-ui, Arial, Helvetica, sans-serif' };
  const g = { white: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 900: '#111827' };

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
          <span style={{ fontSize: '10px', color: g[300] }}>A4 · Portrait</span>
        </div>

        {/* ═══ DOCUMENT START ═══ */}
        <ThemeCtx.Provider value={theme}>
          <div
            ref={documentRef}
            style={{ backgroundColor: g.white, borderLeft: `16px solid ${theme.color}`, maxWidth: '794px', margin: '0 auto', ...sans }}
          >
            {/* ── Header ── */}
            <div style={{ padding: '36px 44px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
              {/* PROPOSAL bordered box */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'inline-block', border: '2.5px solid #111827', borderRadius: '14px', padding: '14px 32px 16px' }}>
                  <p style={{ fontSize: '42px', fontWeight: 900, color: '#111827', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '7px' }}>PROPOSAL</p>
                  <Field text={quoteData.companyName.toUpperCase()} style={{ fontSize: '12px', fontWeight: 700, color: g[600], letterSpacing: '0.22em' }} />
                </div>
              </div>
              {/* Right: logo + prepared by */}
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

            {/* Accent rule */}
            <div style={{ height: '2px', backgroundColor: theme.color, margin: '0 44px' }} />

            {/* ── Prepared by / for ── */}
            <div style={{ backgroundColor: theme.light, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, padding: '16px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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

            {/* ── PROJECT DESCRIPTION ── */}
            <div style={{ padding: '28px 44px 0' }}>
              <SectionHead label="PROJECT DESCRIPTION" />
              {paragraphs[0] && <Field text={paragraphs[0]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify', marginBottom: '13px' }} block />}
              {paragraphs[1] && <Field text={paragraphs[1]} style={{ fontSize: '13px', color: g[700], lineHeight: '1.82', display: 'block', textAlign: 'justify' }} block />}
            </div>

            {/* ── TIMELINE + COST ── */}
            <div style={{ padding: '24px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', borderTop: `1px solid ${g[100]}`, marginTop: '24px' }}>
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
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginTop: '10px', lineHeight: 1 }}>$</span>
                  <Field text={quoteData.totalPrice} style={{ fontSize: '44px', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1 }} />
                </div>
                <Field text="• Total project cost, all inclusive" style={{ fontSize: '12px', color: g[700], display: 'block', marginBottom: '5px' }} block />
                <Field text="• Payment terms to be discussed" style={{ fontSize: '12px', color: g[700], display: 'block' }} block />
              </div>
            </div>

            {/* ── OTHER NOTES ── */}
            {paragraphs.length > 2 && (
              <div style={{ padding: '0 44px', borderTop: `1px solid ${g[100]}` }}>
                <div style={{ paddingTop: '24px' }}>
                  <SectionHead label="OTHER NOTES" />
                  {paragraphs.slice(2).map((para, i) => (
                    <Field key={i} text={para} style={{ fontSize: '13px', color: g[700], lineHeight: '1.75', display: 'block', textAlign: 'justify', marginBottom: '12px' }} block />
                  ))}
                </div>
              </div>
            )}

            {/* ── ACCEPTANCE ── */}
            <div style={{ padding: '24px 44px 36px', borderTop: `1px solid ${g[100]}`, marginTop: '4px' }}>
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

            {/* Bottom accent bar */}
            <div style={{ height: '10px', backgroundColor: theme.color }} />
          </div>
        </ThemeCtx.Provider>
        {/* ═══ DOCUMENT END ═══ */}

        {/* Screen-only footer (outside documentRef → never in PDF) */}
        <div style={{ backgroundColor: g[50], borderTop: `1px solid ${g[100]}`, padding: '10px 20px', textAlign: 'center' }}>
          <p style={{ ...sans, fontSize: '11px', color: g[400] }}>
            Generated by VoiceQuote AI · {today} · Confidential — prepared for {quoteData.clientName}
          </p>
        </div>
      </motion.div>

      {/* ── Action buttons — BELOW the preview ── */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleDownloadPDF}
          style={{
            flex: 1, height: '52px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${theme.dark}, ${theme.color})`,
            color: '#ffffff', fontSize: '14px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: `0 4px 18px rgba(0,0,0,0.22)`,
          }}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
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

    </div>
  );
}
