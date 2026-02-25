import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { createServiceClient } from '@/lib/supabase';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const HOURLY_LIMIT = 20;
const DAILY_LIMIT = 60;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;
const FREE_QUOTA = 3;

export async function POST(request: NextRequest) {
  try {
    // ── 1. Detect optional Clerk auth ──────────────────────────────────────
    let clerkUserId: string | null = null;
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const session = await auth();
      clerkUserId = session.userId ?? null;
    } catch {
      // Clerk not configured or not available — degrade gracefully
    }

    // ── 2. Rate limiting (always apply for unauthenticated) ────────────────
    if (!clerkUserId) {
      const ip = getClientIp(request);
      const hourly = rateLimit('generate:hourly', ip, HOURLY_LIMIT, ONE_HOUR);
      if (!hourly.allowed) {
        return NextResponse.json(
          { error: `Too many requests. Please wait ${hourly.retryAfter} seconds before generating again.` },
          { status: 429, headers: { 'Retry-After': String(hourly.retryAfter) } }
        );
      }
      const daily = rateLimit('generate:daily', ip, DAILY_LIMIT, ONE_DAY);
      if (!daily.allowed) {
        return NextResponse.json(
          { error: 'Daily generation limit reached. Please try again tomorrow.' },
          { status: 429, headers: { 'Retry-After': String(daily.retryAfter) } }
        );
      }
    }

    // ── 3. Parse + validate body ───────────────────────────────────────────
    const body = await request.json();
    const { transcribedText, clientName, clientEmail, totalPrice, currency, companyName } = body;

    if (!transcribedText || typeof transcribedText !== 'string' || !transcribedText.trim()) {
      return NextResponse.json({ error: 'transcribedText is required.' }, { status: 400 });
    }
    if (!clientName || typeof clientName !== 'string' || !clientName.trim()) {
      return NextResponse.json({ error: 'clientName is required.' }, { status: 400 });
    }
    if (!clientEmail || typeof clientEmail !== 'string' || !clientEmail.trim()) {
      return NextResponse.json({ error: 'clientEmail is required.' }, { status: 400 });
    }
    if (!totalPrice || typeof totalPrice !== 'string' || !totalPrice.trim()) {
      return NextResponse.json({ error: 'totalPrice is required.' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('[generate-quote] GROQ_API_KEY not set');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // ── 4. Supabase quota check (authenticated users only) ─────────────────
    let dbUser: { id: string; plan: string; quote_count: number } | null = null;
    if (clerkUserId) {
      const supabase = createServiceClient();
      const { data } = await supabase
        .from('users')
        .select('id, plan, quote_count, quota_reset_date')
        .eq('clerk_id', clerkUserId)
        .single();

      if (data) {
        // Auto-reset quota if needed
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

        if (data.plan === 'free' && quoteCount >= FREE_QUOTA) {
          return NextResponse.json(
            {
              error:
                'You have reached your 3 free quotes for this month. Upgrade to Pro for unlimited quotes.',
            },
            { status: 403 }
          );
        }

        dbUser = { id: data.id, plan: data.plan, quote_count: quoteCount };
      }
    }

    // ── 5. Generate proposal with Groq ────────────────────────────────────
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            "You are an expert business proposal writer. Take the user's rough voice notes and write a highly professional, polite, 3-paragraph business proposal/quote. Include a professional greeting to the client, a clear breakdown of the services mentioned, and a final price section. Do not include any extra chat, just output the proposal text.",
        },
        {
          role: 'user',
          content: `Client Name: ${clientName}
Client Email: ${clientEmail}
Total Project Price: ${(currency as string | undefined) ?? 'USD'} ${totalPrice}
${companyName ? `From: ${companyName}` : ''}

Voice Notes / Project Description:
${transcribedText.trim()}

Please write a professional 3-paragraph business proposal for this client.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const proposalText = chatCompletion.choices[0]?.message?.content;
    if (!proposalText || !proposalText.trim()) {
      throw new Error('Groq API returned an empty response.');
    }

    // ── 6. Save to Supabase + increment quota (authenticated only) ─────────
    let shareToken: string | null = null;
    if (clerkUserId && dbUser) {
      const supabase = createServiceClient();
      const { data: quote } = await supabase
        .from('quotes')
        .insert({
          user_id: dbUser.id,
          title: `Quote for ${clientName}`,
          client_name: clientName,
          client_email: clientEmail,
          company_name: companyName ?? '',
          total_price: totalPrice,
          currency: currency ?? 'USD',
          proposal_text: proposalText.trim(),
        })
        .select('share_token')
        .single();

      shareToken = quote?.share_token ?? null;

      await supabase
        .from('users')
        .update({ quote_count: dbUser.quote_count + 1 })
        .eq('id', dbUser.id);
    }

    return NextResponse.json({ proposalText: proposalText.trim(), shareToken });
  } catch (error: unknown) {
    console.error('[generate-quote] Error:', error);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('401') || msg.includes('authentication') || msg.includes('api key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your GROQ_API_KEY configuration.' },
          { status: 401 }
        );
      }
      if (msg.includes('429') || msg.includes('rate limit')) {
        return NextResponse.json(
          { error: 'The AI service is temporarily rate-limited. Please try again in a moment.' },
          { status: 429 }
        );
      }
      if (msg.includes('model') || msg.includes('not found')) {
        return NextResponse.json(
          { error: 'AI model not available. Please try again later.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ error: 'Failed to generate proposal. Please try again.' }, { status: 500 });
  }
}
