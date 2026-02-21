import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionsByEmail } from '@/lib/lemonsqueezy';

/**
 * POST /api/lemon/restore-access
 * Body: { email: string }
 * Looks up active LemonSqueezy subscriptions for the email.
 * Returns { active, plan, email, expiresAt } or { active: false }.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    if (!process.env.LEMONSQUEEZY_API_KEY) {
      return NextResponse.json({ error: 'LEMONSQUEEZY_API_KEY not configured.' }, { status: 500 });
    }

    const json = await getSubscriptionsByEmail(email);
    const subs = json?.data ?? [];

    // Find the first active subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const active = subs.find((s: any) => s.attributes.status === 'active');

    if (!active) {
      return NextResponse.json({ active: false });
    }

    const attrs = active.attributes;
    const productId = String(attrs.product_id);

    // Map product ID → plan name
    let plan = 'pro';
    if (productId === process.env.LEMON_BUSINESS_PRODUCT_ID) {
      plan = 'business';
    }

    return NextResponse.json({
      active: true,
      plan,
      email: attrs.user_email ?? email,
      expiresAt: attrs.renews_at ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('[lemon/restore-access]', error);
    return NextResponse.json({ error: 'Failed to look up subscription.' }, { status: 500 });
  }
}
