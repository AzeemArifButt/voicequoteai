'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuoteHistoryItem } from '@/hooks/useQuoteHistory';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$', JPY: '¥', INR: '₹',
};

const TEMPLATE_LABELS: Record<string, string> = {
  classic: 'Classic', modern: 'Modern', minimal: 'Minimal', executive: 'Executive',
};

interface QuoteHistoryProps {
  history: QuoteHistoryItem[];
  onClear: () => void;
}

export default function QuoteHistory({ history, onClear }: QuoteHistoryProps) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  const sans = 'ui-sans-serif, system-ui, -apple-system, Arial, sans-serif';

  return (
    <div style={{ maxWidth: '620px', margin: '16px auto 0', fontFamily: sans }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)',
          backgroundColor: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg style={{ width: '14px', height: '14px', opacity: 0.7 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Quotes ({history.length})
        </div>
        <span style={{ fontSize: '11px', opacity: 0.6 }}>{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: '0 0 12px 12px', border: '1px solid rgba(255,255,255,0.15)', borderTop: 'none', overflow: 'hidden' }}>
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 16px',
                    borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.clientName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      &nbsp;·&nbsp;{item.quoteRef}
                      {item.templateId && <>&nbsp;·&nbsp;{TEMPLATE_LABELS[item.templateId] ?? item.templateId}</>}
                    </p>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#111827', flexShrink: 0, margin: 0 }}>
                    {CURRENCY_SYMBOLS[item.currency] ?? '$'}{item.totalPrice}
                  </p>
                </div>
              ))}
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
                <button
                  onClick={onClear}
                  style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Clear history
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
