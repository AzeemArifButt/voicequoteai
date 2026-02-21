'use client';

import { useState, useEffect, useCallback } from 'react';

const SUB_KEY = 'voicequote_sub';
const USAGE_KEY = 'voicequote_usage';
const FREE_QUOTA = 3;

interface SubData {
  isPro: boolean;
  plan: 'pro' | 'business';
  email: string;
  sessionId: string;
  expiresAt: string;
}

interface UsageData {
  count: number;
  month: string; // "YYYY-MM"
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function readSub(): SubData | null {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SubData;
    // Expired — treat as free
    if (new Date(data.expiresAt) < new Date()) {
      localStorage.removeItem(SUB_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function readUsage(): UsageData {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { count: 0, month: currentMonth() };
    const data = JSON.parse(raw) as UsageData;
    // Reset if new month
    if (data.month !== currentMonth()) {
      return { count: 0, month: currentMonth() };
    }
    return data;
  } catch {
    return { count: 0, month: currentMonth() };
  }
}

export function useSubscription() {
  const [sub, setSub] = useState<SubData | null>(null);
  const [usage, setUsage] = useState<UsageData>({ count: 0, month: currentMonth() });
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Read from localStorage on mount (client-only)
  useEffect(() => {
    setSub(readSub());
    setUsage(readUsage());
  }, []);

  const isPro = sub?.isPro === true;
  const quotesUsedThisMonth = isPro ? 0 : usage.count;
  const quotesRemaining: number | null = isPro ? null : Math.max(0, FREE_QUOTA - usage.count);

  const recordQuoteUsed = useCallback(() => {
    if (isPro) return;
    const newUsage = { count: usage.count + 1, month: currentMonth() };
    localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
    setUsage(newUsage);
  }, [isPro, usage.count]);

  const upgradeToCheckout = useCallback((plan: 'pro' | 'business') => {
    const url =
      plan === 'business'
        ? process.env.NEXT_PUBLIC_LEMON_BUSINESS_URL
        : process.env.NEXT_PUBLIC_LEMON_PRO_URL;
    if (url) {
      window.location.href = url;
    } else {
      alert('Checkout not configured yet. Please contact support.');
    }
  }, []);

  const restoreAccess = useCallback(async (email: string): Promise<boolean> => {
    setIsRestoring(true);
    setRestoreError(null);
    try {
      const res = await fetch('/api/lemon/restore-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setRestoreError(data.error || 'Failed to look up subscription.');
        return false;
      }

      if (!data.active) {
        setRestoreError('No active subscription found for this email.');
        return false;
      }

      const newSub: SubData = {
        isPro: true,
        plan: data.plan,
        email: data.email,
        sessionId: 'restored',
        expiresAt: data.expiresAt,
      };
      localStorage.setItem(SUB_KEY, JSON.stringify(newSub));
      setSub(newSub);
      return true;
    } catch {
      setRestoreError('Network error. Please try again.');
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return {
    isPro,
    plan: sub?.plan ?? 'free',
    email: sub?.email ?? '',
    quotesUsedThisMonth,
    quotesRemaining,
    freeQuota: FREE_QUOTA,
    isRestoring,
    restoreError,
    recordQuoteUsed,
    upgradeToCheckout,
    restoreAccess,
  };
}
