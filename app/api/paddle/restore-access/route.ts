import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionsByEmail } from '@/lib/paddle';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!process.env.PADDLE_API_KEY) {
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 500 });
    }

    const json = await getSubscriptionsByEmail(email);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subs: any[] = json?.data ?? [];

    if (subs.length === 0) {
      return NextResponse.json({ active: false });
    }

    const sub = subs[0];
    const priceId: string = sub.items?.[0]?.price?.id ?? '';
    const bizPriceId = process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID ?? '';
    const plan = priceId === bizPriceId ? 'business' : 'pro';
    const expiresAt: string =
      sub.next_billed_at ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Update Supabase plan if user exists
    const supabase = createServiceClient();
    await supabase.from('users').update({ plan }).eq('email', email);

    return NextResponse.json({ active: true, plan, email, expiresAt });
  } catch (error) {
    console.error('[paddle/restore-access]', error);
    return NextResponse.json({ error: 'Failed to look up subscription.' }, { status: 500 });
  }
}
