import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Rao's Law Academy ("the Platform"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must discontinue use of the Platform immediately. These Terms apply to all users including visitors, registered students, and subscribers.`,
  },
  {
    title: '2. User Accounts',
    content: `You must be at least 18 years old to register an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately at support@makaslaw.in of any unauthorized use of your account. We reserve the right to terminate accounts that violate these Terms.`,
  },
  {
    title: '3. Course Access & Intellectual Property',
    content: `Upon purchase, you are granted a limited, non-transferable, non-exclusive license to access and view the course content for personal, non-commercial purposes. All course materials, videos, notes, and resources are the intellectual property of Rao's Law Academy. You may not reproduce, redistribute, sell, or create derivative works from our content without explicit written permission.`,
  },
  {
    title: '4. Payments & Pricing',
    content: `All prices listed on the Platform are in Indian Rupees (INR) and are inclusive of applicable GST. Rao's Law Academy reserves the right to change course prices at any time without prior notice. Payment must be completed in full before access to purchased content is granted. We partner with trusted payment gateways to ensure the security of your transactions.`,
  },
  {
    title: '5. Refund Policy',
    content: `We offer a 7-day refund policy from the date of purchase, provided that you have consumed less than 20% of the course content. Refund requests must be submitted via the Help Center. Refunds, once approved, will be credited to your original payment method within 5–10 business days. Courses purchased during promotional sales or with coupon codes may have modified refund eligibility.`,
  },
  {
    title: '6. Prohibited Conduct',
    content: `You agree not to: share your account credentials with others; record, screenshot, or distribute course videos; attempt to circumvent content protection measures; use the Platform for any unlawful purpose; post or transmit harmful, offensive, or misleading content; or engage in any activity that disrupts or interferes with the Platform's services.`,
  },
  {
    title: '7. Disclaimer of Warranties',
    content: `The Platform and its content are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses. Educational content is provided for informational purposes and does not constitute legal advice.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `To the maximum extent permitted by law, Rao's Law Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Platform. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.`,
  },
  {
    title: '9. Changes to Terms',
    content: `We reserve the right to update or modify these Terms at any time. Changes will be posted on this page with an updated "Last Revised" date. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.`,
  },
  {
    title: '10. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Vijayawada, Andhra Pradesh, India.`,
  },
];

export default function Terms() {
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
                  <a key={i} href={`#section-${i}`} style={{ display: 'block', padding: '.4rem .65rem', borderRadius: 'var(--radius-sm)', fontSize: '.76rem', color: 'var(--gray-600)', fontWeight: 500, transition: 'all .15s', textDecoration: 'none' }}
                    onMouseOver={e => { e.target.style.background = 'var(--gray-100)'; e.target.style.color = 'var(--navy)'; }}
                    onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gray-600)'; }}>
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div>
              {/* Header */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-body" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '2.5rem' }}>📋</div>
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '.35rem' }}>Terms & Conditions</h1>
                      <p style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>Last revised: 1 January 2025 &nbsp;•&nbsp; Effective immediately upon registration</p>
                      <p style={{ fontSize: '.875rem', color: 'var(--gray-600)', marginTop: '.6rem', lineHeight: 1.7 }}>
                        Please read these Terms carefully before using Rao's Law Academy. These terms govern your use of the Platform and establish rights and responsibilities for both users and the Academy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {SECTIONS.map((s, i) => (
                <div key={i} id={`section-${i}`} className="card" style={{ marginBottom: '.75rem' }}>
                  <div className="card-body" style={{ padding: '1.25rem 1.5rem' }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy)', marginBottom: '.75rem' }}>{s.title}</h2>
                    <p style={{ fontSize: '.875rem', color: 'var(--gray-600)', lineHeight: 1.8 }}>{s.content}</p>
                  </div>
                </div>
              ))}

              <div className="card" style={{ marginTop: '.25rem' }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>Questions about our Terms?</div>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard/help')}>📬 Contact Us</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
