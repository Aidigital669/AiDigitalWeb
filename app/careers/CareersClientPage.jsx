"use client";

import React from "react";
import { SiteHeader, SiteFooter, Icon } from "../components/SiteChrome";
import TiltCard from "../components/TiltCard";
import useScrollReveal from "../hooks/useScrollReveal";
import ApplicationModal from "../components/ApplicationModal";
import { useVisibility } from "../context/VisibilityContext";
import PageHiddenNotice from "../components/PageHiddenNotice";

const jobOpenings = [
  {
    title: "Graphic Designer",
    experience: "1-3 Years",
    type: "Full-Time",
    location: "Pune (On-site)",
    description: "Create stunning visuals for social media, ad campaigns, and branding. Must be proficient in Adobe Creative Suite.",
    icon: "design_services"
  },
  {
    title: "Social Media Executive",
    experience: "1-2 Years",
    type: "Full-Time",
    location: "Pune (On-site)",
    description: "Manage social media accounts, create engaging content, and drive community growth across Meta platforms.",
    icon: "thumb_up"
  },
  {
    title: "AI Video Editor",
    experience: "1-3 Years",
    type: "Full-Time",
    location: "Pune (On-site)",
    description: "Produce high-quality AI-generated and traditional videos. Experience with Premiere Pro and AI tools required.",
    icon: "movie_edit"
  },
  {
    title: "Sales Executive",
    experience: "2-4 Years",
    type: "Full-Time",
    location: "Pune (On-site)",
    description: "Drive revenue growth by pitching our digital marketing services to B2B clients and closing high-ticket deals.",
    icon: "trending_up"
  },
  {
    title: "Field Sales Executive",
    experience: "Fresher & Graduate",
    type: "Full-Time",
    location: "Field / On-site",
    description: "Age 18 to 35. Visit field and present AI Digital plans to potential clients. Convert field visits into successful client onboarding. Strong sales and communication skill required.",
    icon: "handshake"
  }
];

const getWhatsAppLink = (jobTitle) => {
  const message = `Hi! I would like to apply for the ${jobTitle} position at AI Digital. Here is my resume/portfolio.`;
  return `https://wa.me/919096090701?text=${encodeURIComponent(message)}`;
};

export default function CareersClientPage() {
  const { isVisible, isPageVisible } = useVisibility();
  useScrollReveal([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState("");
  const [selectedJobDesc, setSelectedJobDesc] = React.useState("");

  if (!isPageVisible("careers")) {
    return <PageHiddenNotice pageName="Careers" />;
  }

  return (
    <div className="careers-page-wrapper">
      <SiteHeader active="careers" />

      {/* Hero Section */}
      {isVisible("careers_hero") && (
        <section className="pricing-hero" style={{ paddingBottom: "60px" }}>
          <div className="badge-pill reveal">Join Our Team</div>
          <h1 className="pricing-main-title reveal delay-100">
            Build the Future of <span>Digital</span>
          </h1>
          <p className="pricing-hero-sub reveal delay-200">
            We're looking for passionate, creative, and driven individuals to join our growing agency in Pune.
          </p>
        </section>
      )}

      {/* Perks Section */}
      {isVisible("careers_perks") && (
        <section className="section-muted-light" style={{ padding: "60px 0" }}>
          <div className="pricing-grid" style={{ maxWidth: "1000px", margin: "0 auto", paddingInline: "var(--page-gutter)", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            <div className="premium-shadow reveal delay-100" style={{ background: "#fff", padding: "24px", borderRadius: "16px", textAlign: "center" }}>
              <Icon name="rocket_launch" className="text-blue" style={{ fontSize: "32px", marginBottom: "16px", color: "#2563EB" }} />
              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "var(--pm-text-dark)" }}>Fast Growth</h3>
              <p style={{ color: "var(--pm-text-light)", fontSize: "0.95rem" }}>Accelerate your career by working on challenging, high-impact projects.</p>
            </div>
            <div className="premium-shadow reveal delay-200" style={{ background: "#fff", padding: "24px", borderRadius: "16px", textAlign: "center" }}>
              <Icon name="groups" className="text-blue" style={{ fontSize: "32px", marginBottom: "16px", color: "#2563EB" }} />
              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "var(--pm-text-dark)" }}>Great Culture</h3>
              <p style={{ color: "var(--pm-text-light)", fontSize: "0.95rem" }}>Work with a supportive, creative, and highly ambitious team.</p>
            </div>
            <div className="premium-shadow reveal delay-300" style={{ background: "#fff", padding: "24px", borderRadius: "16px", textAlign: "center" }}>
              <Icon name="laptop_mac" className="text-blue" style={{ fontSize: "32px", marginBottom: "16px", color: "#2563EB" }} />
              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "var(--pm-text-dark)" }}>Modern Tech</h3>
              <p style={{ color: "var(--pm-text-light)", fontSize: "0.95rem" }}>Use the latest tools and AI technologies in digital marketing.</p>
            </div>
          </div>
        </section>
      )}

      {/* Open Positions */}
      {isVisible("careers_openings") && (
        <section className="pricing-section">
          <div className="section-title-wrapper">
            <h2 className="section-title-text">Open Positions</h2>
            <div className="section-title-underline" />
          </div>

          <div className="pricing-grid" style={{ maxWidth: "1200px", margin: "0 auto", paddingInline: "var(--page-gutter)", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {jobOpenings.map((job, index) => (
              <TiltCard key={index} className="website-plan-card premium-shadow reveal delay-200" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "32px 24px", alignItems: "flex-start", textAlign: "left" }}>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563EB", padding: "10px", borderRadius: "12px", display: "flex" }}>
                      <Icon name={job.icon} />
                    </div>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--pm-text-dark)", margin: 0 }}>{job.title}</h3>
                  </div>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "0.85rem", background: "#f1f5f9", color: "#475569", padding: "4px 12px", borderRadius: "99px", fontWeight: "500" }}>{job.experience}</span>
                    <span style={{ fontSize: "0.85rem", background: "#f1f5f9", color: "#475569", padding: "4px 12px", borderRadius: "99px", fontWeight: "500" }}>{job.type}</span>
                    <span style={{ fontSize: "0.85rem", background: "#f1f5f9", color: "#475569", padding: "4px 12px", borderRadius: "99px", fontWeight: "500" }}>{job.location}</span>
                  </div>

                  <p style={{ color: "var(--pm-text-light)", fontSize: "1rem", lineHeight: "1.6", marginBottom: "24px" }}>
                    {job.description}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "auto" }}>
                  <button 
                    onClick={() => {
                      setSelectedJob(job.title);
                      setSelectedJobDesc(job.description);
                      setIsModalOpen(true);
                    }}
                    style={{ flex: 1, padding: "12px", cursor: "pointer", background: "#0f172a", color: "#fff", border: "1px solid #0f172a", borderRadius: "8px", fontWeight: "600", fontSize: "14px", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0f172a"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    Apply Now
                  </button>
                  <a 
                    href={getWhatsAppLink(job.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, padding: "12px", textAlign: "center", textDecoration: "none", background: "#fff", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "600", fontSize: "14px", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#25D366"; e.currentTarget.style.color = "#15803d"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 211, 102, 0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#334155"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#25D366" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />

      {isVisible("careers_apply_modal") && (
        <ApplicationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          jobTitle={selectedJob} 
          jobDescription={selectedJobDesc}
        />
      )}
    </div>
  );
}
