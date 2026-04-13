import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Loader from '../../components/common/Loader';
import { getTermsByType } from '../../api/prelims/prelimsApi';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';
import './exam.css';

export default function ExamTerms() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const test                = state?.test                || null;
  const item                = state?.item                || null;
  const isEnrolled          = state?.isEnrolled          || false;
  const categoryLabel       = state?.categoryLabel       || 'Test';
  const prelimsId           = state?.prelimsId           || null;
  const module_type         = state?.module_type         || null;
  const mocktest_subject_id = state?.mocktest_subject_id || null;

  const [termsData, setTermsData] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [accepted,  setAccepted]  = useState(false);

  const TYPE_LABELS = { QZ: 'Quiz', SMT: 'Subject Mock Test', GT: 'Grand Test', PQA: 'Previous Year Questions' };

  useEffect(() => {
    if (!test) { navigate(-1); return; }

    getTermsByType({ testType: module_type })
      .then(r => {
        if (r.statusCode === 200 && r.data?.length) {
          setTermsData(r.data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleProceed = () => {
    if (!accepted) return;
    navigate(`/prelims/${prelimsId}/exam-instructions`, {
      state: { test, item, isEnrolled, categoryLabel, prelimsId, module_type, mocktest_subject_id, termsData }
    });
  };

  if (!test) return null;

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content" style={{  margin: '0 auto' }}>

          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {/* Page header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-navy" style={{ marginBottom: '.5rem' }}>
              {TYPE_LABELS[module_type] || categoryLabel}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,2vw,1.7rem)', color: 'var(--navy)', margin: '.25rem 0 .5rem' }}>
              {test.title}
            </h1>
            <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
              {test.no_of_qos && (
                <span style={{ fontSize: '.82rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '.2rem .65rem', borderRadius: 'var(--radius-full)' }}>
                  📝 {test.no_of_qos} Questions
                </span>
              )}
              {test.duration && (
                <span style={{ fontSize: '.82rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '.2rem .65rem', borderRadius: 'var(--radius-full)' }}>
                  ⏱ {test.duration} mins
                </span>
              )}
              {test.test_number && (
                <span style={{ fontSize: '.82rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '.2rem .65rem', borderRadius: 'var(--radius-full)' }}>
                  🔢 Test #{test.test_number}
                </span>
              )}
            </div>
          </div>

          {loading ? <Loader /> : (
            <>
              {/* Terms & Conditions */}
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body">
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem' }}>
                    📋 Terms &amp; Conditions
                  </h2>
                  {termsData?.terms_conditions?.length ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                      {termsData.terms_conditions.map((term, i) => (
                        <li key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'var(--gold-pale)', color: 'var(--navy)',
                            fontWeight: 800, fontSize: '.72rem', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '.1rem'
                          }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: '.9rem', color: 'var(--gray-700)', lineHeight: 1.65 }}>{term}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: 'var(--gray-500)', fontSize: '.875rem' }}>
                      No specific terms found for this test type — default exam rules apply.
                    </p>
                  )}
                </div>
              </div>

              {/* Accept checkbox */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-body">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={e => setAccepted(e.target.checked)}
                      style={{ marginTop: '.2rem', width: 18, height: 18, accentColor: 'var(--navy)', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '.875rem', color: 'var(--gray-700)', lineHeight: 1.65 }}>
                      I have read and agree to all the terms and conditions above. I understand that once the exam begins,
                      it <strong>cannot be paused or restarted</strong>, and the timer will run until I submit or time runs out.
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!accepted}
                  onClick={handleProceed}
                  style={{ opacity: accepted ? 1 : 0.45, cursor: accepted ? 'pointer' : 'not-allowed' }}
                >
                  Proceed to Instructions →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}