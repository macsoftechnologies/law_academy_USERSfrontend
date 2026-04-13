import DashboardHeader from './DashboardHeader';
import '../../styles/design-system.css';
import '../../styles/components.css';
import '../../styles/layout.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
