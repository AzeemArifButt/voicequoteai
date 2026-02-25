import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase';

const FREE_QUOTA = 3;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('users')
    .select('plan, quote_count, quota_reset_date')
    .eq('clerk_id', userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'User not found — please reload' }, { status: 404 });
  }

  const isPro = data.plan !== 'free';
  const quotesRemaining = isPro ? null : Math.max(0, FREE_QUOTA - data.quote_count);

  return NextResponse.json({
    plan: data.plan,
    isPro,
    quotesRemaining,
    quoteCount: data.quote_count,
    quotaResetDate: data.quota_reset_date,
  });
}
