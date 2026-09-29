"use client";

import React from "react";
import Link from "next/link";
import { Icon, SiteHeader, SiteFooter } from "./SiteChrome";

export default function PageHiddenNotice({ pageName = "This page" }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--pm-bg, #0b0f19)", color: "#fff" }}>
      <SiteHeader active="home" />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "540px",
            width: "100%",
            background: "rgba(17, 24, 39, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "24px",
            padding: "48px 36px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: "#f87171",
            }}
          >
            <Icon name="visibility_off" style={{ fontSize: "36px" }} />
          </div>

          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Page Offline
          </span>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#fff",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
            }}
          >
            {pageName} is Temporarily Unavailable
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "#94a3b8",
              lineHeight: "1.6",
              marginBottom: "32px",
            }}
          >
            This section or page has been temporarily set to private or is undergoing administrative updates. Please explore our other active services or contact our team directly.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#2563EB",
                color: "#fff",
                fontWeight: "600",
                fontSize: "14px",
                padding: "12px 24px",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Icon name="home" style={{ fontSize: "18px" }} />
              Return to Homepage
            </Link>

            <Link
              href="/#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontWeight: "600",
                fontSize: "14px",
                padding: "12px 20px",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Icon name="mail" style={{ fontSize: "18px" }} />
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
