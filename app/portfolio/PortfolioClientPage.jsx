"use client";

import React, { useState } from "react";
import FeaturedWork from "../components/FeaturedWork";
import PortfolioShowcase from "../components/PortfolioShowcase";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useVisibility } from "../context/VisibilityContext";
import PageHiddenNotice from "../components/PageHiddenNotice";

export default function PortfolioClientPage() {
  const { isVisible, isPageVisible } = useVisibility();
  const [activeFilter, setActiveFilter] = useState("All");

  if (!isPageVisible("portfolio")) {
    return <PageHiddenNotice pageName="Portfolio" />;
  }

  return (
    <main id="top">
      <SiteHeader active="portfolio" />
      {isVisible("portfolio_showcase") && (
        <PortfolioShowcase 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />
      )}
      {isVisible("portfolio_featured") && (
        <FeaturedWork 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
        />
      )}
      <SiteFooter />
    </main>
  );
}
