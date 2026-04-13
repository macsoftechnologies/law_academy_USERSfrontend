import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/design-system.css';
import '../../styles/landing.css';
import logo from "../../assets/images/rla.png"

const slides = [
  { cls:'lp-slide-1', tag:"Welcome to Rao's Law Academy", title:<>Empowering Learners to <em>Achieve More</em></>, desc:"Rao's Law Academy is India's trusted online learning platform built to help students, professionals, and lifelong learners grow with purpose and confidence." },
  { cls:'lp-slide-2', tag:'Our Mission', title:<>Quality Education, <em>For Everyone</em></>, desc:"We believe great education should be accessible to all. From career starters to industry veterans — we've got the right course for you." },
  { cls:'lp-slide-3', tag:'Why Choose Us', title:<>Learn Today. <em>Lead Tomorrow.</em></>, desc:"With expert instructors, structured learning paths, and a community that supports you — success is not just possible, it's inevitable." },
];
const stats = [
  { num:'50,000+', label:'Active Learners' },
  { num:'500+',    label:'Expert Courses'  },
  { num:'200+',    label:'Instructors'     },
  { num:'98%',     label:'Satisfaction'    },
];
const aboutPoints = [
  { title:'Founded with a Vision', desc:'Started in 2020 with a simple goal — bridge the gap between quality education and learners across India.' },
  { title:'Expert-Curated Content', desc:'Every course is carefully designed and reviewed by industry professionals to ensure relevance and depth.' },
  { title:'Community First', desc:"We're more than a platform. We're a community of 50,000+ learners, mentors, and achievers." },
  { title:'Results That Matter', desc:'Over 80% of our learners report career growth within 6 months of completing a course.' },
];
const mission = [
  { icon:'🎯', title:'Our Mission', desc:'To make high-quality, career-focused education accessible to every learner, regardless of background or location.' },
  { icon:'👁️', title:'Our Vision', desc:'A world where every person has the skills and knowledge to build the career and life they deserve.' },
  { icon:'💡', title:'Our Values', desc:"Integrity, inclusivity, innovation, and impact. These four pillars guide everything we do at Rao's Law Academy." },
];
const features = [
  { icon:'🎓', title:'Expert Instructors', desc:'Learn directly from industry professionals with years of real-world experience.' },
  { icon:'📜', title:'Recognised Certificates', desc:'Earn certificates trusted by top employers and institutions across the country.' },
  { icon:'📱', title:'Learn Anywhere', desc:'Access your courses on any device — mobile, tablet, or desktop — at any time.' },
  { icon:'🔄', title:'Lifetime Access', desc:'Pay once and access your course forever, including all future content updates.' },
];
const testimonials = [
  { av:'lp-av-1', initials:'RK', text:"Rao's Law Academy completely changed my career path. The courses are practical, well-structured, and the instructors are incredibly knowledgeable.", name:'Rahul Kumar', role:'Software Engineer, Bangalore' },
  { av:'lp-av-2', initials:'PS', text:'I enrolled in the digital marketing course with zero background and landed a job within 3 months. The platform is truly a game changer.', name:'Priya Sharma', role:'Digital Marketer, Mumbai' },
  { av:'lp-av-3', initials:'AT', text:"The quality of content here is unmatched. I've tried many platforms but Rao's Law Academy stands out for its depth and community support.", name:'Arjun Tiwari', role:'Data Analyst, Hyderabad' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCur(p => (p+1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background:'var(--page-bg)' }}>

      {/* NAVBAR */}
      <nav className="lp-navbar">
        <div className="al-logo">
        <img
          src={logo}
          alt="Rao's Law Academy logo"
          className="al-logo-img"
        />
      </div>
        <div className="lp-navbar-links">
          <a href="#about">About Us</a>
          <a href="#why">Why Us</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#contact">Contact</a>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => navigate('/login')}>Login</button>
      </nav>

      {/* CAROUSEL */}
      <section className="lp-carousel">
        <div className="lp-carousel-track" style={{ transform:`translateX(-${cur*100}%)` }}>
          {slides.map((s,i) => (
            <div key={i} className={`lp-slide ${s.cls}`}>
              <div className="lp-slide-deco">
                <div className="lp-slide-ring lp-slide-ring-1"/>
                <div className="lp-slide-ring lp-slide-ring-2"/>
                <div className="lp-slide-ring lp-slide-ring-3"/>
              </div>
              <div className="lp-slide-content">
                <span className="lp-slide-tag">{s.tag}</span>
                <h1>{s.title}</h1>
                <p>{s.desc}</p>
                <div className="lp-slide-btns">
                  <button className="btn btn-gold btn-lg" onClick={() => navigate('/login')}>Get Started</button>
                  {/* <button className="btn btn-outline btn-lg" style={{ color:'var(--cream)', borderColor:'rgba(255,255,255,.3)' }}>Learn More</button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="lp-carousel-arrow prev" onClick={() => setCur(p=>(p-1+slides.length)%slides.length)}>&#8592;</button>
        <button className="lp-carousel-arrow next" onClick={() => setCur(p=>(p+1)%slides.length)}>&#8594;</button>
        <div className="lp-carousel-dots">
          {slides.map((_,i) => <button key={i} className={`lp-dot ${i===cur?'active':''}`} onClick={()=>setCur(i)} />)}
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats-strip">
        {stats.map(s => (
          <div className="lp-stat-item" key={s.label}>
            <div className="lp-stat-num">{s.num}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ABOUT */}
      <section className="lp-section bg-soft" id="about">
        <div className="lp-about-grid">
          <div className="lp-about-visual">
            <div className="lp-about-main-box">
              <div className="lp-big-number">2020</div>
              <div className="lp-big-label">Founded in India</div>
              <div className="lp-big-sub">Built from the ground up to solve one real problem — quality education that actually prepares you for the real world.</div>
            </div>
            <div className="lp-float-card">
              <div className="lp-fc-number">80%</div>
              <div className="lp-fc-label">Career Growth<br/>in 6 Months</div>
            </div>
          </div>
          <div className="lp-about-text">
            <div className="section-eyebrow">Who We Are</div>
            <h2>A Platform Built for <span>Real Learners</span></h2>
            <p>Rao's Law Academy was born out of a frustration with education that was either too expensive, too theoretical, or simply out of reach. We set out to change that.</p>
            <p>Today we serve over 50,000 learners across India with courses that are practical, instructor-led, and designed to deliver results — not just certificates.</p>
            <div className="lp-about-points">
              {aboutPoints.map((pt,i) => (
                <div className="lp-about-point" key={i}>
                  <div className="lp-point-dot"/>
                  <div><h4>{pt.title}</h4><p>{pt.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <div className="lp-mission-strip">
        {mission.map((m,i) => (
          <>
            <div className="lp-mission-item" key={i}>
              <div className="lp-m-icon">{m.icon}</div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
            {i < mission.length-1 && <div className="lp-mission-divider" key={`d${i}`}/>}
          </>
        ))}
      </div>

      {/* WHY */}
      <section className="lp-section" id="why">
        <div className="lp-section-header">
          <div className="section-eyebrow">Why Rao's Law Academy</div>
          <h2 className="section-title">Everything You Need to <span>Succeed</span></h2>
          <p className="section-sub">We've built the learning experience around what actually works for students.</p>
        </div>
        <div className="lp-features-grid">
          {features.map((f,i) => (
            <div className="lp-feature-card" key={i}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {/* <section className="lp-section bg-soft" id="testimonials">
        <div className="lp-section-header">
          <div className="section-eyebrow">Learner Stories</div>
          <h2 className="section-title">What Our <span>Students Say</span></h2>
          <p className="section-sub">Real results from real people who chose to invest in themselves.</p>
        </div>
        <div className="lp-testi-grid">
          {testimonials.map((t,i) => (
            <div className="lp-testi-card" key={i}>
              <div className="lp-testi-quote">"</div>
              <p>{t.text}</p>
              <div className="lp-testi-author">
                <div className={`lp-testi-avatar ${t.av}`}>{t.initials}</div>
                <div className="lp-testi-info"><h5>{t.name}</h5><span>{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA */}
      <section className="lp-cta-banner">
        <div className="lp-cta-ring lp-cta-ring-1"/><div className="lp-cta-ring lp-cta-ring-2"/>
        <h2>Ready to Start <em>Your Journey?</em></h2>
        <p>Join 50,000+ learners already building their future with Rao's Law Academy. Login to explore all courses.</p>
        <button className="btn btn-gold btn-lg" onClick={() => navigate('/login')}>Login & Explore</button>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer" id="contact">
        {/* <div className="lp-footer-logo">Rao's <span>Law Academy</span></div> */}
        <div className="al-logo">
        <img
          src={logo}
          alt="Rao's Law Academy logo"
          className="ft-logo-img"
        />
      </div>
        <div className="lp-footer-bottom">
          <span>© 2026 <span className="hl">Rao's Law Academy</span>. All rights reserved.</span>
          <span>Made with ❤️ <a href="https://www.macsof.com" target="_blank" rel="noreferrer">@macsof technologies</a></span>
        </div>
      </footer>
    </div>
  );
}
