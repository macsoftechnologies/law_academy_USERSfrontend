import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';
import './exam.css';

const STATIC_EXAMS = [
  {
    id: 'mock-1',
    title: 'Legal Aptitude — Practice Set 1',
    subject: 'Legal Aptitude',
    questions: 10,
    duration: '30 mins',
    difficulty: 'Beginner',
    diffColor: '#16a34a',
    diffBg: '#dcfce7',
    icon: '⚖️',
    attempts: 240,
    description: 'Covers basic legal reasoning, constitutional provisions, and IPC fundamentals.',
  },
  {
    id: 'mock-2',
    title: 'Constitutional Law — Mock Test',
    subject: 'Constitutional Law',
    questions: 10,
    duration: '30 mins',
    difficulty: 'Intermediate',
    diffColor: '#2563eb',
    diffBg: '#dbeafe',
    icon: '📜',
    attempts: 185,
    description: 'Tests knowledge of Fundamental Rights, DPSP, and landmark constitutional cases.',
    locked: true,
  },
  {
    id: 'mock-3',
    title: 'IPC & Criminal Law — Test Series',
    subject: 'Criminal Law',
    questions: 10,
    duration: '30 mins',
    difficulty: 'Advanced',
    diffColor: '#dc2626',
    diffBg: '#fee2e2',
    icon: '🔏',
    attempts: 132,
    description: 'Comprehensive coverage of IPC sections, criminal procedure, and recent amendments.',
    locked: true,
  },
];

export default function ExamList() {
  const navigate = useNavigate();

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">
          <div className="exam-list-header">
            <div>
              <h1 className="exam-list-title">Mock Tests</h1>
              <p className="exam-list-sub">Practice with timed tests designed to simulate real exam conditions.</p>
            </div>
          </div>

          <div className="exam-cards-grid">
            {STATIC_EXAMS.map(exam => (
              <div key={exam.id} className={`exam-card ${exam.locked ? 'locked' : ''}`}>
                <div className="exam-card-top">
                  <div className="exam-card-icon">{exam.icon}</div>
                  <span className="exam-card-diff" style={{ color: exam.diffColor, background: exam.diffBg }}>
                    {exam.difficulty}
                  </span>
                  {exam.locked && <span className="exam-card-lock">🔒</span>}
                </div>
                <h3 className="exam-card-title">{exam.title}</h3>
                <p className="exam-card-desc">{exam.description}</p>
                <div className="exam-card-meta">
                  <span className="exam-meta-item">📝 {exam.questions} Questions</span>
                  <span className="exam-meta-item">⏱ {exam.duration}</span>
                  <span className="exam-meta-item">👥 {exam.attempts} attempts</span>
                </div>
                <button
                  className={`btn ${exam.locked ? 'btn-secondary' : 'btn-primary'} exam-card-btn`}
                  onClick={() => !exam.locked && navigate(`/exam/mock-test/${exam.id}`)}
                  disabled={exam.locked}
                >
                  {exam.locked ? '🔒 Locked' : 'Start Test →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
