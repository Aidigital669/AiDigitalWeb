"use client";

import React, { useState, useEffect } from "react";
import { useVisibility } from "../context/VisibilityContext";

export default function BackToTop() {
  const { isVisible: isFeatureVisible } = useVisibility();
  const [isVisible, setIsVisible] = useState(false);

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
