import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Limits: 15 transcriptions per hour, 50 per day per IP
const HOURLY_LIMIT = 15;
const DAILY_LIMIT = 50;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──
    const ip = getClientIp(request);

    const hourly = rateLimit('transcribe:hourly', ip, HOURLY_LIMIT, ONE_HOUR);
    if (!hourly.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${hourly.retryAfter} seconds before transcribing again.` },
        { status: 429, headers: { 'Retry-After': String(hourly.retryAfter) } }
      );
    }

    const daily = rateLimit('transcribe:daily', ip, DAILY_LIMIT, ONE_DAY);
    if (!daily.allowed) {
      return NextResponse.json(
        { error: 'Daily transcription limit reached. Please try again tomorrow.' },
        { status: 429, headers: { 'Retry-After': String(daily.retryAfter) } }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error. GROQ_API_KEY is not set.' },
        { status: 500 }
      );
    }

    // Parse the multipart/form-data — Next.js App Router handles this natively
    const formData = await request.formData();
    const audioEntry = formData.get('audio');

    if (!audioEntry || !(audioEntry instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file received.' },
        { status: 400 }
      );
    }

    // Determine the correct file extension from the MIME type
    // iOS Safari records as audio/mp4; Chrome/Android records as audio/webm
    const mimeType = audioEntry.type || 'audio/webm';
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

    // Groq SDK requires a File object with a proper extension in the filename
    const file = new File([audioEntry], `recording.${ext}`, { type: mimeType });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      response_format: 'text',
    });

    // When response_format is 'text', the SDK returns a plain string
    const text = typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;

    return NextResponse.json({ text: text?.trim() ?? '' });
  } catch (error: unknown) {
    console.error('[transcribe] Error:', error);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();

      if (msg.includes('401') || msg.includes('authentication') || msg.includes('api key')) {
        return NextResponse.json(
          { error: 'Invalid API key.' },
          { status: 401 }
        );
      }

      if (msg.includes('429') || msg.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limited. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Transcription failed. Please try again.' },
      { status: 500 }
    );
  }
}
