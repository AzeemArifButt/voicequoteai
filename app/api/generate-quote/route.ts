import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Initialize the Groq client once (outside the handler) for connection reuse.
// The SDK automatically reads process.env.GROQ_API_KEY.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Limits: 20 generations per hour, 60 per day per IP
const HOURLY_LIMIT = 20;
const DAILY_LIMIT = 60;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──
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

    // Parse request body
    const body = await request.json();
    const { transcribedText, clientName, clientEmail, totalPrice } = body;

    // Input validation
    if (!transcribedText || typeof transcribedText !== 'string' || !transcribedText.trim()) {
      return NextResponse.json(
        { error: 'transcribedText is required.' },
        { status: 400 }
      );
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

    // Guard: fail fast if the key was never set
    if (!process.env.GROQ_API_KEY) {
      console.error('[generate-quote] GROQ_API_KEY environment variable is not set.');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Call Groq with Llama 3.3 (llama-3.3-70b-versatile is the current production model)
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
Total Project Price: $${totalPrice}

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

    return NextResponse.json({ proposalText: proposalText.trim() });
  } catch (error: unknown) {
    console.error('[generate-quote] Error:', error);

    // Surface specific Groq API error types to the client
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

    return NextResponse.json(
      { error: 'Failed to generate proposal. Please try again.' },
      { status: 500 }
    );
  }
}
