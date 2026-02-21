/**
 * LemonSqueezy API helper (no SDK — plain fetch).
 * Docs: https://docs.lemonsqueezy.com/api
 */

const LEMON_API = 'https://api.lemonsqueezy.com/v1';

function apiHeaders() {
  return {
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };
}

/** Fetch a single order by ID (to get user email after checkout). */
export async function getOrder(orderId: string) {
  const res = await fetch(`${LEMON_API}/orders/${orderId}`, {
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error(`LemonSqueezy API error: ${res.status}`);
  return res.json();
}

/** List active subscriptions for an email address. */
export async function getSubscriptionsByEmail(email: string) {
  const url = new URL(`${LEMON_API}/subscriptions`);
  url.searchParams.set('filter[user_email]', email);
  const res = await fetch(url.toString(), { headers: apiHeaders() });
  if (!res.ok) throw new Error(`LemonSqueezy API error: ${res.status}`);
  return res.json();
}
