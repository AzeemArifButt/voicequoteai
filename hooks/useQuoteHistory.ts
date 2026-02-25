'use client';

import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'voicequote_history';
const MAX_HISTORY = 20;

export interface QuoteHistoryItem {
  id: string;
  date: string;
  clientName: string;
  quoteRef: string;
  totalPrice: string;
  currency: string;
  templateId: string;
  companyName: string;
}

function readHistory(): QuoteHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuoteHistoryItem[];
  } catch {
    return [];
  }
}

export function useQuoteHistory() {
  const [history, setHistory] = useState<QuoteHistoryItem[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const saveQuote = useCallback((item: QuoteHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, MAX_HISTORY);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const updateLatestTemplate = useCallback((templateId: string) => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], templateId };
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
    setHistory([]);
  }, []);

  return { history, saveQuote, updateLatestTemplate, clearHistory };
}
