"use client"; // Required for native browser event click listeners

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from "../hooks/useCart";
import { useRouter } from "next/navigation";

const defaultPlans = {
    facebook: { price: 3499, period: "/mo", features: ["Meta Ads", "Creative - 3", "AI Video - 1", "Reels/Shorts - 1", "Weekly Report"] },
    google: { price: 4999, period: "/mo", features: ["Google Ads", "Creative - 3", "AI Video - 1", "Reels/Shorts - 1", "Weekly Report"] },
    combine: { price: 6999, period: "/mo", features: ["Meta Ads + Google Ads", "Creative - 7", "AI Video - 2", "Reels/Shorts - 5", "Weekly Report"] }
};

export default function PricingPopup({ dialogRef }) {
    const [popupPlans, setPopupPlans] = useState(defaultPlans);

    useEffect(() => {
        fetch("/api/admin/pricing?t=" + Date.now(), { cache: "no-store" })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Offline");
            })
            .then(data => {
                const normalizePeriod = (p) => {
                    if (!p) return "/mo";
                    return p === "/month" ? "/mo" : p;
                };

                const fbPlan = data.facebookPlans?.find(p => p.level.toLowerCase().includes("basic") || p.id === "fb_basic") || defaultPlans.facebook;
                const gPlan = data.googlePlans?.find(p => p.level.toLowerCase().includes("basic") || p.id === "g_basic") || defaultPlans.google;
                const combPlan = data.combinePlans?.find(p => p.level.toLowerCase().includes("basic") || p.id === "comb_basic") || defaultPlans.combine;

                setPopupPlans({
                    facebook: {
                        price: 3499, // Static as requested
                        period: normalizePeriod(fbPlan.period),
                        features: fbPlan.features
                    },
                    google: {
                        price: gPlan.price,
                        period: normalizePeriod(gPlan.period),
                        features: gPlan.features
                    },
                    combine: {
                        price: combPlan.price,
                        period: normalizePeriod(combPlan.period),
                        features: combPlan.features
                    }
                });
            })
            .catch(err => console.warn("Using default static popup plans:", err));
    }, []);

    const handleClose = () => {
        if (dialogRef.current) {
            dialogRef.current.close();
        }
    };

    const { addToCart, clearCart } = useCart();
    const router = useRouter();

    const handleBuyNow = (planName, price, features = [], period = "/mo") => {
        clearCart();
        addToCart({
            name: planName,
            price: price,
            period: period,
            features: features
        });
        if (dialogRef.current) {
            dialogRef.current.close();
        }
        router.push("/checkout");
    };

    return (
        <dialog
            ref={dialogRef}
            className="popup-card-dialog"
            onClick={(e) => {
                if (e.target === dialogRef.current) handleClose();
            }}
        >
            <div className="popup-card-internal" onClick={(e) => e.stopPropagation()}>

                {/* Close button cross icon */}
                <button onClick={handleClose} className="popup-close-btn" aria-label="Close popup">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="popup-header-container">
                    <div className="popup-logo-wrapper">
                        <Image
                            src="/Logo.ai.png"
                            alt="AI Digital Logo"
                            width={48}
                            height={48}
                            className="popup-header-logo"
                            priority
                        />
                    </div>
                    <div className="popup-header">
                        <h2 className="popup-title">
                            Elevate Your Digital Presence with <span>aidigitals</span>
                        </h2>
                        <p className="popup-subtitle">Join 300+ customer businesses automating their growth today with AiDigitals</p>
                    </div>
                </div>

                <div className="pricing-grid">
                    {/* Facebook Plan */}
                    <div className="plan-card">
                            <div className="plan-header-row">
                                <span className="plan-name">Facebook Plan</span>
                            </div>
                            <div className="plan-price-area">
                                <span className="price-amount">₹{popupPlans.facebook.price}</span>
                                <span className="price-period">{popupPlans.facebook.period}</span>
                            </div>
                            <ul className="plan-features">
                                {popupPlans.facebook.features.map((feat, i) => (
                                    <li className="feature-item" key={i}>
                                        <div className="feature-icon-wrapper icon-check">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleBuyNow("Meta Ads - Basic", popupPlans.facebook.price, popupPlans.facebook.features, popupPlans.facebook.period)}
                                className="btn-card-outline"
                                style={{ display: "block", width: "100%", textAlign: "center", marginTop: "auto" }}
                            >
                                Buy Now
                            </button>
                    </div>

                    {/* Google Plan */}
                    <div className="plan-card popular">
                            <div className="plan-header-row">
                                <span className="plan-name">Google Plan</span>
                                <span className="popular-badge">Popular</span>
                            </div>
                            <div className="plan-price-area">
                                <span className="price-amount">₹{popupPlans.google.price}</span>
                                <span className="price-period">{popupPlans.google.period}</span>
                            </div>
                            <ul className="plan-features">
                                {popupPlans.google.features.map((feat, i) => (
                                    <li className="feature-item" key={i}>
                                        <div className={`feature-icon-wrapper ${i === 0 ? "icon-star" : "icon-check"}`}>
                                            {i === 0 ? (
                                                <svg fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                </svg>
                                            ) : (
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleBuyNow("Google Ads - Basic", popupPlans.google.price, popupPlans.google.features, popupPlans.google.period)}
                                className="btn-card-solid"
                                style={{ display: "block", width: "100%", textAlign: "center", marginTop: "auto" }}
                            >
                                Buy Now
                            </button>
                    </div>

                    {/* Combine Plan */}
                    <div className="plan-card">
                            <div className="plan-header-row">
                                <span className="plan-name">Combine(meta+google) Plan</span>
                            </div>
                            <div className="plan-price-area">
                                <span className="price-amount">₹{popupPlans.combine.price}</span>
                                <span className="price-period">{popupPlans.combine.period}</span>
                            </div>
                            <ul className="plan-features">
                                {popupPlans.combine.features.map((feat, i) => (
                                    <li className="feature-item" key={i}>
                                        <div className="feature-icon-wrapper icon-check">
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleBuyNow("Meta + Google Ads - Basic", popupPlans.combine.price, popupPlans.combine.features, popupPlans.combine.period)}
                                className="btn-card-outline"
                                style={{ display: "block", width: "100%", textAlign: "center", marginTop: "auto" }}
                            >
                                Buy Now
                            </button>
                    </div>

                </div>

            </div>
        </dialog>
    );
}