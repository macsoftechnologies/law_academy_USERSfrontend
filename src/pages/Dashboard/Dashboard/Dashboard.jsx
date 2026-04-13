import { useEffect, useState } from 'react';
import DashboardHeader from '../../../components/layout/DashboardHeader';
import BannerCarousel from '../../../components/common/BannerCarousel';
import CategorySection from '../../../components/common/CategorySection';
import SubjectSection from '../../../components/common/SubjectSection';
import Loader from '../../../components/common/Loader';
import { getBanners, getCategories, getSubjects } from '../../../api/dashboard/dashboardApi';
import '../../../styles/design-system.css';
import '../../../styles/components.css';
import '../../../styles/layout.css';
import BestSellerSection from '../../../components/common/BestSellerSection';
import ComboSection from '../../../components/common/ComboSection';

export default function Dashboard() {
  const [banners,   setBanners]   = useState([]);
  const [categories,setCategories]= useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [bLoad,     setBLoad]     = useState(true);
  const [cLoad,     setCLoad]     = useState(true);
  const [sLoad,     setSLoad]     = useState(true);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return {}; } })();
  const name = user?.name || 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    getBanners().then(r => { if (r.statusCode===200) setBanners(r.data); }).catch(()=>{}).finally(()=>setBLoad(false));
    getCategories().then(r => { if (r.statusCode===200) setCategories(r.data); }).catch(()=>{}).finally(()=>setCLoad(false));
    getSubjects().then(r => { if (r.statusCode===200) setSubjects(r.data); }).catch(()=>{}).finally(()=>setSLoad(false));
  }, []);

  return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main">
        <div className="dash-content">

          {/* Welcome */}
          <div style={{ marginBottom:'1.5rem' }}>
            <p style={{ fontSize:'.82rem', fontWeight:600, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.25rem' }}>{greeting}</p>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.4rem,2.5vw,1.9rem)', color:'var(--navy)' }}>Welcome back, {name.split(' ')[0]} 👋</h1>
          </div>

          {bLoad ? <Loader /> : <BannerCarousel banners={banners} />}
          {cLoad ? <Loader /> : <CategorySection categories={categories} />}
          {sLoad ? <Loader /> : <SubjectSection subjects={subjects} />}
           {sLoad ? <Loader /> : <BestSellerSection subjects={subjects} />}
           {sLoad ? <Loader /> : <ComboSection subjects={subjects} />}

        </div>
      </div>
    </div>
  );
}
