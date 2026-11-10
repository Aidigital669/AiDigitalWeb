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
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    badge: "",
    bannerImage: "/Price.jpeg",
    contactPhone: "9096090701",
    contactWebsite: "www.aidigital.biz",
    contactLocation: "Pune, Maharashtra",
    packages: [],
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
            const pkgs = Array.isArray(current.packages) && current.packages.length > 0
              ? current.packages
              : current.package ? [current.package] : [];
            setFormData({
              ...JSON.parse(JSON.stringify(current)),
              packages: pkgs,
              package: pkgs[0] || current.package
            });
            setSelectedPackageIndex(0);
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
      const pkgs = Array.isArray(ind.packages) && ind.packages.length > 0
        ? ind.packages
        : ind.package ? [ind.package] : [];
      setFormData({
        ...JSON.parse(JSON.stringify(ind)),
        packages: pkgs,
        package: pkgs[0] || ind.package
      });
      setSelectedPackageIndex(0);
    }
  };

  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    const newId = "industry_" + Date.now().toString(36);
    const defaultPkg = {
      id: "pkg_" + newId,
      category: "standard",
      tabLabel: "Standard Package",
      name: "Complete Digital Marketing Package",
      hook: "PERFORMANCE MARKETING PACKAGE",
      headline: "Digital Marketing Partner for High Growth",
      subtitle: "Full-Funnel Growth Engine Designed for High-Intent Inquiries.",
      badge: "Digital Marketing Partner",
      channelPartner: "AI DIGITAL ASSOCIATE CHANNEL",
      bannerImage: "/Price.jpeg",
      price: 99999,
      priceDisplay: "99,999",
      period: "FOR 3 MONTHS",
      monthlyEffective: "₹33,333 Effective per Month",
      features: [
        { title: "Targeted Meta & Google Ads", desc: "Omnichannel performance campaigns", icon: "campaign" },
        { title: "Landing Page Development", desc: "High-converting CRO launch page", icon: "web" },
        { title: "WhatsApp Marketing", desc: "Automated broadcast & instant follow-ups", icon: "chat" },
        { title: "Lead Qualification Support", desc: "Verify and qualify customer inquiries", icon: "verified" }
      ],
      outcomes: [
        "More Quality Leads with Verified Details",
        "Stronger Brand Presence",
        "Better Market Visibility",
        "End-to-End Dedicated Growth Support"
      ]
    };

    setFormData({
      id: newId,
      name: "",
      badge: "Digital Marketing Partner",
      bannerImage: "/Price.jpeg",
      contactPhone: "+91 9096090701",
      contactWebsite: "www.aidigital.biz",
      contactLocation: "Pune, Maharashtra",
      packages: [defaultPkg],
      package: defaultPkg,
      faqs: [
        {
          question: "What is included in this package?",
          answer: "Comprehensive marketing strategy, creative assets, paid ads management, and lead tracking."
        }
      ]
    });
    setSelectedPackageIndex(0);
  };

  // Get active package being edited
  const packagesList = formData.packages && formData.packages.length > 0 ? formData.packages : (formData.package ? [formData.package] : []);
  const activePackage = packagesList[selectedPackageIndex] || packagesList[0] || {};

  // Package Management Handlers
  const handleAddNewPackage = () => {
    const newPkgId = "pkg_" + Date.now().toString(36);
    const newPkg = {
      id: newPkgId,
      category: "custom",
      tabLabel: `New Package ${packagesList.length + 1}`,
      name: `New Growth Package ${packagesList.length + 1}`,
      hook: "SPECIAL MARKETING PACKAGE",
      headline: `Digital Marketing Partner for Real Estate`,
      subtitle: "Scale Property Sales, Site Visits & Closings",
      badge: "Exclusive Package",
      channelPartner: "AI DIGITAL ASSOCIATE CHANNEL",
      bannerImage: "/Price.jpeg",
      price: 150000,
      priceDisplay: "1.5 LAC",
      period: "FOR 3 MONTHS",
      monthlyEffective: "₹50,000 Effective / Mo",
      features: [
        { title: "WhatsApp Marketing + Quality Data", desc: "Automated broadcast & verified buyer data", icon: "chat" },
        { title: "Meta & Google Ads", desc: "High-intent buyer campaigns across channels", icon: "bar_chart" },
        { title: "Lead Qualification Support", desc: "Proactive verification of inquiries", icon: "verified" },
        { title: "AI Promotional Videos", desc: "Cinematic property walkthroughs & social promo reels", icon: "memory" }
      ],
      outcomes: [
        "More Quality Leads",
        "Stronger Brand Presence",
        "Better Project Visibility",
        "End-to-End Support"
      ]
    };

    const updated = [...packagesList, newPkg];
    setFormData((prev) => ({
      ...prev,
      packages: updated,
      package: updated[0]
    }));
    setSelectedPackageIndex(updated.length - 1);
    if (showToast) showToast("New package created! You can now configure its details below.", "success");
  };

  const handleDuplicatePackage = () => {
    if (!activePackage) return;
    const cloned = JSON.parse(JSON.stringify(activePackage));
    cloned.id = "pkg_" + Date.now().toString(36);
    cloned.name = `${cloned.name || "Package"} (Copy)`;
    cloned.tabLabel = `${cloned.tabLabel || "Package"} (Copy)`;
    const updated = [...packagesList, cloned];
    setFormData((prev) => ({
      ...prev,
      packages: updated,
      package: updated[0]
    }));
    setSelectedPackageIndex(updated.length - 1);
    if (showToast) showToast("Package duplicated successfully!", "success");
  };

  const handleDeletePackage = (pkgIndex) => {
    if (packagesList.length <= 1) {
      alert("You must keep at least one package in this industry!");
      return;
    }
    const pkgToDelete = packagesList[pkgIndex];
    if (!confirm(`Are you sure you want to delete "${pkgToDelete.name || 'this package'}"?`)) {
      return;
    }
    const updated = packagesList.filter((_, idx) => idx !== pkgIndex);
    const newIdx = Math.max(0, pkgIndex - 1);
    setFormData((prev) => ({
      ...prev,
      packages: updated,
      package: updated[0]
    }));
    setSelectedPackageIndex(newIdx);
    if (showToast) showToast("Package removed!", "success");
  };

  const updateActivePackage = (field, value) => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      updatedPackages[selectedPackageIndex] = { ...cur, [field]: value };
      return {
        ...prev,
        packages: updatedPackages,
        package: updatedPackages[0]
      };
    });
  };

  // Deliverables (Features) Helpers
  const addFeature = () => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      const curFeatures = cur.features || [];
      updatedPackages[selectedPackageIndex] = {
        ...cur,
        features: [...curFeatures, { title: "New Deliverable", desc: "Short description here", icon: "check_circle" }]
      };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  const updateFeature = (fIdx, field, value) => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      const curFeatures = [...(cur.features || [])];
      curFeatures[fIdx] = { ...curFeatures[fIdx], [field]: value };
      updatedPackages[selectedPackageIndex] = { ...cur, features: curFeatures };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  const removeFeature = (fIdx) => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      updatedPackages[selectedPackageIndex] = {
        ...cur,
        features: (cur.features || []).filter((_, i) => i !== fIdx)
      };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  // Outcomes Helpers
  const addOutcome = () => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      updatedPackages[selectedPackageIndex] = {
        ...cur,
        outcomes: [...(cur.outcomes || []), "New Guaranteed Outcome"]
      };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  const updateOutcome = (oIdx, value) => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      const curOutcomes = [...(cur.outcomes || [])];
      curOutcomes[oIdx] = value;
      updatedPackages[selectedPackageIndex] = { ...cur, outcomes: curOutcomes };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  const removeOutcome = (oIdx) => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      updatedPackages[selectedPackageIndex] = {
        ...cur,
        outcomes: (cur.outcomes || []).filter((_, i) => i !== oIdx)
      };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  // Tiers Helpers (e.g. for CP ticket sizes)
  const addTier = () => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      const curTiers = cur.tiers || [];
      const newTierId = "tier_" + Date.now().toString(36);
      updatedPackages[selectedPackageIndex] = {
        ...cur,
        tiers: [
          ...curTiers,
          {
            id: newTierId,
            name: "New Ticket Tier",
            ticketScope: "Project Scope",
            price: 75000,
            priceDisplay: "75,000",
            period: "for 3 Months",
            monthlyEffective: "₹25,000 Effective per Month",
            icon: "apartment",
            popular: false
          }
        ]
      };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  const updateTier = (tIdx, field, value) => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      const curTiers = [...(cur.tiers || [])];
      curTiers[tIdx] = { ...curTiers[tIdx], [field]: value };
      updatedPackages[selectedPackageIndex] = { ...cur, tiers: curTiers };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
  };

  const removeTier = (tIdx) => {
    setFormData((prev) => {
      const updatedPackages = [...(prev.packages || [])];
      const cur = updatedPackages[selectedPackageIndex] || {};
      updatedPackages[selectedPackageIndex] = {
        ...cur,
        tiers: (cur.tiers || []).filter((_, i) => i !== tIdx)
      };
      return { ...prev, packages: updatedPackages, package: updatedPackages[0] };
    });
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

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      if (showToast) showToast("Industry Name is required", "error");
      return;
    }

    const payload = {
      ...formData,
      package: (formData.packages && formData.packages[0]) || formData.package
    };

    try {
      setSaving(true);
      const res = await fetch("/api/industry-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: payload })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (showToast) showToast(resData.message || "Industry plans & packages saved successfully!");
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

  const handleDeleteIndustry = async () => {
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
            <Icon name="tune" style={{ color: "#FD7E14" }} /> Industry Plans &amp; Packages Manager
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "6px" }}>
            Add and manage packages, prices, ticket tiers, deliverables, and banners. Any package you add here displays live on /pricing!
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
          const pkgCount = ind.packages?.length || 1;
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
                  color: isSelected ? "#FFFFFF" : "#94A3B8",
                  fontWeight: "700"
                }}
              >
                {pkgCount} {pkgCount === 1 ? "Pack" : "Packs"}
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
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9096090701"
                  value={formData.contactPhone || ""}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
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
                  Office Location / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Boulevard Tower, Camp, Pune"
                  value={formData.contactLocation || ""}
                  onChange={(e) => setFormData({ ...formData, contactLocation: e.target.value })}
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

          {/* Section 2: Packages in this Industry (ADD & MANAGE PACKAGES) */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Icon name="inventory" /> 2. Packages in this Industry ({packagesList.length})
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "12px", margin: "4px 0 0 0" }}>
                  Click any package to edit its details, or click <strong>&quot;+ Add New Package&quot;</strong> to create a new one!
                </p>
              </div>

              {/* ACTION: + Add New Package */}
              <button
                type="button"
                onClick={handleAddNewPackage}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 18px",
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                }}
              >
                <Icon name="add_circle" /> + Add New Package
              </button>
            </div>

            {/* Packages Selector Tabs */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
              {packagesList.map((pkg, idx) => {
                const isSelected = selectedPackageIndex === idx;
                return (
                  <button
                    key={pkg.id || idx}
                    type="button"
                    onClick={() => setSelectedPackageIndex(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      backgroundColor: isSelected ? "rgba(253, 126, 20, 0.15)" : "#0F172A",
                      border: isSelected ? "1.5px solid #FD7E14" : "1px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <Icon
                      name={pkg.category === "cp" ? "handshake" : "apartment"}
                      style={{ color: isSelected ? "#FD7E14" : "#94A3B8", fontSize: "20px" }}
                    />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: isSelected ? "#FFFFFF" : "#CBD5E1" }}>
                        {pkg.name || `Package ${idx + 1}`}
                      </div>
                      <div style={{ fontSize: "11px", color: isSelected ? "#FAD978" : "#94A3B8", fontWeight: "700" }}>
                        ₹{pkg.priceDisplay || pkg.price} • {pkg.period || "FOR 3 MONTHS"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Package Action Bar (Duplicate & Delete) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                backgroundColor: "#0F172A",
                padding: "10px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div style={{ fontSize: "13px", color: "#F8FAFC" }}>
                Active Package: <strong style={{ color: "#FD7E14" }}>{activePackage.name || "Selected Package"}</strong>
                <span style={{ marginLeft: "10px", fontSize: "11px", color: "#94A3B8" }}>ID: {activePackage.id}</span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleDuplicatePackage}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
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
                  <Icon name="content_copy" style={{ fontSize: "15px" }} /> Duplicate
                </button>

                {packagesList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeletePackage(selectedPackageIndex)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      color: "#EF4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Icon name="delete" style={{ fontSize: "15px" }} /> Delete Package
                  </button>
                )}
              </div>
            </div>

            {/* Active Package Form Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Package Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={activePackage.name || ""}
                  onChange={(e) => updateActivePackage("name", e.target.value)}
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
                  Category Key (e.g. builder, cp, custom)
                </label>
                <input
                  type="text"
                  value={activePackage.category || "custom"}
                  onChange={(e) => updateActivePackage("category", e.target.value.toLowerCase().trim())}
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
                  Price (Numeric Amount for Checkout) *
                </label>
                <input
                  type="number"
                  required
                  value={activePackage.price || 0}
                  onChange={(e) => updateActivePackage("price", Number(e.target.value))}
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
                  Price Display Label (e.g. 2 LAC, 75,000) *
                </label>
                <input
                  type="text"
                  required
                  value={activePackage.priceDisplay || ""}
                  onChange={(e) => updateActivePackage("priceDisplay", e.target.value)}
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
                  Duration / Period Tag (e.g. FOR 3 MONTHS)
                </label>
                <input
                  type="text"
                  value={activePackage.period || "FOR 3 MONTHS"}
                  onChange={(e) => updateActivePackage("period", e.target.value)}
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
                  Monthly Effective Subtext
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹66,667 Effective / Mo"
                  value={activePackage.monthlyEffective || ""}
                  onChange={(e) => updateActivePackage("monthlyEffective", e.target.value)}
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
                  Banner Image Path (in /public or full URL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /Price.jpeg or /Price_CP.jpg"
                  value={activePackage.bannerImage || ""}
                  onChange={(e) => updateActivePackage("bannerImage", e.target.value)}
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
                  Card Badge (e.g. Real Estate Builders)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Real Estate Builders"
                  value={activePackage.badge || ""}
                  onChange={(e) => updateActivePackage("badge", e.target.value)}
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                  Eyebrow Hook (e.g. COMPLETE DIGITAL MARKETING PACKAGE)
                </label>
                <input
                  type="text"
                  value={activePackage.hook || ""}
                  onChange={(e) => updateActivePackage("hook", e.target.value)}
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
                  Headline / Main Card Title
                </label>
                <input
                  type="text"
                  value={activePackage.headline || ""}
                  onChange={(e) => updateActivePackage("headline", e.target.value)}
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

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", marginBottom: "6px" }}>
                Package Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={activePackage.subtitle || ""}
                onChange={(e) => updateActivePackage("subtitle", e.target.value)}
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

            {/* Optional Multi-Tier Ticket Options (like CP Plans) */}
            <div style={{ backgroundColor: "#0F172A", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#FAD978", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon name="tune" /> Multi-Tier Ticket Options (Optional, e.g. for CP Plans) ({activePackage.tiers?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={addTier}
                  style={{
                    padding: "5px 12px",
                    backgroundColor: "rgba(250, 217, 120, 0.15)",
                    color: "#FAD978",
                    border: "1px solid rgba(250, 217, 120, 0.3)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Icon name="add" /> Add Tier Option
                </button>
              </div>

              {activePackage.tiers && activePackage.tiers.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {activePackage.tiers.map((tier, tIdx) => (
                    <div
                      key={tier.id || tIdx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto",
                        gap: "8px",
                        alignItems: "center",
                        backgroundColor: "#1E293B",
                        padding: "8px 12px",
                        borderRadius: "8px"
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Ticket Scope (e.g. Project upto ₹80 Lakh)"
                        value={tier.ticketScope || tier.name || ""}
                        onChange={(e) => updateTier(tIdx, "ticketScope", e.target.value)}
                        style={{ padding: "6px 8px", backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px", outline: "none" }}
                      />
                      <input
                        type="number"
                        placeholder="Price (e.g. 75000)"
                        value={tier.price || 0}
                        onChange={(e) => updateTier(tIdx, "price", Number(e.target.value))}
                        style={{ padding: "6px 8px", backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px", outline: "none" }}
                      />
                      <input
                        type="text"
                        placeholder="Display (e.g. 75,000)"
                        value={tier.priceDisplay || ""}
                        onChange={(e) => updateTier(tIdx, "priceDisplay", e.target.value)}
                        style={{ padding: "6px 8px", backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px", outline: "none" }}
                      />
                      <input
                        type="text"
                        placeholder="Effective / Mo"
                        value={tier.monthlyEffective || ""}
                        onChange={(e) => updateTier(tIdx, "monthlyEffective", e.target.value)}
                        style={{ padding: "6px 8px", backgroundColor: "#0F172A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px", outline: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeTier(tIdx)}
                        style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px" }}
                        title="Remove Tier"
                      >
                        <Icon name="delete" style={{ fontSize: "16px" }} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#64748B", fontSize: "12px", margin: 0, fontStyle: "italic" }}>
                  This package does not use multiple ticket size options. Leave empty for single-price packages (like the Builder Pack).
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Guaranteed Outcomes for Active Package */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="verified" /> 3. Value Outcomes &amp; Guarantees ({activePackage.outcomes?.length || 0})
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
              {activePackage.outcomes?.map((outcome, idx) => (
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

          {/* Section 4: Deliverables (Features) for Active Package */}
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#FD7E14", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="inventory_2" /> 4. What&apos;s Included / Deliverables ({activePackage.features?.length || 0})
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
              {activePackage.features?.map((feat, idx) => (
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
                        placeholder="icon name"
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
              <Icon name="save" /> {saving ? "Saving All Packages..." : "Save All Industry Packages"}
            </button>

            {!isCreatingNew && (
              <button
                type="button"
                onClick={handleDeleteIndustry}
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
                <Icon name="delete" /> Delete Industry
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
