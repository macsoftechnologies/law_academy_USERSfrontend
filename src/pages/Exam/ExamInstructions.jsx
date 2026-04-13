import { useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';
import './exam.css';

export default function ExamInstructions() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const test      = state?.test || null;
  const item      = state?.item || null;
  const isEnrolled = state?.isEnrolled || false;
  const categoryLabel = state?.categoryLabel || 'Test';
  const prelimsId = state?.prelimsId || null;
  const module_type = state?.module_type || null;
  const mocktest_subject_id = state?.mocktest_subject_id || null;
  const termsData = state?.termsData || null;

  if (!test) { navigate(-1); return null; }

  const instructions = termsData?.instructions || [];
  const typeLabel = { QZ: 'Quiz', SMT: 'Subject Mock Test', GT: 'Grand Test', PQA: 'Previous Year Questions' };

  const INSTRUCTION_ICONS = ['⏱', '📝', '✅', '⚠️', '🔄', '📱', '🔒', '💡'];

  const handleStartExam = () => {
    navigate(`/prelims/${prelimsId}/exam/${test.prelimes_test_id}`, {
      state: { test, item, isEnrolled, categoryLabel, prelimsId, module_type, mocktest_subject_id }
    });
  };

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content" style={{ margin: '0 auto' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-navy" style={{ marginBottom: '.5rem' }}>{typeLabel[module_type] || categoryLabel}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,2vw,1.7rem)', color: 'var(--navy)' }}>
              {test.title}
            </h1>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { icon: '📝', label: 'Total Questions', value: test.no_of_qos || '—' },
              { icon: '⏱', label: 'Duration', value: test.duration ? `${test.duration} mins` : '—' },
              { icon: '🔢', label: 'Test Number', value: `#${test.test_number}` },
              { icon: '📂', label: 'Type', value: typeLabel[module_type] || module_type },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div className="card-body" style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '.35rem' }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.05rem' }}>{s.value}</div>
                  <div style={{ fontSize: '.73rem', color: 'var(--gray-500)', marginTop: '.15rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                📌 Exam Instructions
              </h2>

              {instructions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                  {instructions.map((inst, i) => (
                    <div key={i} style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start', padding: '.75rem', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold-pale)' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{INSTRUCTION_ICONS[i % INSTRUCTION_ICONS.length]}</span>
                      <span style={{ fontSize: '.875rem', color: 'var(--gray-700)', lineHeight: 1.65 }}>{inst}</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Default instructions if none from API */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                  {[
                    `You have ${test.duration || '—'} minutes to complete the test.`,
                    `The test contains ${test.no_of_qos || '—'} questions.`,
                    'There is only one correct answer to each question.',
                    'There is 1/4 negative marking for each wrong answer.',
                    'You can navigate between questions using the sidebar.',
                    'You can flag questions to review them later.',
                    'Do not refresh or close the browser during the test.',
                    'The test auto-submits when time runs out.',
                  ].map((inst, i) => (
                    <div key={i} style={{ display: 'flex', gap: '.85rem', alignItems: 'flex-start', padding: '.75rem', background: 'var(--cream)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gold-pale)' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{INSTRUCTION_ICONS[i % INSTRUCTION_ICONS.length]}</span>
                      <span style={{ fontSize: '.875rem', color: 'var(--gray-700)', lineHeight: 1.65 }}>{inst}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="toast warning" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            ⚠️ Once you click "Start Exam", the timer will begin and cannot be paused.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
            <button className="btn btn-primary" onClick={handleStartExam}>
              🚀 Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}