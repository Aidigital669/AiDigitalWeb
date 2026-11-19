"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useVisibility } from "../context/VisibilityContext";

export default function BackToTop() {
  const pathname = usePathname();
  const { isVisible: isFeatureVisible } = useVisibility();
  const [isVisible, setIsVisible] = useState(false);

  if (pathname?.startsWith("/login") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin") || pathname?.startsWith("/employee-login")) {
    return null;
  }

  if (!isFeatureVisible("widget_back_to_top")) return null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      className={`back-to-top-btn ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "22px", display: "block" }}>
        arrow_upward
      </span>
    </button>
  );
}
