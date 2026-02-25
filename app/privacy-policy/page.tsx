export const metadata = {
  title: 'Privacy Policy — VoiceQuote AI',
  description: 'Privacy Policy for VoiceQuote AI. Learn how we collect, use, and protect your data.',
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

export default function PrivacyPolicy() {
  const effectiveDate = 'February 24, 2026';
  const contactEmail = 'privacy@voicequoteai.com';

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
            Privacy Policy
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 40px', fontFamily: FF }}>
            Effective date: {effectiveDate}
          </p>

          <Section title="1. Overview">
            <P>
              VoiceQuote AI ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our web application
              at voicequoteai.vercel.app (the "Service").
            </P>
            <P>
              By using the Service, you agree to the collection and use of information in accordance with this policy.
            </P>
          </Section>

          <Section title="2. Information We Collect">
            <P>We collect the following categories of information:</P>
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li><strong>Account information:</strong> When you sign up, we collect your name and email address via Clerk (our authentication provider).</Li>
              <Li><strong>Generated proposals:</strong> The proposals you generate are saved to our database (Supabase) and linked to your account.</Li>
              <Li><strong>Voice recordings (transient):</strong> Audio you record is sent directly to Groq's API for transcription. We do not store audio recordings — they are processed in real time and immediately discarded.</Li>
              <Li><strong>Payment information:</strong> Payments are handled entirely by Paddle (our Merchant of Record). We never store credit card numbers or sensitive payment details.</Li>
              <Li><strong>Usage data:</strong> We collect anonymous usage analytics via Vercel Analytics (page views, feature usage) to improve the Service.</Li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li>To provide and improve the Service (generate proposals, store your quote history).</Li>
              <Li>To manage your subscription and enforce usage quotas.</Li>
              <Li>To send transactional emails (e.g. proposal delivery) via Resend.</Li>
              <Li>To comply with legal obligations.</Li>
            </ul>
            <P>We do not sell your personal data to third parties.</P>
          </Section>

          <Section title="4. Third-Party Services">
            <P>We use the following third-party services to operate VoiceQuote AI:</P>
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li><strong>Groq:</strong> AI transcription and proposal generation. Audio and text are processed transiently.</Li>
              <Li><strong>Clerk:</strong> User authentication and identity management.</Li>
              <Li><strong>Supabase:</strong> Database for storing user accounts and proposals.</Li>
              <Li><strong>Paddle:</strong> Subscription billing and payment processing (Merchant of Record).</Li>
              <Li><strong>Vercel:</strong> Hosting, serverless functions, and anonymous analytics.</Li>
              <Li><strong>Resend:</strong> Transactional email delivery.</Li>
            </ul>
            <P>Each provider has its own privacy policy governing data they process on our behalf.</P>
          </Section>

          <Section title="5. Data Retention">
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li>Proposals are retained until you delete your account or request deletion.</Li>
              <Li>Audio recordings are never stored — they are discarded immediately after transcription.</Li>
              <Li>Payment records are retained by Paddle per their policy and applicable tax regulations.</Li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            <P><strong>GDPR (EU/UK residents):</strong> You have the right to access, rectify, erase, and export your personal data. You may also object to or restrict certain processing.</P>
            <P><strong>CCPA (California residents):</strong> You have the right to know what personal information we collect, the right to delete it, and the right to opt out of sale. We do not sell your data.</P>
            <P>To exercise any of these rights, email us at <strong>{contactEmail}</strong>. We will respond within 30 days.</P>
          </Section>

          <Section title="7. Cookies">
            <P>
              We use only strictly necessary cookies for authentication (via Clerk) and session management.
              We do not use advertising or tracking cookies. Vercel Analytics is cookieless and does not track
              individuals across sites.
            </P>
          </Section>

          <Section title="8. Data Security">
            <P>
              We implement industry-standard security measures including TLS encryption in transit, row-level
              security in our database, and access controls limiting data access to necessary systems only.
              However, no method of transmission or storage is 100% secure.
            </P>
          </Section>

          <Section title="9. Children's Privacy">
            <P>
              The Service is not directed at children under the age of 16. We do not knowingly collect personal
              information from children. If you become aware that a child has provided us with personal data, please
              contact us so we can delete it.
            </P>
          </Section>

          <Section title="10. Changes to This Policy">
            <P>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by
              updating the effective date at the top of this page. Continued use of the Service after changes
              constitutes acceptance of the updated policy.
            </P>
          </Section>

          <Section title="11. Contact Us">
            <P>
              For questions, data requests, or privacy concerns, contact us at:{' '}
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
