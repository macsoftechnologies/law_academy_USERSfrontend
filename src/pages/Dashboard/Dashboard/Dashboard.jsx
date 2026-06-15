import { useEffect, useState } from 'react';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import BannerCarousel from '../../../components/common/BannerCarousel';
import CategorySection from '../../../components/common/CategorySection';
import SubjectSection from '../../../components/common/SubjectSection';
import BestSellerSection from '../../../components/common/BestSellerSection';
import ComboSection from '../../../components/common/ComboSection';
import Loader from '../../../components/common/Loader';
import { getBanners, getCategories, getSubjects } from '../../../api/dashboard/dashboardApi';

// Styles
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';

export default function Dashboard() {
  const [data, setData] = useState({ banners: [], categories: [], subjects: [] });
  const [isLoading, setIsLoading] = useState(true);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const name = user?.name?.split(' ')[0] || 'User';
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    // Fetch everything at once for a smoother entrance
    Promise.all([
      getBanners(),
      getCategories(),
      getSubjects()
    ]).then(([bRes, cRes, sRes]) => {
      setData({
        banners: bRes.statusCode === 200 ? bRes.data : [],
        categories: cRes.statusCode === 200 ? cRes.data : [],
        subjects: sRes.statusCode === 200 ? sRes.data : []
      });
    })
    .catch(err => console.error("Dashboard Load Error:", err))
    .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      
      {/* Use the overlay loader we made for a clean "App-like" entry */}
      <Loader visible={isLoading} overlay />

      <div className="dash-main">
        <div className="dash-content">
          
          {/* Welcome Section - Show immediately so page doesn't look empty */}
          <header className="welcome-header">
            <p className="greeting-label">{greeting}</p>
            <h1 className="welcome-text">Welcome back, {name} 👋</h1>
          </header>

          {!isLoading && (
            <div className="animate-fade-in">
              <div className="full-width-wrapper">
                <BannerCarousel banners={data.banners} />
              </div>
              
              <CategorySection categories={data.categories} />
              {(() => {
                const civilSubjects = data.subjects.filter(s => s?.law_id?.[0]?.title?.toLowerCase().includes('civil'));
                const criminalSubjects = data.subjects.filter(s => s?.law_id?.[0]?.title?.toLowerCase().includes('criminal'));
                const otherSubjects = data.subjects.filter(s => {
                  const title = s?.law_id?.[0]?.title?.toLowerCase() || '';
                  return !title.includes('civil') && !title.includes('criminal');
                });

                return (
                  <>
                    {civilSubjects.length > 0 && <SubjectSection subjects={civilSubjects} title="Civil Law Subjects" />}
                    {criminalSubjects.length > 0 && <SubjectSection subjects={criminalSubjects} title="Criminal Law Subjects" />}
                    {otherSubjects.length > 0 && <SubjectSection subjects={otherSubjects} title="Other Subjects" />}
                  </>
                );
              })()}
              {/* <BestSellerSection subjects={data.subjects} /> */}
              <ComboSection subjects={data.subjects} />
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}