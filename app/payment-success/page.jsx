"use client";

import React, { useEffect, useState, useRef } from "react";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { isValidMobileNumber, isValidName, isValidPinCode, isValidGstin } from "../../lib/validation";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfgAPH2g8ESgN2wtKd1X2raDN1vbSHECmuwtW_wDp48jqgqwg/viewform?embedded=true";

// Steps: "google_form" → "form" → "scheduler" → "whatsapp"
const STEPS = ["google_form", "form", "scheduler", "whatsapp"];
const STEP_LABELS = {
  google_form: { icon: "assignment", label: "Google Form", num: 1 },
  form: { icon: "person_pin", label: "Business Profile", num: 2 },
  scheduler: { icon: "event", label: "Book a Call", num: 3 },
  whatsapp: { icon: "chat", label: "WhatsApp", num: 4 },
};



export default function PaymentSuccessPage() {
  const [mounted, setMounted] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState("");
  const [plans, setPlans] = useState("");
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");

  // Tab control
  const [activeTab, setActiveTab] = useState("google_form");
  const [autoSaved, setAutoSaved] = useState(false);

  // Google Form submission detection
  // The iframe fires `load` once when the form loads (count=1),
  // and again when it navigates to the thank-you page after submit (count=2).
  const iframeRef = useRef(null);
  const [iframeLoadCount, setIframeLoadCount] = useState(0);
  const [googleFormDone, setGoogleFormDone] = useState(false);

  // Form inputs
  const [contactName, setContactName] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [businessType, setBusinessType] = useState("Sole Proprietorship");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [gstin, setGstin] = useState("");
  const [requestCallBack, setRequestCallBack] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Scheduler states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [schedulerBooked, setSchedulerBooked] = useState(false);
  const [schedulerLoading, setSchedulerLoading] = useState(false);

  // Track if any optional onboarding action has been completed
  const hasDoneOnboarding = formSubmitted || schedulerBooked;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setPaymentId(params.get("payment_id") || "pay_mock123456");
      setAmount(params.get("amount") || "0");
      setPlans(params.get("plans") || "BizzMaker Plan");
      setPhone(params.get("phone") || "");
      setPromoCode(params.get("promo_code") || "None");
    }
  }, []);

  // Auto-save basic payment record to admin DB as soon as we have paymentId
  useEffect(() => {
    if (!paymentId || autoSaved || paymentId === "pay_mock123456") return;
    const saveBasicRecord = async () => {
      try {
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_id: paymentId,
            plans: plans,
            promo_code: promoCode,
            contact_name: "",
            auto_saved: true,
          }),
        });
        setAutoSaved(true);
      } catch (_) {
        // silent — non-blocking
      }
    };
    saveBasicRecord();
  }, [paymentId, plans, promoCode, autoSaved]);

  // Format next 5 working days (excluding weekends) for scheduler
  const getNextWorkingDays = () => {
    const days = [];
    let current = new Date();
    while (days.length < 5) {
      current.setDate(current.getDate() + 1);
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push(new Date(current));
      }
    }
    return days;
  };

  const nextDays = getNextWorkingDays();
  const timeSlots = ["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (contactName && !isValidName(contactName)) {
      alert("Please enter a valid contact name (at least 2 letters).");
      return;
    }
    if (altPhone && !isValidMobileNumber(altPhone)) {
      alert("Please enter a valid 10-digit alternative phone number.");
      return;
    }
    if (pinCode && !isValidPinCode(pinCode)) {
      alert("Please enter a valid 6-digit pin code.");
      return;
    }
    if (gstin && !isValidGstin(gstin)) {
      alert("Please enter a valid 15-character GSTIN format.");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentId,
          plans: plans,
          contact_name: contactName,
          alt_phone: altPhone,
          business_type: businessType,
          gstin: gstin,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city: city,
          state_name: stateName,
          pin_code: pinCode,
          request_callback: requestCallBack ? 1 : 0,
          promo_code: promoCode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save details");
      setFormSubmitted(true);
    } catch (err) {
      alert("Error saving onboarding details: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSchedulerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot) return;
    setSchedulerLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentId,
          plans: plans,
          scheduled_date: selectedDate,
          scheduled_time: selectedTimeSlot,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to book strategy session");
      setSchedulerBooked(true);
    } catch (err) {
      alert("Error scheduling call: " + err.message);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const getWhatsAppOnboardingMessage = () => {
    const finalNumber = altPhone || phone || "";
    return `Hello, I completed payment of ₹${amount} for the ${plans} plan. My contact number is ${finalNumber}. Payment ID: ${paymentId}.`;
  };
  const getWhatsAppOnboardingLink = () =>
    `https://wa.me/919096090701?text=${encodeURIComponent(getWhatsAppOnboardingMessage())}`;

  const stepTabStyle = (tab) => {
    const isActive = activeTab === tab;
    const stepIdx = STEPS.indexOf(tab);
    const currentIdx = STEPS.indexOf(activeTab);
    const isDone = stepIdx < currentIdx;
    return {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      cursor: isDone ? "pointer" : "default",
      opacity: isActive ? 1 : isDone ? 0.85 : 0.4,
      transition: "all 0.2s ease",
    };
  };

  if (!mounted) {
    return (
      <div className="pricing-page-wrapper">
        <SiteHeader active="none" />
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Processing transaction success details...</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="pricing-page-wrapper">
      <SiteHeader active="none" />

      <main style={{ maxWidth: "960px", margin: "40px auto", padding: "0 24px", minHeight: "80vh" }}>

        {/* ── Success Confirmation Card ── */}
        <div className="success-banner-card" style={{
          background: "var(--surface)",
          border: "1px solid #bbf7d0",
          borderRadius: "24px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "var(--card-shadow)",
          marginBottom: "40px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(90deg, #10b981, #34d399)" }} />

          <div style={{
            width: "72px", height: "72px", background: "#ecfdf5", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px auto", color: "#10b981",
            boxShadow: "0 4px 10px rgba(16, 185, 129, 0.15)",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "40px", fontWeight: "bold" }}>check_circle</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text)" }}>
            Payment <span style={{ color: "#10b981" }}>Successful!</span>
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "8px", fontSize: "1rem" }}>
            Thank you for your purchase. We have received your order.
          </p>

          <div style={{
            marginTop: "24px", padding: "20px", background: "var(--page)", borderRadius: "16px",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", textAlign: "left",
          }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase" }}>Payment ID</span>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", wordBreak: "break-all" }}>{paymentId}</div>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase" }}>Amount Paid</span>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--orange)" }}>₹{amount}</div>
            </div>
            <div className="plans-purchased-cell" style={{ gridColumn: "span 2" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "600", textTransform: "uppercase" }}>Service Plans Purchased</span>
              <div style={{ fontSize: "0.95rem", fontWeight: "700" }}>{plans}</div>
            </div>
          </div>
        </div>

        {/* ── Option Tabs (shown only after Google Form) ── */}
        {activeTab !== "google_form" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}>
            {[
              { tab: "form", icon: "person_pin", label: "Business Profile", desc: "Fill your billing & business details" },
              { tab: "scheduler", icon: "event", label: "Book a Call", desc: "Schedule a strategy session with us" },
              { tab: "whatsapp", icon: "chat", label: "WhatsApp", desc: "Complete onboarding via WhatsApp" },
            ].map(({ tab, icon, label, desc }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    padding: "16px 12px",
                    borderRadius: "16px",
                    border: `2px solid ${isActive ? "var(--orange)" : "var(--line-soft)"}`,
                    background: isActive ? "var(--orange-soft)" : "var(--surface)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 4px 14px rgba(229,96,48,0.15)" : "none",
                    textAlign: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "26px",
                      color: isActive ? "var(--orange)" : "var(--muted)",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {icon}
                  </span>
                  <span style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: isActive ? "var(--orange)" : "var(--text)",
                    whiteSpace: "nowrap",
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                    lineHeight: "1.3",
                  }}>
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Tab Pane Container ── */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--line-soft)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "var(--card-shadow)",
          animation: "fadeInSlide 0.3s ease-out",
        }}>

          {/* ════════════════════════════════════════════
              STEP 1 — Google Form
          ════════════════════════════════════════════ */}
          {activeTab === "google_form" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text)", marginBottom: "8px" }}>
                  Step 1: Quick Onboarding Form
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: "560px", margin: "0 auto" }}>
                  Please fill in your details below so we can kick-start your campaign. This takes less than 2 minutes!
                </p>
              </div>

              {/* ── After Google Form is submitted: show success + Next Step ── */}
              {googleFormDone ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                  borderRadius: "20px",
                  border: "1.5px solid #6ee7b7",
                  marginBottom: "24px",
                  animation: "fadeInSlide 0.4s ease-out",
                }}>
                  <div style={{
                    width: "80px", height: "80px",
                    background: "#10b981",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px auto",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                    animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "44px", color: "#fff" }}>check_circle</span>
                  </div>
                  <h3 style={{ fontSize: "1.7rem", fontWeight: "800", color: "#065f46", marginBottom: "8px" }}>
                    Google Form Submitted! 🎉
                  </h3>
                  <p style={{ color: "#047857", fontSize: "1rem", marginBottom: "28px", maxWidth: "460px", margin: "0 auto 28px auto" }}>
                    Thank you! We've received your information. Now let's complete your business profile so we can start your campaign.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("form")}
                    className="nav-button"
                    style={{
                      padding: "15px 36px",
                      fontSize: "1rem",
                      fontWeight: "700",
                      background: "var(--orange)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "999px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      boxShadow: "0 6px 20px rgba(229, 96, 48, 0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Continue to Step 2: Business Profile
                    <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>arrow_forward</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Google Form Iframe */}
                  <div style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid var(--line-soft)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                    background: "#fff",
                    marginBottom: "16px",
                    position: "relative",
                  }}>
                    {/* Loading overlay shown until first load */}
                    {iframeLoadCount === 0 && (
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        background: "#fff", zIndex: 2, gap: "12px", minHeight: "520px",
                      }}>
                        <div style={{
                          width: "40px", height: "40px",
                          border: "4px solid var(--line)",
                          borderTopColor: "var(--orange)",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading form...</span>
                      </div>
                    )}
                    <iframe
                      ref={iframeRef}
                      src={GOOGLE_FORM_URL}
                      width="100%"
                      height="520"
                      frameBorder="0"
                      marginHeight="0"
                      marginWidth="0"
                      title="BizzMaker Onboarding Google Form"
                      style={{ display: "block" }}
                      onLoad={() => {
                        setIframeLoadCount((prev) => {
                          const next = prev + 1;
                          // 1st load = form rendered; 2nd load = form submitted (thank-you page)
                          if (next >= 2) setGoogleFormDone(true);
                          return next;
                        });
                      }}
                    >
                      Loading form...
                    </iframe>
                  </div>

                  {/* Bottom action bar */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "16px",
                    padding: "16px 20px",
                    background: "var(--page)",
                    borderRadius: "14px",
                    border: "1px solid var(--line-soft)",
                  }}>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0, flex: 1 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "15px", verticalAlign: "middle", marginRight: "4px", color: "var(--orange)" }}>info</span>
                      Submit the form above — or click <strong>Next</strong> to skip and continue.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("form")}
                      className="nav-button"
                      style={{
                        padding: "13px 28px",
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        background: "var(--orange)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "999px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 15px rgba(229, 96, 48, 0.3)",
                        transition: "all 0.2s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Next
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_forward</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              STEP 2 — Business Onboarding Form
          ════════════════════════════════════════════ */}
          {activeTab === "form" && (
            <div>
              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "56px", color: "#10b981", marginBottom: "16px", display: "block" }}>task_alt</span>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "8px", color: "var(--text)" }}>Business Profile Saved!</h3>
                  <p style={{ color: "var(--orange)", fontWeight: "700", fontSize: "1rem", marginBottom: "16px" }}>Thanks for choosing BizzMaker!</p>
                  {requestCallBack && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: "var(--orange-soft)", color: "var(--orange)",
                      padding: "6px 16px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700", marginBottom: "16px",
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>phone_callback</span>
                      Call Back Requested
                    </div>
                  )}
                  <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "0 auto 24px auto" }}>
                    {requestCallBack
                      ? "Our campaign specialist will call you back to discuss these details."
                      : "Our onboarding team will review your details and reach out shortly."}
                  </p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setActiveTab("scheduler")} className="nav-button" style={{ background: "var(--orange)", color: "#fff" }}>
                      Book a Strategy Call
                    </button>
                    <a href={getWhatsAppOnboardingLink()} target="_blank" rel="noopener noreferrer" className="nav-button" style={{ textDecoration: "none", display: "inline-block", background: "#25d366" }}>
                      Chat on WhatsApp
                    </a>
                    <a href="/" className="nav-button" style={{ textDecoration: "none", display: "inline-block", background: "var(--text)" }}>Go to Home</a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", borderBottom: "1px solid var(--line-soft)", paddingBottom: "16px", marginBottom: "4px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)" }}>
                      Step 2: Business Profile & Billing Details
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab("google_form")}
                      style={{
                        background: "transparent", border: "1px solid var(--line)",
                        color: "var(--muted)", fontWeight: "600", fontSize: "0.85rem",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                        padding: "8px 14px", borderRadius: "999px",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
                      Back to Google Form
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="biz-fields-grid">
                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>Primary Contact Person Name *</label>
                      <input required type="text" placeholder="e.g. Prem Sharma" value={contactName}
                        onChange={(e) => setContactName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>Alternative WhatsApp / Phone No.</label>
                      <input type="tel" placeholder="e.g. +91 90960 90701" value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>Business Entity Type *</label>
                      <select required value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none", background: "var(--surface)" }}>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                        <option value="Individual">Individual</option>
                        <option value="LLP">LLP</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>GSTIN Number (Optional)</label>
                      <input type="text" placeholder="e.g. 27AAAAA0000A1Z5" value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none", textTransform: "uppercase" }} />
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>Billing Address Line 1 *</label>
                      <input required type="text" placeholder="Street Address, P.O. Box, Company name" value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }} />
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>Billing Address Line 2</label>
                      <input type="text" placeholder="Apartment, Suite, Unit, Building, Floor, etc." value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>City *</label>
                      <input required type="text" placeholder="e.g. Pune" value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>State / Region *</label>
                      <input required type="text" placeholder="e.g. Maharashtra" value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }} />
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>ZIP / Pin Code *</label>
                      <input required type="text" placeholder="e.g. 411001" value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line)", fontSize: "0.95rem", outline: "none" }} />
                    </div>
                  </div>

                  {/* Callback Checkbox */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--page)", padding: "12px 16px", borderRadius: "10px", border: "1px solid var(--line-soft)" }}>
                    <input type="checkbox" id="callback-checkbox" checked={requestCallBack}
                      onChange={(e) => setRequestCallBack(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--orange)" }} />
                    <label htmlFor="callback-checkbox" style={{ fontSize: "0.92rem", fontWeight: "700", color: "var(--text)", cursor: "pointer" }}>
                      Yes, I request a callback from a manager to discuss these onboarding details.
                    </label>
                  </div>

                  {/* Submit & Skip */}
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "8px", flexWrap: "wrap" }}>
                    <button type="submit" disabled={formLoading} className="nav-button"
                      style={{ padding: "14px 24px", fontSize: "0.95rem", fontWeight: "700", background: "var(--orange)", color: "#ffffff", border: "none", borderRadius: "999px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(229, 96, 48, 0.3)", transition: "all 0.2s ease" }}>
                      {formLoading ? "Saving details..." : "Submit Business Details"}
                    </button>
                    <button type="button" onClick={() => setActiveTab("scheduler")} className="skip-btn"
                      style={{ background: "transparent", border: "none", color: "var(--orange)", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", transition: "all 0.2s ease" }}>
                      Skip & Book a Call
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              STEP 3 — Strategy Call Scheduler
          ════════════════════════════════════════════ */}
          {activeTab === "scheduler" && (
            <div>
              {schedulerBooked ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "56px", color: "var(--blue)", marginBottom: "16px", display: "block" }}>calendar_today</span>
                  <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "8px", color: "var(--text)" }}>Strategy Call Booked!</h3>
                  <p style={{ color: "var(--orange)", fontWeight: "700", fontSize: "1rem", marginBottom: "16px" }}>Thanks for choosing BizzMaker!</p>
                  <p style={{ color: "var(--muted)", maxWidth: "550px", margin: "0 auto 24px auto" }}>
                    We have booked your strategy meeting slot for <strong>{selectedDate}</strong> at <strong>{selectedTimeSlot}</strong>.
                    A Google Meet invite will be sent to your email shortly.
                  </p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <a href="/" className="nav-button" style={{ textDecoration: "none", display: "inline-block", background: "var(--text)" }}>Go to Home</a>
                    <button onClick={() => setSchedulerBooked(false)} className="nav-button" style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--line)" }}>
                      Change Time
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSchedulerSubmit}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", borderBottom: "1px solid var(--line-soft)", paddingBottom: "16px", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)" }}>Step 3: Book Strategy Onboarding Call</h2>
                    <button type="button" onClick={() => setActiveTab("form")}
                      style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--muted)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "8px 14px", borderRadius: "999px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
                      Back
                    </button>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "24px" }}>
                    Select a convenient date and time for a strategy onboarding session with our project manager.
                  </p>

                  {/* Date Grid */}
                  <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text)", marginBottom: "12px" }}>1. Select a Date:</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
                      {nextDays.map((d, idx) => {
                        const dateString = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                        const valString = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                        const isSelected = selectedDate === valString;
                        return (
                          <button key={idx} type="button" onClick={() => setSelectedDate(valString)}
                            style={{ padding: "14px 10px", borderRadius: "12px", border: "1px solid", borderColor: isSelected ? "var(--orange)" : "var(--line)", background: isSelected ? "var(--orange-soft)" : "var(--surface)", color: isSelected ? "var(--orange)" : "var(--text)", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease" }}>
                            {dateString}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div style={{ marginBottom: "32px", animation: "fadeInSlide 0.2s ease-out" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "var(--text)", marginBottom: "12px" }}>2. Select an Available Time Slot (IST):</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
                        {timeSlots.map((slot, idx) => {
                          const isSelected = selectedTimeSlot === slot;
                          return (
                            <button key={idx} type="button" onClick={() => setSelectedTimeSlot(slot)}
                              style={{ padding: "10px 8px", borderRadius: "10px", border: "1px solid", borderColor: isSelected ? "var(--orange)" : "var(--line)", background: isSelected ? "var(--orange-soft)" : "var(--surface)", color: isSelected ? "var(--orange)" : "var(--muted)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.15s ease" }}>
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
                    <button type="submit" disabled={schedulerLoading || !selectedDate || !selectedTimeSlot} className="nav-button"
                      style={{ padding: "14px 24px", fontSize: "0.95rem", fontWeight: "700", background: "var(--orange)", color: "#ffffff", border: "none", borderRadius: "999px", cursor: (!selectedDate || !selectedTimeSlot) ? "not-allowed" : "pointer", opacity: (!selectedDate || !selectedTimeSlot) ? 0.6 : 1, display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(229, 96, 48, 0.3)", transition: "all 0.2s ease" }}>
                      {schedulerLoading ? "Scheduling call..." : "Confirm Booking Slot"}
                    </button>
                    <button type="button" onClick={() => setActiveTab("whatsapp")} className="skip-btn"
                      style={{ background: "transparent", border: "none", color: "var(--orange)", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", transition: "all 0.2s ease" }}>
                      Skip & Onboard via WhatsApp
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════
              STEP 4 — WhatsApp Direct Onboarding
          ════════════════════════════════════════════ */}
          {activeTab === "whatsapp" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
                <button type="button" onClick={() => setActiveTab("scheduler")}
                  style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--muted)", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "8px 14px", borderRadius: "999px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span> Back
                </button>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text)", margin: "0 auto" }}>Step 4: Onboarding via WhatsApp</h2>
                <div style={{ width: "90px" }} />
              </div>
              <div style={{ width: "72px", height: "72px", background: "#e8fbf0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", color: "#25d366" }}>
                <svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.817 9.817 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.136 8.136 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.188 8.188 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24z" />
                </svg>
              </div>
              <p style={{ color: "var(--muted)", maxWidth: "520px", margin: "0 auto 24px auto", fontSize: "0.95rem" }}>
                Complete your campaign setup instantly on chat. Send a prefilled WhatsApp message to our onboarding staff to begin.
              </p>
              <div style={{ textAlign: "left", maxWidth: "560px", margin: "0 auto 28px auto", padding: "20px", background: "var(--page)", border: "1px dashed var(--line)", borderRadius: "16px", fontFamily: "monospace", fontSize: "0.85rem", whiteSpace: "pre-wrap", color: "var(--text)", maxHeight: "220px", overflowY: "auto", lineHeight: "1.5" }}>
                <strong style={{ color: "var(--orange)", display: "block", marginBottom: "8px", fontFamily: "inherit" }}>Prefilled Message Preview:</strong>
                {getWhatsAppOnboardingMessage()}
              </div>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <a href={getWhatsAppOnboardingLink()} target="_blank" rel="noopener noreferrer" className="nav-button"
                  style={{ background: "#25d366", color: "#ffffff", textDecoration: "none", padding: "14px 28px", borderRadius: "999px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chat</span>
                  Launch WhatsApp Chat
                </a>
                <a href="/" className="nav-button" style={{ textDecoration: "none", display: "inline-block", background: "var(--text)", padding: "14px 28px", borderRadius: "999px", fontWeight: "700" }}>
                  Go to Home
                </a>
              </div>
            </div>
          )}

        </div>
      </main>

      <SiteFooter />

      <style jsx global>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @media (max-width: 576px) {
          .biz-fields-grid { grid-template-columns: 1fr !important; }
          .biz-fields-grid > div[style*="span 2"] { grid-column: span 1 !important; }
          .plans-purchased-cell { grid-column: span 1 !important; }
        }
        .skip-btn:hover { background-color: var(--orange-soft) !important; }
        .nav-button { transition: opacity 0.2s ease, transform 0.15s ease; }
        .nav-button:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>
    </div >
  );
}
