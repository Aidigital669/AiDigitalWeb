"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import GoalSelector from "./components/GoalSelector";
import { Icon, SiteFooter, SiteHeader } from "./components/SiteChrome";
import HeroOrbit from "./components/HeroOrbit";
import ContactForm from "./components/ContactForm";
import useScrollReveal from "./hooks/useScrollReveal";
import ClientCarousel from "./components/ClientCarousel";
import FaqSection from "./components/FaqSection";
import Testimonials from "./components/Testimonials";
import { useVisibility } from "./context/VisibilityContext";
import PageHiddenNotice from "./components/PageHiddenNotice";

const services = [
  {
    icon: "search_insights",
    title: "SEO",
    tone: "blue",
    body: "Dominate search rankings with AI-driven content and technical optimization."
  },
  {
    icon: "campaign",
    title: "Performance Marketing",
    tone: "orange",
    body: "Data-backed ad campaigns that maximize ROI across every channel."
  },
  {
    icon: "share",
    title: "Social Media",
    tone: "blue",
    body: "Engaging community building and viral content strategies."
  },
  {
    icon: "web",
    title: "Website Design",
    tone: "blue",
    body: "Conversion-focused digital experiences built for speed and performance."
  },
  {
    icon: "branding_watermark",
    title: "Branding",
    tone: "orange",
    body: "Memorable identity design and messaging that resonates with your audience."
  }
];

const campaigns = [
  {
    icon: "ads_click",
    title: "Google Ads Management & PPC",
    body: "High-intent search engine marketing (SEM) campaigns with optimized landing pages, tracking, and continuous ROAS scaling.",
    tags: ["Search Ads", "Lead Generation", "PPC"],
    fit: "Paid Search Growth",
    price: "Starts at ₹4,999/mo",
    link: "/pricing#ads"
  },
  {
    icon: "mail",
    title: "Facebook Ads & Social Marketing",
    body: "Data-driven audience targeting, creative testing, and strategic retargeting for accelerated brand awareness and sales growth.",
    tags: ["Social Ads", "Instagram Marketing", "Retargeting"],
    fit: "Social Media Sales",
    price: "Starts at ₹2,499/mo",
    link: "/pricing#ads"
  },
  {
    icon: "webhook",
    title: "SEO Web Design & Landing Pages",
    body: "High-performance, CRO-focused web development optimized for search engines, fast loading speeds, and maximum conversions.",
    tags: ["SEO Web Design", "UX/UI", "Core Web Vitals"],
    fit: "Conversion Optimization",
    price: "Starts at ₹7,499",
    link: "/pricing#websites"
  },
  {
    icon: "movie",
    title: "AI Video Production for Ads",
    body: "Engaging short-form video concepts, scriptwriting, and AI-driven production for YouTube, Instagram, and TikTok marketing.",
    tags: ["YouTube Shorts", "Instagram Reels", "Video Ads"],
    fit: "Viral Video Content",
    price: "Starts at ₹4,500",
    link: "/pricing#aivideo"
  },
  {
    icon: "post_add",
    title: "Social Media Content & SEO",
    body: "High-engagement organic social media posts, SEO-optimized captions, and strategic content scheduling for brand growth.",
    tags: ["Content Creation", "Brand Growth", "SMM"],
    fit: "Active Brand Building",
    price: "Starts at ₹599",
    link: "/pricing#creative"
  }
];

const whyItems = [
  {
    icon: "troubleshoot",
    title: "AI Market Research",
    body: "Deep SEO data analysis to uncover high-intent keywords."
  },
  {
    icon: "radar",
    title: "Competitor Intel",
    body: "Track competitors and analyze backlinks in real-time."
  },
  {
    icon: "speed",
    title: "Rapid Execution",
    body: "Deploy high-converting marketing campaigns faster."
  },
  {
    icon: "auto_graph",
    title: "Predictive Analytics",
    body: "Forecast search trends and maximize ad spend ROI."
  },
  {
    icon: "groups",
    title: "Dedicated Experts",
    body: "An expert team of SEO specialists and growth hackers."
  },
  {
    icon: "verified",
    title: "Proven ROI",
    body: "Track record of scaling e-commerce and local businesses."
  }
];

export default function Home() {
  const { isVisible, isPageVisible } = useVisibility();
  const [homeBlogs, setHomeBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const blogContainerRef = useRef(null);

  useScrollReveal([loading]);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setHomeBlogs(shuffled.slice(0, 12));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch blogs for homepage:", err);
        setLoading(false);
      });
  }, []);

  const getBlogLink = (post) => {
    const contentTrimmed = post.content ? post.content.trim() : "";
    const slugTrimmed = post.slug ? post.slug.trim() : "";

    if (contentTrimmed.startsWith("http://") || contentTrimmed.startsWith("https://")) {
      return contentTrimmed;
    }
    if (slugTrimmed.startsWith("http://") || slugTrimmed.startsWith("https://")) {
      return slugTrimmed;
    }

    const mdLinkMatch = contentTrimmed.match(/^\[.*?\]\((https?:\/\/.*?)\)$/);
    if (mdLinkMatch) {
      return mdLinkMatch[1];
    }

    if (/^https?:\/\/[^\s]+$/.test(contentTrimmed)) {
      return contentTrimmed;
    }

    return `/blog/${post.slug}`;
  };

  const handleBlogScroll = (direction) => {
    const container = blogContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.95;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!isPageVisible("home")) {
    return <PageHiddenNotice pageName="Home Page" />;
  }

  return (
    <main id="top">
      <SiteHeader active="home" />

      {/* 1. Introduction */}
      {isVisible("home_hero") && (
        <header className="hero section">
          <div className="hero-copy reveal">
            <h1>
              AI-Powered Digital Marketing Agency | <span>Your Success Our Business</span>
            </h1>
            <p>
              AI Digital helps businesses grow By adopting 360 Degress approach through SMO,Google Ads,SEO,Website and analytics powered by AI
            </p>
            <div className="hero-actions reveal reveal-delay-1">
              <a className="button button-primary" href="#contact">Get Free Growth Audit</a>
              <a className="button button-ghost" href="#services">View Services</a>
            </div>
          </div>

          <HeroOrbit />
        </header>
      )}

      {isVisible("home_trust_strip") && (
        <section className="trust-strip">
          <p>Built for startups, local businesses, service brands and growth-focused companies.</p>
          <div className="trust-grid">
            <div><Icon name="smart_toy" /><span>AI-Assisted Strategy</span></div>
            <div><Icon name="query_stats" /><span>Performance Tracking</span></div>
            <div><Icon name="summarize" /><span>Transparent Reporting</span></div>
            <div><Icon name="rocket_launch" /><span>Growth-Focused Execution</span></div>
          </div>
        </section>
      )}

      {isVisible("home_client_carousel") && <ClientCarousel />}

      {/* 2. Choose the Right Services for Your Growth Goal */}
      {isVisible("home_services") && (
        <section id="services" className="section section-muted campaigns">
          <div className="section-heading">
            <span className="eyebrow">AI-powered marketing services</span>
            <h2>Choose the Right Services for Your Growth Goal</h2>
            <p>
              From search visibility to lead generation, AI Digital creates
              strategy, execution and analytics to help businesses grow with
              measurable campaigns.
            </p>
          </div>
          <div className="campaign-grid">
            {campaigns.map((campaign, i) => (
              <article className={`campaign-card reveal reveal-delay-${(i % 3) + 1}`} key={campaign.title}>
                <Icon name={campaign.icon} />
                <h3>{campaign.title}</h3>
                <p>{campaign.body}</p>
                <div className="tag-row">
                  {campaign.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <small>Recommended for: {campaign.fit}</small>
                <a href={campaign.link} className="campaign-pricing-btn">Check Pricing</a>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 3. Advantages */}
      {isVisible("home_why_us") && (
        <section id="why" className="section why">
          <div className="section-heading compact">
            <h2>Why Choose AI Digital</h2>
          </div>
          <div className="why-grid">
            {whyItems.map((item, i) => (
              <article key={item.title} className={`why-item reveal reveal-delay-${(i % 3) + 1}`}>
                <Icon name={item.icon} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. Client Goal */}
      {isVisible("home_goal_selector") && <GoalSelector />}

      {/* Other (Insights & Contact) */}
      {isVisible("home_insights") && (
        <section id="insights" className="section section-muted insights">
          <div className="split-heading">
            <h2>Latest Insights</h2>
            <Link href="/blog">View All <Icon name="arrow_forward" /></Link>
          </div>
          <div className="creative-slider-wrapper">
            <button
              type="button"
              className="slider-nav-btn prev"
              onClick={() => handleBlogScroll("left")}
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="insight-grid" ref={blogContainerRef}>
              {loading ? (
                <div style={{ padding: "40px 0", textAlign: "center", width: "100%", color: "#64748b", fontWeight: "600" }}>
                  Loading latest insights...
                </div>
              ) : homeBlogs.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", width: "100%", color: "#64748b", fontWeight: "600" }}>
                  No insights found. Check back later!
                </div>
              ) : (
                homeBlogs.map((post) => {
                  const url = getBlogLink(post);
                  const isExternal = url.startsWith("http://") || url.startsWith("https://");

                  const CardTag = isExternal ? "a" : Link;
                  const cardProps = isExternal
                    ? { href: url, target: "_blank", rel: "noopener noreferrer" }
                    : { href: url };

                  return (
                    <CardTag
                      {...cardProps}
                      key={post.id}
                      className="insight-card-link reveal"
                    >
                      <article className="insight-card" style={{ height: "100%", minHeight: "280px" }}>
                        <div className="insight-image" style={{ position: "relative", height: "160px" }}>
                          <Image
                            src={post.coverImage || "/creative_content/Creative1.jpeg"}
                            alt={post.title}
                            fill
                            unoptimized={post.coverImage?.startsWith("http")}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="insight-body" style={{ padding: "14px" }}>
                          <span>{post.category}</span>
                          <h3>{post.title}</h3>
                          <p>{post.excerpt}</p>
                        </div>
                      </article>
                    </CardTag>
                  );
                })
              )}
            </div>

            <button
              type="button"
              className="slider-nav-btn next"
              onClick={() => handleBlogScroll("right")}
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>
      )}

      {isVisible("home_testimonials") && <Testimonials />}

      {isVisible("home_faq") && <FaqSection />}

      {isVisible("home_contact") && (
        <section id="contact" className="section contact-section">
          <ContactForm />
        </section>
      )}

      <SiteFooter />
    </main>
  );
}