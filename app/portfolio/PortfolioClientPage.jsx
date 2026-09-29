"use client";

import React from "react";
import FeaturedWork from "../components/FeaturedWork";
import PortfolioShowcase from "../components/PortfolioShowcase";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useVisibility } from "../context/VisibilityContext";
import PageHiddenNotice from "../components/PageHiddenNotice";

export default function PortfolioClientPage() {
  const { isVisible, isPageVisible } = useVisibility();

  if (!isPageVisible("portfolio")) {
    return <PageHiddenNotice pageName="Portfolio" />;
  }

  return (
    <main id="top">
      <SiteHeader active="portfolio" />
      {isVisible("portfolio_showcase") && <PortfolioShowcase />}
      {isVisible("portfolio_featured") && <FeaturedWork />}
      <SiteFooter />
    </main>
  );
}
