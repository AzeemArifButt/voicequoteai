import { NextRequest, NextResponse } from 'next/server';
import { verifyPaddleWebhook } from '@/lib/paddle';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('paddle-signature') ?? '';

  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    console.error('[paddle/webhook] PADDLE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const valid = await verifyPaddleWebhook(
    rawBody,
    signatureHeader,
    process.env.PADDLE_WEBHOOK_SECRET
  );
  if (!valid) {
    console.error('[paddle/webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventType: string = event.event_type ?? '';
  const data = event.data ?? {};

  // Extract customer email from Paddle's event payload
  const email: string =
    data.customer?.email ??
    data.billing_details?.email ??
    '';

  // Map price ID to plan name
  const priceId: string = data.items?.[0]?.price?.id ?? '';
  const bizPriceId = process.env.NEXT_PUBLIC_PADDLE_BUSINESS_PRICE_ID ?? '';
  const plan = priceId === bizPriceId ? 'business' : 'pro';

  const supabase = createServiceClient();

  switch (eventType) {
    case 'subscription.created':
    case 'subscription.updated':
      if (email) {
        await supabase.from('users').update({ plan }).eq('email', email);
        console.log(`[paddle/webhook] ${eventType}: set plan=${plan} for ${email}`);
      }
      break;

    case 'subscription.canceled':
      if (email) {
        await supabase.from('users').update({ plan: 'free' }).eq('email', email);
        console.log(`[paddle/webhook] subscription.canceled: reset to free for ${email}`);
      }
      break;

    case 'transaction.completed':
      console.log('[paddle/webhook] transaction.completed:', data.id);
      break;

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
