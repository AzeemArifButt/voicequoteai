import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VoiceQuote AI – Professional Quotes in 30 Seconds';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0c1225 0%, #1e3a8a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid dot overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          display: 'flex',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.3) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', position: 'relative' }}>
          {/* Mic icon */}
          <div style={{
            width: '96px', height: '96px', borderRadius: '24px',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 48px rgba(37,99,235,0.6)',
          }}>
            <svg width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', display: 'flex' }}>
              VoiceQuote AI
            </div>
            <div style={{ fontSize: '26px', color: '#93c5fd', fontWeight: 500, display: 'flex' }}>
              Win More Jobs. Quote Faster.
            </div>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {['🎙 Speak Your Details', '⚡ AI Generates Proposal', '📄 Download PDF'].map((text) => (
              <div key={text} style={{
                padding: '8px 18px', borderRadius: '24px', fontSize: '15px',
                backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0', fontWeight: 500, display: 'flex',
              }}>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
