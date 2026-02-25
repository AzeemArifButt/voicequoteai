import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase';

const FREE_QUOTA = 3;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const email = user.emailAddresses[0]?.emailAddress ?? '';
  const supabase = createServiceClient();

  // Upsert: create on first login, update email on subsequent logins
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { clerk_id: userId, email },
      { onConflict: 'clerk_id', ignoreDuplicates: false }
    )
    .select('id, plan, quote_count, quota_reset_date')
    .single();

  if (error || !data) {
    console.error('[user/sync] upsert error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  // Auto-reset quota if we've passed the reset date
  let quoteCount = data.quote_count;
  if (new Date(data.quota_reset_date) < new Date()) {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1, 1);
    nextReset.setHours(0, 0, 0, 0);
    await supabase
      .from('users')
      .update({ quote_count: 0, quota_reset_date: nextReset.toISOString() })
      .eq('id', data.id);
    quoteCount = 0;
  }

  const isPro = data.plan !== 'free';
  const quotesRemaining = isPro ? null : Math.max(0, FREE_QUOTA - quoteCount);

  return NextResponse.json({
    id: data.id,
    plan: data.plan,
    isPro,
    quoteCount,
    quotesRemaining,
  });
}
