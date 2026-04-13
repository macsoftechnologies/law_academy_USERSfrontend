import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly, such as your name, email address, phone number, and payment details when you register or make a purchase. We also collect usage data automatically — including IP address, browser type, device information, pages visited, and time spent on the Platform — to help us improve our services and user experience.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your personal information to: create and manage your account; process payments and send transaction receipts; deliver course content and track progress; send important service updates and, with your consent, promotional communications; respond to support queries; personalise your experience on the Platform; detect and prevent fraud or misuse; and comply with applicable laws and regulations.`,
  },
  {
    title: '3. Sharing of Information',
    content: `We do not sell, rent, or trade your personal information to third parties. We may share information with trusted service providers (payment processors, cloud storage, analytics tools) who assist us in operating the Platform, subject to strict confidentiality obligations. We may also disclose information when required by law, court order, or to protect the rights and safety of our users or the public.`,
  },
  {
    title: '4. Cookies & Tracking Technologies',
    content: `We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyse traffic patterns. You can control cookie settings through your browser; however, disabling cookies may affect certain features of the Platform. We also use analytics services (such as Google Analytics) that collect anonymised usage data to help us understand how the Platform is used.`,
  },
  {
    title: '5. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will retain certain data for up to 90 days to resolve disputes, comply with legal obligations, or prevent fraud. Anonymised or aggregated data may be retained indefinitely for analytical purposes.`,
  },
  {
    title: '6. Data Security',
    content: `We implement industry-standard security measures including SSL/TLS encryption for data in transit, encrypted storage of sensitive data, access controls, and regular security audits. While we strive to protect your information, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '7. Your Rights',
    content: `Depending on your jurisdiction, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data (subject to legal obligations); withdraw consent for marketing communications at any time; and lodge a complaint with a data protection authority. To exercise any of these rights, please contact us at privacy@makaslaw.in.`,
  },
  {
    title: '8. Third-Party Links',
    content: `The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties. We encourage you to read the privacy policies of any external sites you visit.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `Our Platform is intended for users aged 18 and above. We do not knowingly collect personal information from individuals under 18. If we become aware that a minor has provided us with personal data, we will delete it promptly. If you believe a minor has registered on our Platform, please contact us immediately.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on the Platform. The "Last Revised" date at the top of this page will always reflect the most recent update. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Policy.`,
  },
];

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* Sticky sidebar TOC */}
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
              <div className="card-header" style={{ fontSize: '.8rem' }}>Contents</div>
              <div className="card-body" style={{ padding: '.75rem', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                {SECTIONS.map((s, i) => (
                  <a
                    key={i}
                    href={`#priv-section-${i}`}
                    style={{ display: 'block', padding: '.4rem .65rem', borderRadius: 'var(--radius-sm)', fontSize: '.76rem', color: 'var(--gray-600)', fontWeight: 500, transition: 'all .15s', textDecoration: 'none' }}
                    onMouseOver={e => { e.target.style.background = 'var(--gray-100)'; e.target.style.color = 'var(--navy)'; }}
                    onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gray-600)'; }}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div>
              {/* Header card */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-body" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2.5rem' }}>🔒</div>
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '.35rem' }}>Privacy Policy</h1>
                      <p style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>Last revised: 1 January 2025 &nbsp;•&nbsp; Effective upon account registration</p>
                      <p style={{ fontSize: '.875rem', color: 'var(--gray-600)', marginTop: '.6rem', lineHeight: 1.7 }}>
                        At Rao's Law Academy, your privacy matters to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {SECTIONS.map((s, i) => (
                <div key={i} id={`priv-section-${i}`} className="card" style={{ marginBottom: '.75rem' }}>
                  <div className="card-body" style={{ padding: '1.25rem 1.5rem' }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)', marginBottom: '.75rem' }}>{s.title}</h2>
                    <p style={{ fontSize: '.875rem', color: 'var(--gray-600)', lineHeight: 1.8 }}>{s.content}</p>
                  </div>
                </div>
              ))}

              {/* Contact card */}
              <div className="card" style={{ marginTop: '.25rem', background: 'linear-gradient(135deg,var(--navy),var(--navy-mid))', border: 'none' }}>
                <div className="card-body" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--cream)', marginBottom: '.25rem' }}>Privacy Questions?</div>
                    <div style={{ fontSize: '.82rem', color: 'rgba(255,247,224,.65)' }}>Reach out to our Data Protection team at privacy@makaslaw.in</div>
                  </div>
                  <button className="btn btn-gold btn-sm" onClick={() => navigate('/dashboard/help')}>📬 Contact Us</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
