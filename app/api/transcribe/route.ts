import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

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

    // Initialise Groq inside the handler so env var is always available
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Parse the multipart/form-data
    const formData = await request.formData();
    const audioEntry = formData.get('audio');

    if (!audioEntry || !(audioEntry instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file received.' },
        { status: 400 }
      );
    }

    // Reject suspiciously small blobs (under 1 KB = likely empty/corrupt)
    if (audioEntry.size < 1000) {
      return NextResponse.json(
        { error: 'Recording too short. Please hold the mic and speak for at least 2 seconds.' },
        { status: 400 }
      );
    }

    // Fix 1: Strip codec info — browser sends "audio/webm;codecs=opus"
    // Groq needs plain "audio/webm" without the codec specifier
    const mimeType = (audioEntry.type || 'audio/webm').split(';')[0];
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

    const file = new File([audioEntry], `recording.${ext}`, { type: mimeType });

    // Fix 3: Use response_format 'json' — always returns { text: string }, no ambiguity
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      response_format: 'json',
    });

    return NextResponse.json({ text: transcription.text?.trim() ?? '' });

  } catch (error: unknown) {
    console.error('[transcribe] Error:', error);

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      const name = error.name;

      // Fix 2a: Groq SDK network/connection errors
      if (name === 'APIConnectionError' || name === 'APIConnectionTimeoutError') {
        return NextResponse.json(
          { error: 'Could not reach transcription service. Please check your connection and try again.' },
          { status: 503 }
        );
      }

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

      // Groq rejected the audio (bad format, too short, silent, etc.)
      if (msg.includes('400') || msg.includes('invalid_request') || msg.includes('could not process') || msg.includes('valid media')) {
        return NextResponse.json(
          { error: 'Could not process audio. Please record at least 2 seconds of speech and try again.' },
          { status: 400 }
        );
      }

      // Fix 2b: Groq 422 Unprocessable Entity
      if ('status' in error) {
        const status = (error as { status: number }).status;
        if (status === 422) {
          return NextResponse.json(
            { error: 'Audio format not supported. Please try recording again.' },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: 'Transcription failed. Please try again.' },
      { status: 500 }
    );
  }
}
