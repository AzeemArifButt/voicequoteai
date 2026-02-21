import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * POST /api/lemon/webhook
 * LemonSqueezy sends HMAC-SHA256 signature in X-Signature header.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No X-Signature header.' }, { status: 400 });
  }

  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    console.error('[lemon/webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  // Verify signature
  const digest = crypto
    .createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (digest !== signature) {
    console.error('[lemon/webhook] Invalid signature.');
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventName: string = event.meta?.event_name ?? '';
  const attrs = event.data?.attributes ?? {};

  switch (eventName) {
    case 'order_created':
      console.log('[lemon/webhook] Order created:', event.data?.id, attrs.user_email);
      break;
    case 'subscription_created':
      console.log('[lemon/webhook] Subscription created:', event.data?.id, attrs.user_email);
      break;
    case 'subscription_updated':
      console.log('[lemon/webhook] Subscription updated:', event.data?.id, attrs.status);
      break;
    case 'subscription_cancelled':
      console.log('[lemon/webhook] Subscription cancelled:', event.data?.id, attrs.user_email);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
