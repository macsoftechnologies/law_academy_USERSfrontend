import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DashboardHeader from "../../../components/layout/DashboardHeader";
import Loader from "../../../components/common/Loader";
import { getEnrollmentDetails } from "../../../api/dashboard/dashboardApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeCourse(input) {
  if (!input.isFromApi) {
    const raw = input.raw || {};
    const courseDetails = raw.courseDetails || null;
    const planRaw = raw.planId;
    const plan = Array.isArray(planRaw) ? planRaw[0] : null;
    return {
      details: courseDetails,
      plan,
      meta: {
        title: input.title || courseDetails?.title || null,
        enrollType: raw.enroll_type || input.enrollType || null,
        status: input.status || (raw.status === "active" ? "Active" : "Completed"),
        enrollDate: raw.enroll_date || null,
        expiryDate: raw.expiry_date || null,
      },
    };
  }
  const raw = input.raw || {};
  const courseDetails = raw.courseDetails || null;
  const planRaw = raw.planId;
  const plan = Array.isArray(planRaw) ? planRaw[0] : null;
  return {
    details: courseDetails,
    plan,
    meta: {
      title: courseDetails?.title || null,
      enrollType: raw.enroll_type || null,
      status: raw.status === "active" ? "Active" : "Completed",
      enrollDate: raw.enroll_date || null,
      expiryDate: raw.expiry_date || null,
    },
  };
}

export default function EnrollmentDetails() {
  const navigate = useNavigate();
  const { enrollId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stateData = location.state?.course;
    if (stateData) {
      setCourse(normalizeCourse(stateData));
      setLoading(false);
      setTimeout(() => setMounted(true), 50);
      return;
    }
    setLoading(true);
    getEnrollmentDetails(enrollId)
      .then((res) => {
        if (res.statusCode === 200) {
          const raw = res.data?.[0] || null;
          if (raw) setCourse(normalizeCourse({ raw, isFromApi: true }));
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => setMounted(true), 50);
      });
  }, [enrollId]);

  if (loading) return <Loader />;

  if (!course) return (
    <div className="dash-shell">
      <DashboardHeader />
      <div className="dash-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>No enrollment details found.</p>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Go Back</button>
        </div>
      </div>
    </div>
  );

  const { details, plan, meta } = course;
  const isActive = meta?.status === "Active";

  const infoCards = [
    { icon: "🎓", label: "Enrollment Type", value: meta?.enrollType || "-" },
    { icon: isActive ? "✅" : "🏁", label: "Status", value: meta?.status || "-", accent: isActive ? "#10b981" : "#f59e0b" },
    { icon: "📅", label: "Enrolled On", value: formatDate(meta?.enrollDate) },
    { icon: "⏳", label: "Valid Until", value: formatDate(meta?.expiryDate) },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .enroll-page * { box-sizing: border-box; }

        .enroll-page {
          font-family: 'DM Sans', sans-serif;
          background: #f8f7f4;
          min-height: 100vh;
        }

        .enroll-hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0f1923 0%, #1a2d3d 50%, #0f2027 100%);
          padding: 3rem 2rem 5rem;
        }

        .enroll-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 50%, rgba(251,191,36,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .enroll-hero-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          background: rgba(251,191,36,0.15);
          border: 1px solid rgba(251,191,36,0.3);
          color: #fbbf24;
          padding: .35rem .9rem;
          border-radius: 999px;
          font-size: .75rem;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 .75rem;
          max-width: 600px;
        }

        .hero-subtitle {
          color: rgba(255,255,255,0.5);
          font-size: .95rem;
          font-weight: 300;
          margin: 0;
        }

        .hero-img-wrap {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 38%;
          overflow: hidden;
        }

        .hero-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.25;
        }

        .hero-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #0f1923 0%, transparent 60%);
        }

        .enroll-body {
          max-width: 860px;
          margin: -2.5rem auto 3rem;
          padding: 0 1.5rem;
          position: relative;
          z-index: 10;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: .75rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 700px) {
          .info-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-img-wrap { display: none; }
        }

        .info-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.1rem 1rem;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform .2s, box-shadow .2s;
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.09);
        }

        .info-card-icon {
          font-size: 1.3rem;
          margin-bottom: .4rem;
        }

        .info-card-label {
          font-size: .7rem;
          font-weight: 600;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: .3rem;
        }

        .info-card-value {
          font-size: .9rem;
          font-weight: 600;
          color: #1e293b;
        }

        .section-card {
          background: #fff;
          border-radius: 18px;
          padding: 1.75rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          margin-bottom: 1.25rem;
        }

        .section-label {
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: .6rem;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f1923;
          margin: 0 0 .75rem;
        }

        .about-text {
          color: #475569;
          line-height: 1.75;
          font-size: .95rem;
          font-weight: 300;
          margin: 0;
        }

        .plan-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: .65rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .plan-row:last-child { border-bottom: none; }

        .plan-key {
          font-size: .8rem;
          font-weight: 600;
          letter-spacing: .04em;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .plan-val {
          font-size: .95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .plan-price-wrap {
          display: flex;
          align-items: center;
          gap: .5rem;
        }

        .plan-strike {
          font-size: .85rem;
          color: #cbd5e1;
          text-decoration: line-through;
        }

        .plan-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #10b981;
        }

        .discount-pill {
          background: #dcfce7;
          color: #15803d;
          font-size: .7rem;
          font-weight: 700;
          padding: .2rem .55rem;
          border-radius: 999px;
        }

        .points-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .6rem;
        }

        @media (max-width: 560px) {
          .points-list { grid-template-columns: 1fr; }
        }

        .points-item {
          display: flex;
          align-items: center;
          gap: .6rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: .65rem .9rem;
          font-size: .88rem;
          color: #334155;
          font-weight: 500;
        }

        .points-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fbbf24;
          flex-shrink: 0;
        }

        .terms-text {
          color: #64748b;
          font-size: .88rem;
          line-height: 1.8;
          white-space: pre-line;
          margin: 0;
          font-weight: 300;
        }

        .terms-item {
          display: flex;
          gap: .7rem;
          margin-bottom: .5rem;
          font-size: .88rem;
          color: #64748b;
          line-height: 1.6;
        }

        .terms-num {
          color: #fbbf24;
          font-weight: 700;
          flex-shrink: 0;
          width: 1.2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          color: rgba(255,255,255,0.6);
          font-size: .85rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 1.5rem;
          transition: color .2s;
          font-family: 'DM Sans', sans-serif;
        }

        .back-link:hover { color: #fff; }

        .warning-banner {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border: 1px solid #fde68a;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: .75rem;
          margin-bottom: 1.25rem;
          font-size: .88rem;
          color: #92400e;
          font-weight: 500;
        }

        .fade-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity .5s ease, transform .5s ease;
        }

        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="enroll-page dash-shell">
        <DashboardHeader />

        <div className="dash-main">
          {/* Hero Section */}
          <div className="enroll-hero">
            <div className="enroll-hero-grid" />

            {details?.presentation_image && (
              <div className="hero-img-wrap">
                <img src={`${BASE_URL}/${details.presentation_image}`} alt={details?.title} />
              </div>
            )}

            <div style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto" }}>
              <button className="back-link" onClick={() => navigate(-1)}>
                ← Back to My Courses
              </button>

              <div className="hero-badge">
                {isActive ? "🟢 Active Enrollment" : "🏁 Completed"}
              </div>

              <h1 className="hero-title">
                {details?.title || meta?.title || "Course Details"}
              </h1>

              {details?.sub_title && (
                <p className="hero-subtitle">{details.sub_title}</p>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="enroll-body">

            {/* Warning if no course details */}
            {!details && (
              <div className="warning-banner">
                <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                Full course details are not available for this enrollment type yet. Please contact support.
              </div>
            )}

            {/* Info Cards */}
            <div className={`info-grid fade-up ${mounted ? "visible" : ""}`} style={{ transitionDelay: ".05s" }}>
              {infoCards.map(({ icon, label, value, accent }) => (
                <div className="info-card" key={label}>
                  <div className="info-card-icon">{icon}</div>
                  <div className="info-card-label">{label}</div>
                  <div className="info-card-value" style={accent ? { color: accent } : {}}>{value}</div>
                </div>
              ))}
            </div>

            {/* About */}
            {details?.about_course && (
              <div className={`section-card fade-up ${mounted ? "visible" : ""}`} style={{ transitionDelay: ".12s" }}>
                <div className="section-label">About this Course</div>
                <p className="about-text">{details.about_course}</p>
              </div>
            )}

            {/* Plan Details */}
            {plan && (
              <div className={`section-card fade-up ${mounted ? "visible" : ""}`} style={{ transitionDelay: ".18s" }}>
                <div className="section-label">Plan Details</div>
                <h3 className="section-title">💳 Your Subscription Plan</h3>

                <div className="plan-row">
                  <span className="plan-key">Price</span>
                  <div className="plan-price-wrap">
                    {plan.strike_price && (
                      <span className="plan-strike">₹{plan.strike_price}</span>
                    )}
                    <span className="plan-price">₹{plan.original_price || "-"}</span>
                    {plan.discount_percent && (
                      <span className="discount-pill">{plan.discount_percent}% OFF</span>
                    )}
                  </div>
                </div>

                <div className="plan-row">
                  <span className="plan-key">Duration</span>
                  <span className="plan-val">{plan.duration || "-"}</span>
                </div>

                {plan.handling_fee && (
                  <div className="plan-row">
                    <span className="plan-key">Handling Fee</span>
                    <span className="plan-val">₹{plan.handling_fee}</span>
                  </div>
                )}

                <div className="plan-row">
                  <span className="plan-key">Course Type</span>
                  <span className="plan-val" style={{ textTransform: "capitalize" }}>
                    {plan.course_type || "-"}
                  </span>
                </div>
              </div>
            )}

            {/* Course Includes */}
            {!!details?.course_points?.length && (
              <div className={`section-card fade-up ${mounted ? "visible" : ""}`} style={{ transitionDelay: ".24s" }}>
                <div className="section-label">What's Included</div>
                <h3 className="section-title">📌 Course Contents</h3>
                <ul className="points-list">
                  {details.course_points.map((p, i) => (
                    <li className="points-item" key={i}>
                      <span className="points-dot" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Terms & Conditions */}
            {details?.terms_conditions && (
              <div className={`section-card fade-up ${mounted ? "visible" : ""}`} style={{ transitionDelay: ".3s" }}>
                <div className="section-label">Terms & Conditions</div>
                <h3 className="section-title">📋 Please Read Carefully</h3>
                <div>
                  {details.terms_conditions
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <div className="terms-item" key={i}>
                        <span className="terms-num">{i + 1}.</span>
                        <span>{line.replace(/^\d+\./, "").trim()}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}