"use client";

import React, { useState, useEffect } from "react";

function Icon({ name, className = "", style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ verticalAlign: "middle", ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export default function IndustryPlansManager({ showToast }) {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustryId, setSelectedIndustryId] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    badge: "",
    bannerImage: "/real_estate_package_banner.jpg",
    contactPhone: "+91 9096090701",
    contactWebsite: "www.aidigital.biz",
    contactLocation: "Pune, Maharashtra",
    package: {
      id: "",
      name: "",
      price: 200000,
      priceDisplay: "2 LAC",
      period: "FOR 3 MONTHS",
      subtitle: "",
      features: [],
      outcomes: []
    },
    faqs: []
  });

  const loadIndustries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/industry-plans?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.industries)) {
          setIndustries(data.industries);
          if (data.industries.length > 0) {
            const current = data.industries.find((i) => i.id === selectedIndustryId) || data.industries[0];
            setSelectedIndustryId(current.id);
            setFormData(JSON.parse(JSON.stringify(current)));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load industry plans:", err);
      if (showToast) showToast("Failed to load industry plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustries();
  }, []);

  const handleSelectIndustry = (id) => {
    setIsCreatingNew(false);
    setSelectedIndustryId(id);
    const ind = industries.find((i) => i.id === id);
    if (ind) {
      setFormData(JSON.parse(JSON.stringify(ind)));
    }
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    const newId = "industry_" + Date.now().toString(36);
    setFormData({
      id: newId,
      name: "",
      badge: "Digital Marketing Partner",
      bannerImage: "/real_estate_package_banner.jpg",
      contactPhone: "+91 9096090701",
      contactWebsite: "www.aidigital.biz",
      contactLocation: "Pune, Maharashtra",
      package: {
        id: "pkg_" + newId,
        name: "Complete Digital Marketing Package",
        price: 99999,
        priceDisplay: "99,999",
        period: "FOR 3 MONTHS",
        subtitle: "Full-Funnel Growth Engine Designed for High-Intent Growth.",
        features: [
          { title: "Targeted Meta & Google Ads", desc: "Omnichannel performance marketing", icon: "campaign" },
          { title: "Landing Page Development", desc: "High-converting CRO launch page", icon: "web" },
          { title: "WhatsApp Marketing", desc: "Automated broadcast & follow-ups", icon: "chat" },
          { title: "Lead Qualification Support", desc: "Verify and qualify customer inquiries", icon: "verified_user" }
        ],
        outcomes: [
          "More Quality Leads with Verified Details",
          "Stronger Brand Presence",
          "Better Market Visibility",
          "End-to-End Dedicated Growth Support"
        ]
      },
      faqs: [
        {
          question: "What is included in this package?",
          answer: "Comprehensive marketing strategy, creative assets, paid ads management, and lead tracking."
        }
      ]
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      if (showToast) showToast("Industry Name is required", "error");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/industry-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: formData })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (showToast) showToast(resData.message || "Industry plan saved successfully!");
        setIsCreatingNew(false);
        setSelectedIndustryId(formData.id);
        await loadIndustries();
      } else {
        if (showToast) showToast(resData.error || "Failed to save industry plan", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      if (showToast) showToast("Network error saving industry plan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (industries.length <= 1) {
      alert("You must keep at least one industry plan (e.g. Real Estate)!");
      return;
    }

    if (!confirm(`Are you sure you want to delete the plan for "${formData.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/industry-plans?id=${formData.id}`, {
        method: "DELETE"
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (showToast) showToast("Industry plan deleted!");
        setIsCreatingNew(false);
        await loadIndustries();
      } else {
        if (showToast) showToast(resData.error || "Failed to delete plan", "error");
      }
    } catch (err) {
      if (showToast) showToast("Network error deleting plan", "error");
    } finally {
      setSaving(false);
    }
  };

  // Deliverables (Features) Helpers
  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        features: [
          ...prev.package.features,
          { title: "New Deliverable", desc: "Deliverable description here", icon: "check_circle" }
        ]
      }
    }));
  };

  const updateFeature = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.package.features];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        package: {
          ...prev.package,
          features: updated
        }
      };
    });
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        features: prev.package.features.filter((_, idx) => idx !== index)
      }
    }));
  };

  // Outcomes Helpers
  const addOutcome = () => {
    setFormData((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        outcomes: [...prev.package.outcomes, "New Guaranteed Outcome"]
      }
    }));
  };

  const updateOutcome = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.package.outcomes];
      updated[index] = value;
      return {
        ...prev,
        package: {
          ...prev.package,
          outcomes: updated
        }
      };
    });
  };

  const removeOutcome = (index) => {
    setFormData((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        outcomes: prev.package.outcomes.filter((_, idx) => idx !== index)
      }
    }));
  };

  // FAQ Helpers
  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        { question: "Frequently asked question?", answer: "Clear, helpful answer explaining the package." }
      ]
    }));
  };

  const updateFaq = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.faqs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, faqs: updated };
    });
  };

  const removeFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, idx) => idx !== index)
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
        <Icon name="progress_activity" className="spin-icon" style={{ fontSize: "32px" }} />
        <p style={{ marginTop: "12px" }}>Loading Industry Plans Manager...</p>
      </div>
    );
  }

  return (
    <div style={{ color: "#F8FAFC" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px"
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Icon name="tune" style={{ color: "#FD7E14" }} /> Industry Plans & Pricing Manager
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "6px" }}>
            Manage industry plans, pricing, deliverables, banners, and FAQs. When you add a new industry here, the dropdown on the website automatically increases!
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="/pricing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#F8FAFC",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none"
            }}
          >
            <Icon name="visibility" /> View Live /pricing
          </a>

          <button
            onClick={handleStartCreateNew}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
            }}
          >
            <Icon name="add_circle" /> + Add New Industry Plan
          </button>
        </div>
      </div>

      {/* Industries Selector Bar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "12px",
          marginBottom: "24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        {industries.map((ind) => {
          const isSelected = !isCreatingNew && selectedIndustryId === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => handleSelectIndustry(ind.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                border: isSelected ? "1.5px solid #FD7E14" : "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: isSelected ? "rgba(253, 126, 20, 0.15)" : "rgba(30, 41, 59, 0.7)",
                color: isSelected ? "#FD7E14" : "#CBD5E1",
                fontSize: "14px",
                fontWeight: isSelected ? "700" : "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease"
              }}
            >
              <Icon name="apartment" style={{ fontSize: "18px" }} />
              {ind.name}
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "99px",
                  background: isSelected ? "#FD7E14" : "rgba(255, 255, 255, 0.1)",
                  color: isSelected ? "#FFFFFF" : "#94A3B8"
                }}
              >
                ₹{ind.package?.priceDisplay || ind.package?.price || "Plan"}
              </span>
            </button>
          );
        })}

        {isCreatingNew && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "1.5px dashed #3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              color: "#60A5FA",
              fontSize: "14px",
              fontWeight: "700",
              whiteSpace: "nowrap"
            }}
          >
            <Icon name="edit" /> New Industry Plan (Draft)
          </div>
        )}
      </div>

      {/* Main Editing Card */}
      <form onSubmit={handleSave}>
        <div
          style={{
            backgroundColor: "#1E293B",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "28px"
          }}
        >
          {/* Section 1: Industry Metadata */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="category" /> 1. Industry Information
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Industry Name (Shows in Dropdown) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Real Estate, Healthcare, Education"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Industry ID / URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. real-estate, healthcare, education"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Industry Tagline / Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Digital Marketing Partner For Builders"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Banner Image Path (in /public)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /real_estate_package_banner.jpg"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Package Pricing & Headline */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="payments" /> 2. Package Pricing & Headline
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Package Title
                </label>
                <input
                  type="text"
                  value={formData.package?.name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      package: { ...formData.package, name: e.target.value }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Price (Numeric for Checkout)
                </label>
                <input
                  type="number"
                  value={formData.package?.price || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      package: { ...formData.package, price: Number(e.target.value) }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Price Display Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 LAC or 1,49,999"
                  value={formData.package?.priceDisplay || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      package: { ...formData.package, priceDisplay: e.target.value }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Duration / Period Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. FOR 3 MONTHS or /month"
                  value={formData.package?.period || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      package: { ...formData.package, period: e.target.value }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#0F172A",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                Package Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={formData.package?.subtitle || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    package: { ...formData.package, subtitle: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#0F172A",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical"
                }}
              />
            </div>
          </div>

          {/* Section 3: Guaranteed Outcomes */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="verified" /> 3. Value Outcomes & Guarantees ({formData.package?.outcomes?.length || 0})
              </h3>
              <button
                type="button"
                onClick={addOutcome}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Icon name="add" /> Add Outcome
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
              {formData.package?.outcomes?.map((outcome, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#0F172A",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <Icon name="check_circle" style={{ color: "#10B981", fontSize: "18px" }} />
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => updateOutcome(idx, e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#F8FAFC",
                      fontSize: "13px",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeOutcome(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#EF4444",
                      cursor: "pointer",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <Icon name="close" style={{ fontSize: "16px" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: 10 Deliverables (Features) */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="inventory_2" /> 4. What's Included / Deliverables ({formData.package?.features?.length || 0})
              </h3>
              <button
                type="button"
                onClick={addFeature}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Icon name="add" /> Add Deliverable
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "12px" }}>
              {formData.package?.features?.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#0F172A",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                      <input
                        type="text"
                        placeholder="icon name (e.g. chat, call, web)"
                        value={feat.icon || "check_circle"}
                        onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                        style={{
                          width: "80px",
                          padding: "4px 8px",
                          backgroundColor: "#1E293B",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          color: "#FD7E14",
                          fontSize: "11px",
                          outline: "none"
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Deliverable Title"
                        value={feat.title}
                        onChange={(e) => updateFeature(idx, "title", e.target.value)}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          backgroundColor: "#1E293B",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          color: "#FFFFFF",
                          fontSize: "13px",
                          fontWeight: "700",
                          outline: "none"
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        padding: "4px"
                      }}
                    >
                      <Icon name="delete" style={{ fontSize: "18px" }} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={feat.desc || ""}
                    onChange={(e) => updateFeature(idx, "desc", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      backgroundColor: "#1E293B",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      color: "#94A3B8",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Plan FAQs */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="quiz" /> 5. Plan FAQs ({formData.faqs?.length || 0})
              </h3>
              <button
                type="button"
                onClick={addFaq}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Icon name="add" /> Add FAQ
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {formData.faqs?.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#0F172A",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, "question", e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        backgroundColor: "#1E293B",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "6px",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: "700",
                        outline: "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#EF4444",
                        cursor: "pointer",
                        padding: "4px 8px"
                      }}
                    >
                      <Icon name="delete" style={{ fontSize: "18px" }} />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#1E293B",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      color: "#94A3B8",
                      fontSize: "12px",
                      outline: "none",
                      resize: "vertical"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
              }}
            >
              <Icon name="save" /> {saving ? "Saving Changes..." : "Save Industry Plan"}
            </button>

            {!isCreatingNew && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "12px 20px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#EF4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                <Icon name="delete" /> Delete Industry Plan
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
