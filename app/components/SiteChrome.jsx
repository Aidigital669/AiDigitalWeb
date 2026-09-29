"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useVisibility } from "../context/VisibilityContext";

const footerGroups = [
  {
    title: "Contact",
    items: ["Office: +91-9096090701", "aidigitalbiz01@gmail.com", "Camp, Pune 411001"]
  },
  {
    title: "Services",
    items: ["Google Ads", "Meta Ads", "Website Development", "AI Video Production", "SEO Growth"]
  },
  {
    title: "Graphic Design",
    items: ["Social Media Graphics", "Ad Banner Designing", "Logo & Branding", "Custom Illustrations"]
  },
  {
    title: "About Us",
    items: ["About Company", "Our Portfolio", "Articles", "Pricing", "Privacy Policy"]
  }
];

const navItems = [
  { label: "Home", href: "/", key: "home" },
  { label: "Services", href: "/#services", key: "services" },
  { label: "Why Us", href: "/#why", key: "why" },
  { label: "Plans", href: "/pricing", key: "pricing" },
  { label: "Portfolio", href: "/portfolio", key: "portfolio" },
  { label: "Careers", href: "/careers", key: "careers" },
  { label: "Blogs", href: "/blog", key: "blogs" }
];

export function Icon({ name, className = "" }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

export function Logo() {
  return (
    <a className="logo" href="/" aria-label="AI Digital home">
      <Image src="/Logo.ai.png" alt="AI Digital Logo" width={180} height={56} priority />
    </a>
  );
}

export function SiteHeader({ active = "home" }) {
  const { isVisible } = useVisibility();
  const [currentActive, setCurrentActive] = useState(active);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    if (path === "/pricing") {
      setCurrentActive("pricing");
      return;
    }
    if (path === "/portfolio") {
      setCurrentActive("portfolio");
      return;
    }
    if (path === "/careers") {
      setCurrentActive("careers");
      return;
    }

    const sections = [
      { id: "top", key: "home" },
      { id: "services", key: "services" },
      { id: "why", key: "why" },
      { id: "insights", key: "blogs" }
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140; // offset to trigger active state earlier

      // Bottom scroll check
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setCurrentActive("blogs");
        return;
      }

      let activeSection = "home";
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            activeSection = section.key;
          }
        }
      }
      setCurrentActive(activeSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [active]);

  if (!isVisible("global_header")) return null;

  const visibleNavItems = navItems.filter((item) => {
    if (item.key === "home") return isVisible("page_home");
    if (item.key === "services") return isVisible("home_services");
    if (item.key === "why") return isVisible("home_why_us");
    if (item.key === "pricing") return isVisible("page_pricing");
    if (item.key === "portfolio") return isVisible("page_portfolio");
    if (item.key === "careers") return isVisible("page_careers");
    if (item.key === "blogs") return isVisible("page_blog");
    return true;
  });

  return (
    <nav className="top-nav">
      <Logo />
      <div className="nav-links" aria-label="Main navigation">
        {visibleNavItems.map((item) => (
          <a
            href={item.href}
            key={item.key}
            className={currentActive === item.key ? "active" : ""}
            aria-current={currentActive === item.key ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
      <div className="nav-actions-wrapper">
        {isVisible("home_contact") ? (
          <a className="nav-button" href="/#contact">Contact Us</a>
        ) : null}
      </div>
      <details className="mobile-menu" open={menuOpen} onToggle={(e) => setMenuOpen(e.target.open)}>
        <summary className="mobile-menu-button" aria-label="Open navigation menu">
          <span className="material-symbols-outlined menu-icon" aria-hidden="true">menu</span>
          <span className="material-symbols-outlined close-icon" aria-hidden="true">close</span>
        </summary>
        <div className="mobile-menu-panel">
          {visibleNavItems.map((item) => (
            <a
              href={item.href}
              key={item.key}
              className={currentActive === item.key ? "active" : ""}
              aria-current={currentActive === item.key ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {isVisible("home_contact") && (
            <a className="mobile-menu-cta" href="/#contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
          )}
        </div>
      </details>
    </nav>
  );
}

export function SiteFooter() {
  const { isVisible } = useVisibility();

  if (!isVisible("global_footer")) return null;

  const isFooterItemVisible = (item) => {
    if (item === "Pricing") return isVisible("page_pricing");
    if (item === "Our Portfolio") return isVisible("page_portfolio");
    if (item === "Articles") return isVisible("page_blog");
    if (item === "Google Ads") return isVisible("pricing_google");
    if (item === "Meta Ads") return isVisible("pricing_facebook");
    if (item === "Website Development") return isVisible("pricing_websites");
    if (item === "AI Video Production") return isVisible("pricing_aivideo");
    if (item === "SEO Growth") return isVisible("pricing_creative");
    return true;
  };

  const getHref = (item) => {
    if (item === "Pricing") return "/pricing";
    if (item === "Our Portfolio") return "/portfolio";
    if (item === "Articles") return "/blog";
    if (item === "Google Ads" || item === "Meta Ads") return "/pricing#ads";
    if (item === "Website Development") return "/pricing#websites";
    if (item === "AI Video Production") return "/pricing#aivideo";
    if (item === "SEO Growth" || item === "Social Media Graphics" || item === "Ad Banner Designing" || item === "Logo & Branding" || item === "Custom Illustrations") return "/pricing#creative";
    return "/#contact";
  };

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo />
          <strong>Innovate. Connect. Grow.</strong>
          <p>
            AI Digital is an AI-powered digital marketing agency helping
            businesses improve visibility, engagement, leads and measurable growth.
          </p>
          <div className="socials">
            {/* Instagram */}
            <a href="https://www.instagram.com/aidigitalbiz01/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/profile.php?id=61585657074769" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/ai-digital-48120b3a0/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@aidigitalbiz01" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.513 3.545 12 3.545 12 3.545s-7.512 0-9.388.51a3.002 3.002 0 0 0-2.11 2.108C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.876.512 9.388.512 9.388.512s7.513 0 9.388-.512a3.003 3.003 0 0 0 2.11-2.108C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            {/* Google Maps Location */}
            <a href="https://maps.app.goo.gl/7fqZQvWwbBxzDzCr9" target="_blank" rel="noopener noreferrer" aria-label="Google Maps Location">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>
          </div>
          {/* Company Address */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "16px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#e56030", flexShrink: 0, marginTop: "2px" }}>location_on</span>
            <address style={{ fontStyle: "normal" }}>
              Office No: 315, Boulevard Tower,<br />
              Bramha Corp, Sadhu Vaswani Chowk,<br />
              Camp, Pune 411001
            </address>
          </div>
        </div>
        {footerGroups.map((group) => {
          const visibleItems = group.items.filter(isFooterItemVisible);
          if (visibleItems.length === 0) return null;
          return (
            <div className="footer-column" key={group.title}>
              <h3>{group.title}</h3>
              {visibleItems.map((item) => (
                <a href={getHref(item)} key={item}>{item}</a>
              ))}
            </div>
          );
        })}
      </div>
      <div className="copyright">Copyright 2013-2026 AI Digital, All Right Reserved</div>
    </footer>
  );
}


