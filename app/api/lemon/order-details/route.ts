import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/lemonsqueezy';

/**
 * GET /api/lemon/order-details?order_id=xxx
 * Called from the /success page after LemonSqueezy redirects back.
 * Returns { email } so we can personalise the success screen.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id.' }, { status: 400 });
  }

  if (!process.env.LEMONSQUEEZY_API_KEY) {
    return NextResponse.json({ error: 'LEMONSQUEEZY_API_KEY not configured.' }, { status: 500 });
  }

  try {
    const json = await getOrder(orderId);
    const attrs = json?.data?.attributes;

    if (!attrs) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ email: attrs.user_email ?? '' });
  } catch (error) {
    console.error('[lemon/order-details]', error);
    return NextResponse.json({ error: 'Failed to fetch order details.' }, { status: 500 });
  }
}
