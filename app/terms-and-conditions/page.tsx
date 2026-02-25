export const metadata = {
  title: 'Terms & Conditions — VoiceQuote AI',
  description: 'Terms and Conditions for using VoiceQuote AI.',
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

export default function TermsAndConditions() {
  const effectiveDate = 'February 24, 2026';
  const contactEmail = 'legal@voicequoteai.com';

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
            Terms & Conditions
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 40px', fontFamily: FF }}>
            Effective date: {effectiveDate}
          </p>

          <Section title="1. Agreement to Terms">
            <P>
              By accessing or using VoiceQuote AI ("Service") at voicequoteai.vercel.app, you agree to be bound
              by these Terms and Conditions ("Terms"). If you disagree with any part, you may not use the Service.
            </P>
          </Section>

          <Section title="2. Description of Service">
            <P>
              VoiceQuote AI is a web application that allows users to generate professional business proposals
              and quotes by recording voice input. The audio is transcribed by an AI and transformed into
              a formatted, downloadable PDF proposal.
            </P>
          </Section>

          <Section title="3. Free Plan and Subscription Terms">
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li><strong>Free plan:</strong> Includes 3 quote generations per calendar month. No credit card required.</Li>
              <Li><strong>Paid plans (Pro, Business):</strong> Billed monthly. Subscriptions renew automatically until cancelled.</Li>
              <Li><strong>Billing:</strong> All payments are processed by Paddle, our Merchant of Record. By subscribing, you authorise Paddle to charge your payment method on a recurring monthly basis.</Li>
              <Li><strong>Cancellation:</strong> You may cancel at any time via your Paddle billing portal. Access continues until the end of the current billing period.</Li>
              <Li><strong>Price changes:</strong> We will provide at least 30 days' notice before changing subscription prices.</Li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <P>You agree not to use the Service to:</P>
            <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
              <Li>Generate proposals containing fraudulent, misleading, or illegal content.</Li>
              <Li>Violate any applicable laws or regulations.</Li>
              <Li>Attempt to circumvent usage quotas or access controls.</Li>
              <Li>Reverse engineer or copy any part of the Service.</Li>
              <Li>Upload or process audio containing illegal content or content that infringes third-party rights.</Li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <P>
              The generated proposals are yours — you own the output content you create using the Service.
              The VoiceQuote AI platform, branding, and underlying technology remain our intellectual property.
            </P>
          </Section>

          <Section title="6. Disclaimer of Warranties">
            <P>
              The Service is provided "as is" without warranties of any kind, express or implied, including
              warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not
              warrant that the Service will be uninterrupted, error-free, or that AI-generated content will be
              accurate or suitable for your specific purpose. You are responsible for reviewing all generated
              content before sending it to clients.
            </P>
          </Section>

          <Section title="7. Limitation of Liability">
            <P>
              To the maximum extent permitted by applicable law, VoiceQuote AI and its operators shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages, including loss
              of profits, data, or goodwill, arising from your use of the Service, even if we have been advised
              of the possibility of such damages.
            </P>
            <P>
              Our total cumulative liability to you shall not exceed the greater of (a) the amount you paid us
              in the 12 months prior to the claim, or (b) $100 USD.
            </P>
          </Section>

          <Section title="8. Indemnification">
            <P>
              You agree to indemnify and hold harmless VoiceQuote AI and its operators from any claims,
              damages, or expenses (including reasonable legal fees) arising from your use of the Service,
              your violation of these Terms, or your violation of any third-party rights.
            </P>
          </Section>

          <Section title="9. Governing Law">
            <P>
              These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict
              of law provisions. Users in the United Kingdom retain rights under applicable UK consumer law
              which cannot be excluded by contract.
            </P>
            <P>
              Any disputes arising under these Terms shall first be attempted to be resolved through good-faith
              negotiation. Failing that, disputes shall be resolved in the courts of Delaware, USA.
            </P>
          </Section>

          <Section title="10. Changes to Terms">
            <P>
              We reserve the right to modify these Terms at any time. We will provide at least 30 days' notice
              of material changes by updating the effective date and, where appropriate, notifying you by email.
              Continued use of the Service after changes take effect constitutes acceptance.
            </P>
          </Section>

          <Section title="11. Termination">
            <P>
              We reserve the right to suspend or terminate your access to the Service at our discretion, with
              or without notice, for violation of these Terms or for any other reason. Upon termination, your
              right to use the Service ceases immediately.
            </P>
          </Section>

          <Section title="12. Contact">
            <P>
              Questions about these Terms?{' '}
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
