import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';
  const firstName = clerkUser?.firstName ?? '';

  const supabase = createServiceClient();

  // Upsert user
  const { data: userData, error: upsertError } = await supabase
    .from('users')
    .upsert(
      { clerk_id: userId, email },
      { onConflict: 'clerk_id', ignoreDuplicates: false }
    )
    .select('id, plan, quote_count, quota_reset_date')
    .single();

  if (upsertError || !userData) {
    console.error('[dashboard] upsert error:', upsertError);
    redirect('/');
  }

  // Auto-reset quota if past reset date
  let quoteCount = userData.quote_count;
  if (new Date(userData.quota_reset_date) < new Date()) {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1, 1);
    nextReset.setHours(0, 0, 0, 0);
    await supabase
      .from('users')
      .update({ quote_count: 0, quota_reset_date: nextReset.toISOString() })
      .eq('id', userData.id);
    quoteCount = 0;
  }

  // Fetch quotes
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, title, client_name, client_email, company_name, total_price, currency, share_token, created_at')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const isPro = userData.plan !== 'free';
  const FREE_QUOTA = 3;
  const quotesRemaining = isPro ? null : Math.max(0, FREE_QUOTA - quoteCount);

  return (
    <DashboardClient
      quotes={quotes ?? []}
      plan={userData.plan}
      isPro={isPro}
      quotesRemaining={quotesRemaining}
      userName={firstName}
    />
  );
}
