/**
 * Paddle Billing server-side utilities.
 * All API calls use the secret PADDLE_API_KEY — never expose this to the client.
 */

const PADDLE_API =
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';

function apiHeaders() {
  return {
    Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Verify a Paddle webhook signature.
 * Paddle sends: Paddle-Signature: ts=<timestamp>;h1=<hmac-sha256>
 * We verify: HMAC-SHA256(`${timestamp}:${rawBody}`, webhookSecret) === h1
 */
export async function verifyPaddleWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(';').map((p) => {
        const idx = p.indexOf('=');
        return [p.slice(0, idx), p.slice(idx + 1)] as [string, string];
      })
    );
    const ts = parts['ts'];
    const h1 = parts['h1'];
    if (!ts || !h1) return false;

    const { createHmac } = await import('crypto');
    const expected = createHmac('sha256', secret)
      .update(`${ts}:${rawBody}`)
      .digest('hex');
    return expected === h1;
  } catch {
    return false;
  }
}

/** List active subscriptions for a customer email (used for restore-access). */
export async function getSubscriptionsByEmail(email: string) {
  const url = new URL(`${PADDLE_API}/subscriptions`);
  url.searchParams.set('customer_email', email);
  url.searchParams.set('status', 'active');
  const res = await fetch(url.toString(), { headers: apiHeaders() });
  if (!res.ok) throw new Error(`Paddle API error: ${res.status}`);
  return res.json();
}
