"use client"; // Required for DOM refs and lifecycle hooks
import React, { useRef, useEffect } from "react";
import PricingPopup from "./PricingPopup";
import { Icon } from "./SiteChrome";

export default function HeroOrbit() {
    const dialogRef = useRef(null);

    // Triggers the pricing popup natively with a 10-second delay when the page renders
    useEffect(() => {
        const timer = setTimeout(() => {
            if (dialogRef.current) {
                dialogRef.current.showModal();
            }
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="hero-orbit orbit-container" aria-hidden="true">
            {/* Handled natively with no buttons or local react visibility state hooks */}
            <PricingPopup dialogRef={dialogRef} />

            {/* Central Nucleus */}
            <div className="orbit-nucleus">
                <div className="nucleus-pulse-ring-1" />
                <div className="nucleus-pulse-ring-2" />
                <div className="orbit-nucleus-inner">
                    <Icon name="apartment" />
                    <strong>Real Estate<br />Growth</strong>
                </div>
            </div>

            {/* Background Visual Concentric Rings */}
            <div className="orbit orbit-ring orbit-xl" />
            <div className="orbit orbit-ring orbit-lg" />
            <div className="orbit orbit-ring orbit-md" />
            <div className="orbit orbit-ring orbit-sm" />

            {/* Site Visits on XL Orbit Ring */}
            <span className="orbit-dot-wrapper orbit-dot-xl rotate-extra-slow">
                <span className="orbit-dot orbit-dot-yellow counter-rotate-extra-slow">Site Visits</span>
            </span>

            {/* Associate Partners on LG Orbit Ring */}
            <span className="orbit-dot-wrapper orbit-dot-lg rotate-slow">
                <span className="orbit-dot orbit-dot-orange counter-rotate-slow">Associate<br />Partners</span>
            </span>

            {/* Google Ads on MD Orbit Ring */}
            <span className="orbit-dot-wrapper orbit-dot-md rotate-medium">
                <span className="orbit-dot orbit-dot-blue counter-rotate-medium">Google Ads</span>
            </span>

            {/* Meta Ads on SM Orbit Ring */}
            <span className="orbit-dot-wrapper orbit-dot-sm rotate-fast">
                <span className="orbit-dot orbit-dot-light counter-rotate-fast">Meta Ads</span>
            </span>
        </div>
    );
}