export const metadata = {
  title: 'Refund Policy — VoiceQuote AI',
  description: '30-day money-back guarantee. Learn about VoiceQuote AI refund and cancellation policy.',
};

const FF = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 12px', fontFamily: FF }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '15px', lineHeight: '1.75', color: '#334155', margin: '0 0 12px', fontFamily: FF }}>
      {children}
    </p>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ fontSize: '15px', lineHeight: '1.75', color: '#334155', marginBottom: '6px' }}>
      {children}
    </li>
  );
}

export default function RefundPolicy() {
  const effectiveDate = 'February 24, 2026';
  const contactEmail = 'support@voicequoteai.com';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f6ff', fontFamily: FF }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#0c1225', padding: '0 24px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: '16px', height: '16px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>VoiceQuote AI</span>
        </a>
        <a href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>← Back to App</a>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '48px',
          border: '1px solid #e2e8f0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', fontFamily: FF }}>
            Refund Policy
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 40px', fontFamily: FF }}>
            Effective date: {effectiveDate}
          </p>

          {/* Highlight box */}
          <div style={{
            backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px',
            padding: '20px 24px', marginBottom: '36px',
          }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#15803d', fontFamily: FF }}>
              ✓ 30-Day Money-Back Guarantee
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#166534', fontFamily: FF }}>
              If you're not satisfied within your first 30 days, we'll refund you in full — no questions asked.
            </p>
          </div>

          <Section title="1. Eligibility for Refunds">
            <P>We offer a full refund if:</P>
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li>You are a new subscriber to the Pro or Business plan.</Li>
              <Li>You request a refund within 30 days of your initial subscription payment.</Li>
              <Li>You have not already received a refund for a previous subscription.</Li>
            </ul>
          </Section>

          <Section title="2. How to Request a Refund">
            <P>
              To request a refund, email us at{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: '#2563eb' }}>{contactEmail}</a>{' '}
              with the subject line "Refund Request" and include:
            </P>
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li>The email address associated with your account.</Li>
              <Li>The date of your subscription purchase.</Li>
              <Li>A brief reason for your request (optional, but helpful).</Li>
            </ul>
            <P>We will process your request within 5 business days.</P>
          </Section>

          <Section title="3. Processing Refunds">
            <P>
              Refunds are processed by Paddle, our Merchant of Record. Once approved, refunds typically appear
              on your original payment method within 5–10 business days, depending on your bank or card issuer.
            </P>
            <P>
              Upon issuing a refund, your account will be downgraded to the Free plan immediately.
            </P>
          </Section>

          <Section title="4. Non-Refundable Items">
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li>Subscriptions older than 30 days from the initial payment date.</Li>
              <Li>Subsequent monthly renewals (only the initial subscription payment is eligible).</Li>
              <Li>The Free plan (there is no charge, so no refund applies).</Li>
              <Li>Accounts found to be in violation of our Terms & Conditions.</Li>
            </ul>
          </Section>

          <Section title="5. Cancellation">
            <P>
              You may cancel your subscription at any time from your Paddle billing portal (accessible via
              the email receipt you received when subscribing). Cancellation stops future charges. You retain
              access to paid features until the end of the current billing period.
            </P>
            <P>
              Cancellation does not automatically trigger a refund. For refunds within the 30-day window,
              please follow the process in Section 2 above.
            </P>
          </Section>

          <Section title="6. Exceptional Circumstances">
            <P>
              We may make exceptions to this policy at our discretion for cases of extended service outages,
              billing errors, or other extraordinary circumstances. Contact us and we'll do our best to
              make it right.
            </P>
          </Section>

          <Section title="7. Contact">
            <P>
              Questions about refunds?{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: '#2563eb' }}>{contactEmail}</a>
            </P>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12px' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} VoiceQuote AI.</p>
      </footer>
    </div>
  );
}
