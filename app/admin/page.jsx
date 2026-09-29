"use client";

import React, { useState, useEffect } from "react";
import { isValidEmail, isValidMobileNumber } from "../../lib/validation";
import VisibilityManager from "./VisibilityManager";

function Icon({ name, className = "" }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

function getCountryFlag(countryCode) {
  if (!countryCode || countryCode === "UN" || countryCode.length !== 2) return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return "🌐";
  }
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "< 5s";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  return `${mins}m ${remSecs}s`;
}

function formatTimeAgo(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 15) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
  } catch (e) {
    return "—";
  }
}

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [pricingData, setPricingData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [portfolioFilter, setPortfolioFilter] = useState("All");
  const [newIndustryName, setNewIndustryName] = useState("");
  const [newIndustryDesc, setNewIndustryDesc] = useState("");
  const [showNewIndustryForm, setShowNewIndustryForm] = useState(false);
  const [blogsData, setBlogsData] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [stats, setStats] = useState({ dbStatus: "checking", counts: { pricing_plans: 0, portfolio_items: 0, blogs: 0, whatsapp_logs: 0 } });

  // WhatsApp Automation States
  const [whatsappData, setWhatsappData] = useState({ config: {}, logs: [], dbConnected: false });
  const [isTestSending, setIsTestSending] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testMessage, setTestMessage] = useState("");

  // Blog Editor State
  const [editingBlog, setEditingBlog] = useState(null); // null if not editing/creating
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "Marketing",
    published: false,
  });

  // Blog Import State
  const [importSourceType, setImportSourceType] = useState("devto");
  const [importFeedUrl, setImportFeedUrl] = useState("");
  const [importUsername, setImportUsername] = useState("");
  const [importCategory, setImportCategory] = useState("Marketing");
  const [isImporting, setIsImporting] = useState(false);

  // Pricing edit helpers
  const [selectedPriceCategory, setSelectedPriceCategory] = useState("facebookPlans");

  // Onboarding Clients State
  const [onboardingData, setOnboardingData] = useState([]);

  // Payment Reminders State
  const [remindersData, setRemindersData] = useState([]);

  // Job Applications State
  const [applicationsData, setApplicationsData] = useState([]);

  // Promo Codes State
  const [promosData, setPromosData] = useState([]);
  const [promoForm, setPromoForm] = useState({
    code: "",
    discount_percent: "",
    min_order_amount: "",
    description: "",
    is_active: true
  });

  // Website Visitors & Traffic State
  const [visitorsData, setVisitorsData] = useState({
    liveOnline: 0,
    summary: { totalPageviews: 0, uniqueVisitors: 0, totalSessions: 0, newVisitors: 0, avgDurationSeconds: 0 },
    charts: { trend: [], devices: [], browsers: [], topPages: [], topSources: [], topCountries: [] },
    logs: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
  });
  const [visitorRange, setVisitorRange] = useState("today");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorAutoRefresh, setVisitorAutoRefresh] = useState("30");
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);

  // Page & Section Visibility State
  const [visibilityCounts, setVisibilityCounts] = useState({ total: 0, visible: 0, hidden: 0, pages: 0, sections: 0, widgets: 0 });

  const loadVisibilityStats = async () => {
    try {
      const res = await fetch("/api/admin/visibility?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.counts) setVisibilityCounts(data.counts);
      }
    } catch (err) {
      console.warn("Failed to load visibility stats:", err);
    }
  };

  const loadPromoData = async () => {
    try {
      const res = await fetch("/api/admin/promo?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPromosData(data.promoCodes || []);
      }
    } catch (err) {
      console.warn("Failed to load promo codes:", err);
    }
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.discount_percent || promoForm.min_order_amount === "") {
      showToast("Please fill in discount percentage and minimum order amount.", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Promo code saved!");
        setPromoForm({ code: "", discount_percent: "", min_order_amount: "", description: "", is_active: true });
        loadPromoData();
      } else {
        showToast(data.error || "Failed to save promo code", "error");
      }
    } catch (err) {
      showToast("Network error saving promo code", "error");
    }
  };

  const handleTogglePromoStatus = async (id, currentStatus) => {
    try {
      const res = await fetch("/api/admin/promo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus })
      });
      if (res.ok) {
        showToast("Promo status updated!");
        loadPromoData();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      showToast("Network error updating status", "error");
    }
  };

  const handleDeletePromo = async (id) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      const res = await fetch(`/api/admin/promo?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Promo code deleted!");
        loadPromoData();
      } else {
        showToast("Failed to delete promo code", "error");
      }
    } catch (err) {
      showToast("Network error deleting promo code", "error");
    }
  };

  const loadVisitorsData = async (range = visitorRange, search = visitorSearch, page = visitorPage) => {
    try {
      setIsLoadingVisitors(true);
      const query = new URLSearchParams({
        range,
        search,
        page: page.toString(),
        limit: "50",
        t: Date.now().toString(),
      });
      const res = await fetch(`/api/admin/visitors?${query.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setVisitorsData(data);
      }
    } catch (err) {
      console.warn("Failed to load visitors data:", err);
    } finally {
      setIsLoadingVisitors(false);
    }
  };

  const handleDeleteVisitorLog = async (id) => {
    if (!confirm("Are you sure you want to delete this visitor record?")) return;
    try {
      const res = await fetch(`/api/admin/visitors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Visitor record deleted!");
        loadVisitorsData(visitorRange, visitorSearch, visitorPage);
        loadStats();
      } else {
        showToast("Failed to delete record", "error");
      }
    } catch (err) {
      showToast("Network error deleting record", "error");
    }
  };

  const handleClearVisitorLogs = async (action) => {
    const promptMsg = action === "clear_all"
      ? "Are you sure you want to PERMANENTLY CLEAR ALL visitor tracking logs? This cannot be undone."
      : "Clean visitor logs older than 60 days?";
    if (!confirm(promptMsg)) return;

    try {
      const res = await fetch(`/api/admin/visitors?action=${action}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "Visitor logs cleaned successfully!");
        setVisitorPage(1);
        loadVisitorsData(visitorRange, visitorSearch, 1);
        loadStats();
      } else {
        showToast("Failed to clean logs", "error");
      }
    } catch (err) {
      showToast("Network error cleaning logs", "error");
    }
  };

  const handleExportVisitorsCSV = () => {
    if (!visitorsData.logs || visitorsData.logs.length === 0) {
      showToast("No visitor logs to export", "error");
      return;
    }
    const headers = ["ID", "Timestamp", "IP Address", "Country", "City", "Device", "Browser", "OS", "Page Path", "Page Title", "Referrer", "UTM Source", "UTM Campaign", "Duration (sec)", "Is Online"];
    const csvRows = [headers.join(",")];
    for (const log of visitorsData.logs) {
      const row = [
        log.id,
        `"${log.created_at || ""}"`,
        `"${log.ip_address || ""}"`,
        `"${log.country || ""}"`,
        `"${log.city || ""}"`,
        `"${log.device_type || ""}"`,
        `"${log.browser || ""}"`,
        `"${log.os || ""}"`,
        `"${(log.page_path || "").replace(/"/g, '""')}"`,
        `"${(log.page_title || "").replace(/"/g, '""')}"`,
        `"${(log.referrer || "").replace(/"/g, '""')}"`,
        `"${(log.utm_source || "").replace(/"/g, '""')}"`,
        `"${(log.utm_campaign || "").replace(/"/g, '""')}"`,
        log.duration_seconds || 0,
        log.is_online ? "Yes" : "No"
      ];
      csvRows.push(row.join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aidigital_visitors_${visitorRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Visitor data exported to CSV!");
  };

  // Real-time auto-refresh interval for visitors tab
  useEffect(() => {
    if (activeTab !== "visitors" || visitorAutoRefresh === "off") return;
    const intervalSec = parseInt(visitorAutoRefresh, 10) || 30;
    const timer = setInterval(() => {
      loadVisitorsData(visitorRange, visitorSearch, visitorPage);
      loadStats();
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [activeTab, visitorAutoRefresh, visitorRange, visitorSearch, visitorPage]);

  // Auth checking on mount disabled to force manual login
  useEffect(() => {
    // Explicit email/password input is required to access the admin panel.
  }, []);


  const loadOnboardingData = async () => {
    try {
      const res = await fetch("/api/admin/onboarding?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOnboardingData(data);
      }
    } catch (err) {
      console.warn("Failed to load onboarding data:", err);
    }
  };

  const handleUpdateOnboardingStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/admin/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        showToast("Onboarding status updated!");
        loadOnboardingData();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      showToast("Network error updating status", "error");
    }
  };

  const handleDeleteOnboarding = async (id) => {
    if (!confirm("Are you sure you want to delete this onboarding record?")) return;
    try {
      const res = await fetch(`/api/admin/onboarding?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Onboarding record deleted successfully!");
        loadOnboardingData();
      } else {
        showToast("Failed to delete onboarding record", "error");
      }
    } catch (err) {
      showToast("Network error deleting onboarding record", "error");
    }
  };

  const loadRemindersData = async () => {
    try {
      const res = await fetch("/api/admin/reminders?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRemindersData(data);
      }
    } catch (err) {
      console.warn("Failed to load reminders:", err);
    }
  };

  const loadApplicationsData = async () => {
    try {
      const res = await fetch("/api/admin/applications?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setApplicationsData(data);
      }
    } catch (err) {
      console.warn("Failed to load applications:", err);
    }
  };

  const handleUpdateApplicationStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        showToast("Application status updated!");
        loadApplicationsData();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      showToast("Network error updating status", "error");
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!confirm("Are you sure you want to delete this application record?")) return;
    try {
      const res = await fetch(`/api/admin/applications?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Application deleted successfully!");
        loadApplicationsData();
      } else {
        showToast("Failed to delete application", "error");
      }
    } catch (err) {
      showToast("Network error deleting application", "error");
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!confirm("Are you sure you want to delete this payment reminder?")) return;
    try {
      const res = await fetch(`/api/admin/reminders?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Payment reminder deleted successfully!");
        loadRemindersData();
      } else {
        showToast("Failed to delete payment reminder", "error");
      }
    } catch (err) {
      showToast("Network error deleting payment reminder", "error");
    }
  };

  const loadWhatsAppInfo = async () => {

    try {
      const res = await fetch("/api/admin/whatsapp?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setWhatsappData(data);
      }
    } catch (err) {
      console.warn("Failed to load WhatsApp data:", err);
    }
  };

  const loadAllData = async () => {
    try {
      loadStats();
      const pricingRes = await fetch("/api/admin/pricing?t=" + Date.now(), { cache: "no-store" });
      if (pricingRes.ok) {
        const data = await pricingRes.json();
        setPricingData(data);
      }

      const portfolioRes = await fetch("/api/admin/portfolio?t=" + Date.now(), { cache: "no-store" });
      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setPortfolioData(data);
      }

      loadBlogs();
      loadWhatsAppInfo();
      loadOnboardingData();
      loadRemindersData();
      loadPromoData();
      loadVisitorsData();
      loadVisibilityStats();
    } catch (err) {
      showToast("Failed to load configuration data", "error");
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(prev => ({ ...prev, dbStatus: "offline" }));
      }
    } catch (err) {
      setStats(prev => ({ ...prev, dbStatus: "offline" }));
    }
  };

  const triggerBackup = async () => {
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || "Backup completed successfully!");

        // Trigger browser download of the backup payload
        if (data.backupData) {
          const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data.backupData, null, 2)
          )}`;
          const downloadAnchor = document.createElement("a");
          downloadAnchor.setAttribute("href", jsonString);
          downloadAnchor.setAttribute("download", `ai_digital_backup_${new Date().toISOString().slice(0, 10)}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        }
      } else {
        showToast("Backup failed", "error");
      }
    } catch (err) {
      showToast("Network connection error", "error");
    }
  };

  const loadBlogs = async () => {
    try {
      const res = await fetch("/api/blogs?admin=true");
      if (res.ok) {
        const data = await res.json();
        setBlogsData(data);
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!isValidEmail(email)) {
      setAuthError("Please enter a valid email address with a domain (e.g. admin@aidigital.com).");
      return;
    }
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (err) {
      setAuthError("Network connection error");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  };

  const showToast = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage("");
    }, 4000);
  };

  const handleSavePricing = async () => {
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingData),
      });
      if (res.ok) {
        showToast("Pricing plans updated successfully!");
      } else {
        showToast("Error saving pricing data", "error");
      }
    } catch (err) {
      showToast("Connection failed", "error");
    }
  };

  const handleSavePortfolio = async () => {
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolioData),
      });
      if (res.ok) {
        showToast("Portfolio data updated successfully!");
      } else {
        showToast("Error saving portfolio data", "error");
      }
    } catch (err) {
      showToast("Connection failed", "error");
    }
  };

  // Pricing operations
  const updatePricingField = (category, index, field, value) => {
    setPricingData(prev => ({
      ...prev,
      [category]: prev[category].map((plan, idx) =>
        idx === index ? { ...plan, [field]: value } : plan
      )
    }));
  };

  const updatePricingFeatures = (category, index, commaString) => {
    setPricingData(prev => {
      const updatedCategory = prev[category].map((plan, idx) => {
        if (idx !== index) return plan;

        let updatedFeatures;
        if (category === "websitePlans" || category === "creativePacks" || category === "aiVideoPlans") {
          const currentFeatures = plan.features || [];
          const texts = commaString.split(",").map(t => t.trim()).filter(Boolean);
          updatedFeatures = texts.map((text, i) => ({
            icon: currentFeatures[i]?.icon || "check_circle",
            text
          }));
        } else {
          updatedFeatures = commaString.split(",").map((f) => f.trim()).filter(Boolean);
        }

        return { ...plan, features: updatedFeatures };
      });
      return { ...prev, [category]: updatedCategory };
    });
  };

  const addPricingPlan = (category) => {
    let newPlan;
    if (category === "googlePlans") {
      newPlan = {
        platform: "Google Ads",
        badgeClass: "gg-badge",
        level: "New Google Plan",
        pillClass: "basic-pill",
        price: 4999,
        period: "/month",
        features: ["Google Ads", "Creative - 3", "AI Video - 1", "Reels/Shorts - 1", "Weekly Report"],
        buttonText: "Select Plan",
        isPopular: false,
        serviceName: "Performance Marketing",
        planParameter: "Google Ads - New Plan (₹4999/mo)"
      };
    } else if (category === "facebookPlans") {
      newPlan = {
        platform: "Meta Ads",
        badgeClass: "fb-badge",
        level: "New Meta Plan",
        pillClass: "basic-pill",
        price: 2499,
        period: "/month",
        features: ["Meta Ads", "Creative - 3", "AI Video - 1", "Reels/Shorts - 1", "Weekly Report"],
        buttonText: "Select Plan",
        isPopular: false,
        serviceName: "Performance Marketing",
        planParameter: "Meta Ads - New Plan (₹2499/mo)"
      };
    } else if (category === "combinePlans") {
      newPlan = {
        platform: "Meta + Google Ads",
        badgeClass: "multi-badge",
        level: "New Combine Plan",
        pillClass: "basic-pill",
        price: 6999,
        period: "/month",
        features: ["Meta Ads + Google Ads", "Creative - 7", "AI Video - 2", "Reels/Shorts - 5", "Weekly Report"],
        buttonText: "Select Plan",
        isPopular: false,
        serviceName: "Performance Marketing",
        planParameter: "Combine - New Plan (₹6999/mo)"
      };
    } else if (category === "websitePlans") {
      newPlan = {
        level: "New Website Plan",
        tagClass: "static-tag",
        price: 9999,
        period: "",
        features: [
          { icon: "language", text: "Domain Name" },
          { icon: "cloud_queue", text: "Hosting" }
        ],
        buttonText: "Select Plan",
        serviceName: "Web Development",
        planParameter: "New Website Plan (₹9999)"
      };
    } else if (category === "creativePacks") {
      newPlan = {
        level: "New Pack",
        tagClass: "static-tag",
        price: 999,
        period: "",
        features: [
          { icon: "image", text: "5 Creatives" }
        ],
        buttonText: "Select Plan",
        serviceName: "SEO Growth",
        planParameter: "Creative Packs - New Pack (5 for ₹999)",
        isHighlight: false
      };
    } else if (category === "aiVideoPlans") {
      newPlan = {
        level: "New Plan",
        tagClass: "static-tag",
        price: "3,000",
        period: "",
        features: [
          { icon: "video_library", text: "3 AI Videos" }
        ],
        buttonText: "Select Plan",
        serviceName: "AI Video Production",
        planParameter: "AI Video - New Plan (3 Videos for ₹3000)",
        isHighlight: false
      };
    }

    if (newPlan) {
      setPricingData(prev => ({
        ...prev,
        [category]: [...prev[category], newPlan]
      }));
    }
  };

  const deletePricingPlan = (category, index) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;
    setPricingData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, idx) => idx !== index)
    }));
  };

  // Portfolio Operations - Showcase Carousel
  const updateShowcaseField = (index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      showcaseProjects: prev.showcaseProjects.map((proj, idx) =>
        idx === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const updateShowcaseTags = (index, commaString) => {
    setPortfolioData(prev => ({
      ...prev,
      showcaseProjects: prev.showcaseProjects.map((proj, idx) =>
        idx === index ? { ...proj, tags: commaString.split(",").map((t) => t.trim()).filter(Boolean) } : proj
      )
    }));
  };

  const deleteShowcaseItem = (index) => {
    setPortfolioData(prev => ({
      ...prev,
      showcaseProjects: prev.showcaseProjects.filter((_, idx) => idx !== index)
    }));
  };

  const addShowcaseItem = () => {
    const newItem = {
      title: "New Showcase Project",
      category: "Website & SEO",
      industry: "General",
      metric: "+50%",
      metricLabel: "Conversion Rate",
      description: "Short description of the awesome dynamic project outcomes.",
      tags: ["Dynamic", "Interactive"],
      accent: "blue",
      icon: "language"
    };
    setPortfolioData(prev => ({
      ...prev,
      showcaseProjects: [...prev.showcaseProjects, newItem]
    }));
  };

  // Portfolio Operations - Featured Industries & General
  const updateFeaturedProject = (industryIndex, projectIndex, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      industries: prev.industries.map((ind, indIdx) => {
        if (indIdx !== industryIndex) return ind;
        return {
          ...ind,
          projects: ind.projects.map((proj, projIdx) =>
            projIdx === projectIndex ? { ...proj, [field]: value } : proj
          )
        };
      })
    }));
  };

  const deleteFeaturedProject = (industryIndex, projectIndex) => {
    setPortfolioData(prev => ({
      ...prev,
      industries: prev.industries.map((ind, indIdx) => {
        if (indIdx !== industryIndex) return ind;
        return {
          ...ind,
          projects: ind.projects.filter((_, projIdx) => projIdx !== projectIndex)
        };
      })
    }));
  };

  const addFeaturedProject = (industryIndex) => {
    const newProject = {
      title: "New Featured Project",
      type: "Website & SEO"
    };
    setPortfolioData(prev => ({
      ...prev,
      industries: prev.industries.map((ind, indIdx) => {
        if (indIdx !== industryIndex) return ind;
        return {
          ...ind,
          projects: [...ind.projects, newProject]
        };
      })
    }));
  };

  // Portfolio Operations - General / Other projects list
  const updateOtherProject = (index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      otherProjects: prev.otherProjects.map((proj, idx) =>
        idx === index ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const deleteOtherProject = (index) => {
    setPortfolioData(prev => ({
      ...prev,
      otherProjects: prev.otherProjects.filter((_, idx) => idx !== index)
    }));
  };

  const addOtherProject = () => {
    const newProject = {
      title: "New Marketing Campaign",
      type: "Campaigns"
    };
    setPortfolioData(prev => ({
      ...prev,
      otherProjects: [...prev.otherProjects, newProject]
    }));
  };

  // Portfolio Operations - Creative Content Grid
  const updateCreativeMedia = (groupIndex, mediaIndex, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      creativeGroups: prev.creativeGroups.map((group, grpIdx) => {
        if (grpIdx !== groupIndex) return group;
        return {
          ...group,
          images: group.images.map((img, imgIdx) =>
            imgIdx === mediaIndex ? { ...img, [field]: value } : img
          )
        };
      })
    }));
  };

  const deleteCreativeMedia = (groupIndex, mediaIndex) => {
    setPortfolioData(prev => ({
      ...prev,
      creativeGroups: prev.creativeGroups.map((group, grpIdx) => {
        if (grpIdx !== groupIndex) return group;
        return {
          ...group,
          images: group.images.filter((_, imgIdx) => imgIdx !== mediaIndex)
        };
      })
    }));
  };

  const addCreativeMedia = (groupIndex) => {
    const isWebsiteTab = portfolioFilter === "Website & SEO";
    const newMedia = {
      src: isWebsiteTab ? "https://" : "/creative_content/Creative1.jpeg",
      title: isWebsiteTab ? "New Website Showcase" : "New Creative Visual",
      description: isWebsiteTab ? "Describe this website showcase." : "Describe this media file display visual.",
      globalIndex: Date.now() % 1000,
      type: isWebsiteTab ? "website" : "image",
      category: isWebsiteTab ? "website" : undefined
    };
    setPortfolioData(prev => ({
      ...prev,
      creativeGroups: prev.creativeGroups.map((group, grpIdx) => {
        if (grpIdx !== groupIndex) return group;
        return {
          ...group,
          images: [...group.images, newMedia]
        };
      })
    }));
  };

  const handleCreateIndustry = (e) => {
    e.preventDefault();
    if (!newIndustryName.trim()) {
      alert("Please enter an industry name.");
      return;
    }

    // Check if industry already exists
    const exists = portfolioData.industries.some(
      (ind) => ind.name.toLowerCase() === newIndustryName.trim().toLowerCase()
    );
    if (exists) {
      alert("This industry category already exists.");
      return;
    }

    const newInd = {
      name: newIndustryName.trim(),
      description: newIndustryDesc.trim(),
      projects: []
    };

    const newGrp = {
      industry: newIndustryName.trim(),
      description: newIndustryDesc.trim(),
      images: []
    };

    setPortfolioData((prev) => ({
      ...prev,
      industries: [...prev.industries, newInd],
      creativeGroups: [...prev.creativeGroups, newGrp]
    }));

    setNewIndustryName("");
    setNewIndustryDesc("");
    setShowNewIndustryForm(false);
    showToast(`Industry "${newInd.name}" category created! Remember to Save Changes.`);
  };

  const handleDeleteIndustry = (name) => {
    if (!confirm(`Are you sure you want to delete the entire "${name}" industry category, including all its projects and media files?`)) return;

    setPortfolioData((prev) => ({
      ...prev,
      industries: prev.industries.filter((ind) => ind.name !== name),
      creativeGroups: prev.creativeGroups.filter((grp) => grp.industry !== name)
    }));

    showToast(`Industry "${name}" category deleted! Remember to Save Changes.`);
  };

  const handleFileUpload = async (file, groupIndex, mediaIndex) => {
    const formData = new FormData();
    formData.append("file", file);

    showToast("Uploading file, please wait...", "info");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update the source field with uploaded URL
        updateCreativeMedia(groupIndex, mediaIndex, "src", data.url);

        // Only auto-set type if it's NOT already set to "website"
        // (website cards keep their type so uploaded image shows in website section)
        setPortfolioData(prev => {
          const currentType = prev.creativeGroups[groupIndex]?.images[mediaIndex]?.type;
          if (currentType !== "website") {
            const fileType = file.type.startsWith("video/") ? "video" : "image";
            const updated = { ...prev };
            updated.creativeGroups = updated.creativeGroups.map((grp, gi) => {
              if (gi !== groupIndex) return grp;
              return {
                ...grp,
                images: grp.images.map((img, ii) => {
                  if (ii !== mediaIndex) return img;
                  return { ...img, type: fileType };
                })
              };
            });
            return updated;
          }
          return prev;
        });

        showToast("Image uploaded successfully! Remember to Save Changes.", "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch (err) {
      showToast("Network error uploading file", "error");
      console.error(err);
    }
  };

  // Blog Operations
  const handleCreateBlogClick = () => {
    setEditingBlog("new");
    setBlogForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "Marketing",
      published: false,
    });
  };

  const handleEditBlogClick = (blog) => {
    setEditingBlog(blog.id);
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage || "",
      category: blog.category,
      published: blog.published,
    });
  };

  const handleBlogTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setBlogForm({ ...blogForm, title, slug });
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    try {
      const isNew = editingBlog === "new";
      const res = await fetch("/api/blogs", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? blogForm : { id: editingBlog, ...blogForm }),
      });

      if (res.ok) {
        showToast(isNew ? "Blog post created!" : "Blog post updated!");
        setEditingBlog(null);
        loadBlogs();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Failed to save blog post", "error");
      }
    } catch (err) {
      showToast("Network error saving blog", "error");
    }
  };

  const handleImportBlogs = async (e) => {
    e.preventDefault();
    setIsImporting(true);
    try {
      const res = await fetch("/api/blogs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: importSourceType,
          feedUrl: importFeedUrl,
          username: importUsername,
          defaultCategory: importCategory,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Import completed successfully!");
        setImportFeedUrl("");
        setImportUsername("");
        loadBlogs();
      } else {
        showToast(data.error || "Failed to import blogs.", "error");
      }
    } catch (err) {
      showToast("Network error during import.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blogs?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Blog post deleted successfully.");
        loadBlogs();
      } else {
        showToast("Error deleting blog post.", "error");
      }
    } catch (err) {
      showToast("Network error deleting blog", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        {/* Glow Spheres for Premium Aesthetics */}
        <div style={styles.glowSphere1}></div>
        <div style={styles.glowSphere2}></div>

        <div style={styles.loginCard}>
          <div style={styles.logoRow}>
            <img src="/Logo.ai.png" alt="AI Digital Logo" style={{ height: "45px", width: "auto", objectFit: "contain" }} />
          </div>
          <p style={styles.loginSubtitle}>Sign in to manage your premium assets</p>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Admin Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aidigital.com"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>
            {authError && <div style={styles.errorAlert}>{authError}</div>}
            <button type="submit" style={styles.loginButton}>Unlock Panel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.adminWrapper}>
      {/* Toast Notification */}
      {statusMessage && (
        <div style={{ ...styles.toast, backgroundColor: statusType === "success" ? "#10B981" : "#EF4444" }}>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/Logo.ai.png" alt="AI Digital Logo" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
          <div style={{ marginLeft: "12px", borderLeft: "1px solid rgba(255, 255, 255, 0.15)", paddingLeft: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Panel</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-grid" style={styles.mainGrid}>
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar" style={styles.sidebar}>
          <button
            onClick={() => { setActiveTab("overview"); setEditingBlog(null); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "overview" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="analytics" /> Overview Dashboard
          </button>

          <button
            onClick={() => { setActiveTab("visitors"); setEditingBlog(null); loadVisitorsData(); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "visitors" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="group" /> Live Visitors & Traffic
            {stats.counts?.live_online > 0 ? (
              <span style={{
                marginLeft: "auto",
                backgroundColor: "#10B981",
                color: "#000",
                fontSize: "10px",
                fontWeight: "800",
                padding: "2px 7px",
                borderRadius: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#000", display: "inline-block" }}></span>
                {stats.counts.live_online} LIVE
              </span>
            ) : (
              <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "11px" }}>
                {stats.counts?.visitors_today || 0} today
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("visibility"); setEditingBlog(null); loadVisibilityStats(); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "visibility" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="tune" /> Page & Section Controls
            {visibilityCounts.hidden > 0 ? (
              <span
                style={{
                  marginLeft: "auto",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "800",
                  padding: "2px 7px",
                  borderRadius: "10px",
                }}
              >
                {visibilityCounts.hidden} HIDDEN
              </span>
            ) : (
              <span style={{ marginLeft: "auto", color: "#10B981", fontSize: "11px", fontWeight: "700" }}>
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("portfolio"); setEditingBlog(null); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "portfolio" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="dashboard" /> Portfolio Showcase
          </button>
          <button
            onClick={() => { setActiveTab("blogs"); setEditingBlog(null); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "blogs" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="article" /> Blogs Editor
          </button>
          <button
            onClick={() => { setActiveTab("whatsapp"); setEditingBlog(null); loadWhatsAppInfo(); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "whatsapp" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="forum" /> WhatsApp Alerts
          </button>
          <button
            onClick={() => { setActiveTab("onboarding"); setEditingBlog(null); loadOnboardingData(); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "onboarding" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="assignment_ind" /> Onboarding Clients
          </button>
          <button
            onClick={() => { setActiveTab("reminders"); setEditingBlog(null); loadRemindersData(); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "reminders" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="alarm" /> Payment Reminders
          </button>
          <button
            onClick={() => { setActiveTab("promos"); setEditingBlog(null); loadPromoData(); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "promos" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="sell" /> Promo Codes
          </button>
          <button
            onClick={() => { setActiveTab("applications"); setEditingBlog(null); loadApplicationsData(); }}
            style={{ ...styles.sidebarBtn, ...(activeTab === "applications" ? styles.sidebarBtnActive : {}) }}
          >
            <Icon name="work" /> Job Applications
          </button>
        </aside>

        {/* Workspace Content */}
        <section className="admin-content" style={styles.content}>
          {activeTab === "overview" && (
            <div>
              <div style={styles.contentHeader}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Overview</h2>
                  <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>System status and metrics overview</p>
                </div>
                <button onClick={loadStats} style={styles.refreshBtn}>
                  <Icon name="refresh" /> Refresh Status
                </button>
              </div>

              {/* Status Section */}
              <div className="admin-overview-grid" style={styles.overviewGrid}>
                {/* Database Status Card */}
                <div style={styles.statusCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>Database Connection</h3>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: stats.dbStatus === "online" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: stats.dbStatus === "online" ? "#10B981" : "#EF4444",
                      border: `1px solid ${stats.dbStatus === "online" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                    }}>
                      {stats.dbStatus === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p style={styles.cardDesc}>
                    Status of your connection to the local XAMPP MySQL database. If it's offline, make sure Apache and MySQL are running in your XAMPP Control Panel.
                  </p>
                  <div style={styles.databaseActions}>
                    <button
                      onClick={triggerBackup}
                      disabled={stats.dbStatus !== "online"}
                      style={{
                        ...styles.actionBtn,
                        opacity: stats.dbStatus === "online" ? 1 : 0.5,
                        cursor: stats.dbStatus === "online" ? "pointer" : "not-allowed"
                      }}
                    >
                      <Icon name="backup" /> Backup Database to JSON
                    </button>
                  </div>
                </div>

                {/* Stats Summary Cards */}
                <div style={styles.statsSummaryGrid}>
                  <div 
                    style={{ ...styles.miniCard, cursor: "pointer", border: "1px solid rgba(16, 185, 129, 0.3)", backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                    onClick={() => { setActiveTab("visitors"); setEditingBlog(null); loadVisitorsData(); }}
                    title="Click to view full Live Visitors & Traffic analytics"
                  >
                    <div style={styles.miniCardHeader}>
                      <Icon name="group" style={{ color: "#10B981" }} />
                      <h4 style={{ margin: 0, color: "#10B981" }}>Website Visitors</h4>
                      {stats.counts?.live_online > 0 && (
                        <span style={{
                          marginLeft: "auto",
                          backgroundColor: "#10B981",
                          color: "#000",
                          fontSize: "10px",
                          fontWeight: "800",
                          padding: "2px 7px",
                          borderRadius: "10px"
                        }}>
                          {stats.counts.live_online} ONLINE NOW
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <p style={styles.statNumber}>{stats.counts?.visitors_today || 0}</p>
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>today ({stats.counts?.total_visitors || 0} all-time)</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#10B981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      View Live Traffic Analytics →
                    </span>
                  </div>

                  <div 
                    style={{ ...styles.miniCard, cursor: "pointer", border: "1px solid rgba(59, 130, 246, 0.3)", backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                    onClick={() => { setActiveTab("visibility"); setEditingBlog(null); }}
                    title="Click to manage Page & Section Visibility"
                  >
                    <div style={styles.miniCardHeader}>
                      <Icon name="tune" style={{ color: "#3B82F6" }} />
                      <h4 style={{ margin: 0, color: "#60A5FA" }}>Site Visibility</h4>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <p style={styles.statNumber}>{visibilityCounts.visible}</p>
                      <span style={{ color: "#94a3b8", fontSize: "13px" }}>/ {visibilityCounts.total} active</span>
                    </div>
                    <span style={{ fontSize: "12px", color: visibilityCounts.hidden > 0 ? "#ef4444" : "#10B981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      {visibilityCounts.hidden > 0 ? `⚠️ ${visibilityCounts.hidden} hidden element(s)` : "✓ All elements live"} →
                    </span>
                  </div>

                  <div style={styles.miniCard}>
                    <div style={styles.miniCardHeader}>
                      <Icon name="payments" style={{ color: "#FD7E14" }} />
                      <h4 style={{ margin: 0 }}>Pricing Plans</h4>
                    </div>
                    <p style={styles.statNumber}>{stats.counts.pricing_plans}</p>
                    <span style={styles.statLabel}>Active packages</span>
                  </div>

                  <div style={styles.miniCard}>
                    <div style={styles.miniCardHeader}>
                      <Icon name="dashboard" style={{ color: "#3B82F6" }} />
                      <h4 style={{ margin: 0 }}>Portfolio Items</h4>
                    </div>
                    <p style={styles.statNumber}>{stats.counts.portfolio_items}</p>
                    <span style={styles.statLabel}>Showcase & creatives</span>
                  </div>

                  <div style={styles.miniCard}>
                    <div style={styles.miniCardHeader}>
                      <Icon name="article" style={{ color: "#10B981" }} />
                      <h4 style={{ margin: 0 }}>Blogs</h4>
                    </div>
                    <p style={styles.statNumber}>{stats.counts.blogs}</p>
                    <span style={styles.statLabel}>Published posts</span>
                  </div>

                  <div style={styles.miniCard}>
                    <div style={styles.miniCardHeader}>
                      <Icon name="forum" style={{ color: "#ec4899" }} />
                      <h4 style={{ margin: 0 }}>WhatsApp Logs</h4>
                    </div>
                    <p style={styles.statNumber}>{stats.counts.whatsapp_logs || 0}</p>
                    <span style={styles.statLabel}>Dispatched alerts</span>
                  </div>

                  <div style={styles.miniCard}>
                    <div style={styles.miniCardHeader}>
                      <Icon name="alarm" style={{ color: "#e56030" }} />
                      <h4 style={{ margin: 0 }}>Payment Reminders</h4>
                    </div>
                    <p style={styles.statNumber}>{stats.counts.payment_reminders || 0}</p>
                    <span style={styles.statLabel}>Scheduled reminders</span>
                  </div>
                </div>
              </div>
            </div>

          )}
          {activeTab === "pricing" && pricingData && (
            <div>
              <div style={styles.contentHeader}>
                <h2>Manage Pricing Packages</h2>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => addPricingPlan(selectedPriceCategory)} style={styles.addBtn}>
                    <Icon name="add" /> Add Plan
                  </button>
                  <button onClick={handleSavePricing} style={styles.saveBtn}>
                    <Icon name="save" /> Save Changes
                  </button>
                </div>
              </div>

              <div style={styles.infoBanner}>
                <Icon name="info" />
                <span>Any edits, additions, or deletions will only be permanently saved when you click the <strong>Save Changes</strong> button at the top right.</span>
              </div>

              {/* Selector tabs for price categories */}
              <div style={styles.tabRow}>
                <button
                  onClick={() => setSelectedPriceCategory("facebookPlans")}
                  style={{ ...styles.tabSelectBtn, ...(selectedPriceCategory === "facebookPlans" ? styles.tabSelectBtnActive : {}) }}
                >
                  Meta Ads Plans
                </button>
                <button
                  onClick={() => setSelectedPriceCategory("googlePlans")}
                  style={{ ...styles.tabSelectBtn, ...(selectedPriceCategory === "googlePlans" ? styles.tabSelectBtnActive : {}) }}
                >
                  Google Plans
                </button>
                <button
                  onClick={() => setSelectedPriceCategory("combinePlans")}
                  style={{ ...styles.tabSelectBtn, ...(selectedPriceCategory === "combinePlans" ? styles.tabSelectBtnActive : {}) }}
                >
                  Combine Plans
                </button>
                <button
                  onClick={() => setSelectedPriceCategory("websitePlans")}
                  style={{ ...styles.tabSelectBtn, ...(selectedPriceCategory === "websitePlans" ? styles.tabSelectBtnActive : {}) }}
                >
                  Websites
                </button>
                <button
                  onClick={() => setSelectedPriceCategory("creativePacks")}
                  style={{ ...styles.tabSelectBtn, ...(selectedPriceCategory === "creativePacks" ? styles.tabSelectBtnActive : {}) }}
                >
                  Creative Packs
                </button>
                <button
                  onClick={() => setSelectedPriceCategory("aiVideoPlans")}
                  style={{ ...styles.tabSelectBtn, ...(selectedPriceCategory === "aiVideoPlans" ? styles.tabSelectBtnActive : {}) }}
                >
                  AI Video
                </button>
              </div>

              {/* Edit forms list */}
              <div style={styles.formGrid}>
                {pricingData[selectedPriceCategory].map((plan, index) => (
                  <div key={index} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3>{plan.level || plan.platform || "Plan Level"}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <label style={styles.switchLabel}>
                          <input
                            type="checkbox"
                            checked={plan.isPopular || false}
                            onChange={(e) => updatePricingField(selectedPriceCategory, index, "isPopular", e.target.checked)}
                          />{" "}
                          Popular/Featured
                        </label>
                        <button onClick={() => deletePricingPlan(selectedPriceCategory, index)} style={styles.deleteBtnIcon}>
                          <Icon name="delete" />
                        </button>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Plan Title / Level</label>
                      <input
                        type="text"
                        value={plan.level || ""}
                        onChange={(e) => updatePricingField(selectedPriceCategory, index, "level", e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    {plan.platform !== undefined && (
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Platform (e.g. Meta Ads)</label>
                        <input
                          type="text"
                          value={plan.platform || ""}
                          onChange={(e) => updatePricingField(selectedPriceCategory, index, "platform", e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    )}

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Price (INR ₹)</label>
                      <input
                        type="text"
                        value={plan.price}
                        onChange={(e) => updatePricingField(selectedPriceCategory, index, "price", e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Billing Period / Cycle (e.g. /month, /3 months, /6 months)</label>
                      <input
                        type="text"
                        value={plan.period || ""}
                        onChange={(e) => updatePricingField(selectedPriceCategory, index, "period", e.target.value)}
                        placeholder="Leave blank for one-time payments"
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Features (Comma-separated)</label>
                      <textarea
                        rows={4}
                        value={
                          ["googlePlans", "facebookPlans", "combinePlans"].includes(selectedPriceCategory)
                            ? plan.features.join(", ")
                            : plan.features.map(f => f.text).join(", ")
                        }
                        onChange={(e) => updatePricingFeatures(selectedPriceCategory, index, e.target.value)}
                        style={styles.textarea}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "portfolio" && portfolioData && (() => {
            const getMediaTypeAdmin = (type, src, category) => {
              if (category === "image" || category === "video" || category === "reel" || category === "website" || category === "campaign") return category;
              let resolvedType = type;
              if (!resolvedType && src) {
                const url = src.toLowerCase();
                if (url.includes("youtube.com") || url.includes("youtu.be")) resolvedType = "youtube";
                else if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) resolvedType = "instagram";
                else if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || url.endsWith(".mov")) resolvedType = "video";
                else if (url.startsWith("http")) resolvedType = "website";
                else if (url.includes("/campaign/")) resolvedType = "campaign";
                else resolvedType = "image";
              }
              if (resolvedType === "youtube" || resolvedType === "iframe" || resolvedType === "video") return "video";
              if (resolvedType === "instagram" || resolvedType === "reel") return "reel";
              if (resolvedType === "website") return "website";
              if (resolvedType === "campaign") return "campaign";
              return "image";
            };

            const hasVisibleShowcase = portfolioData.showcaseProjects.some(
              proj => portfolioFilter === "All" || proj.category === portfolioFilter
            );

            return (
              <div>
                <div style={styles.contentHeader}>
                  <h2>Manage Portfolio Showcase</h2>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={() => setShowNewIndustryForm(!showNewIndustryForm)} style={styles.addBtn}>
                      <Icon name="add" /> {showNewIndustryForm ? "Cancel New Category" : "Create New Industry Category"}
                    </button>
                    <button onClick={handleSavePortfolio} style={styles.saveBtn}>
                      <Icon name="save" /> Save Changes
                    </button>
                  </div>
                </div>

                {showNewIndustryForm && (
                  <div style={{ ...styles.card, marginBottom: "24px", border: "1px dashed #3B82F6", backgroundColor: "rgba(59, 130, 246, 0.02)" }}>
                    <div style={styles.cardHeader}>
                      <h3 style={{ margin: 0, color: "#3B82F6", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Icon name="business_center" /> Create New Industry Category
                      </h3>
                    </div>
                    <form onSubmit={handleCreateIndustry} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Industry/Category Name</label>
                        <input
                          type="text"
                          value={newIndustryName}
                          onChange={(e) => setNewIndustryName(e.target.value)}
                          placeholder="e.g. Construction, Real Estate, Finance, SaaS"
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Category Description</label>
                        <textarea
                          rows={2}
                          value={newIndustryDesc}
                          onChange={(e) => setNewIndustryDesc(e.target.value)}
                          placeholder="e.g. All-in-one Construction ERP & Project Management software showcase, web portal, and local SEO campaign."
                          style={styles.textarea}
                          required
                        />
                      </div>
                      <button type="submit" style={{ ...styles.saveBtn, backgroundColor: "#3B82F6", alignSelf: "flex-start" }}>
                        Create Category
                      </button>
                    </form>
                  </div>
                )}

                <div style={styles.tabRow}>
                  {["All", "Website & SEO", "Campaigns", "AI Videos", "Creative Content", "Reels"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setPortfolioFilter(f)}
                      style={{
                        ...styles.tabSelectBtn,
                        ...(portfolioFilter === f ? styles.tabSelectBtnActive : {})
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div style={styles.infoBanner}>
                  <Icon name="info" />
                  <span>Any edits, additions, or deletions will only be permanently saved when you click the <strong>Save Changes</strong> button at the top right.</span>
                </div>

                {/* 1. SHOWCASE CAROUSEL ITEMS */}
                {hasVisibleShowcase && (
                  <>
                    <div style={styles.portfolioSectionHeader}>
                      <h3>Header Showcase Carousel</h3>
                      <button onClick={addShowcaseItem} style={styles.addBtn}>
                        <Icon name="add" /> Add Showcase Item
                      </button>
                    </div>

                    <div style={styles.formGrid}>
                      {portfolioData.showcaseProjects.map((proj, idx) => {
                        if (portfolioFilter !== "All" && proj.category !== portfolioFilter) return null;
                        return (
                          <div key={idx} style={styles.card}>
                            <div style={styles.cardHeader}>
                              <h4>{proj.title || "Untitled"}</h4>
                              <button onClick={() => deleteShowcaseItem(idx)} style={styles.deleteBtn}>
                                <Icon name="delete" /> Delete
                              </button>
                            </div>

                            <div className="admin-input-row" style={styles.inputRow}>
                              <div style={styles.inputGroupFluid}>
                                <label style={styles.label}>Project Title</label>
                                <input
                                  type="text"
                                  value={proj.title}
                                  onChange={(e) => updateShowcaseField(idx, "title", e.target.value)}
                                  style={styles.input}
                                />
                              </div>
                              <div style={styles.inputGroupFluid}>
                                <label style={styles.label}>Category</label>
                                <input
                                  type="text"
                                  value={proj.category}
                                  onChange={(e) => updateShowcaseField(idx, "category", e.target.value)}
                                  style={styles.input}
                                />
                              </div>
                            </div>

                            <div className="admin-input-row" style={styles.inputRow}>
                              <div style={styles.inputGroupFluid}>
                                <label style={styles.label}>Industry</label>
                                <input
                                  type="text"
                                  value={proj.industry}
                                  onChange={(e) => updateShowcaseField(idx, "industry", e.target.value)}
                                  style={styles.input}
                                />
                              </div>
                              <div style={styles.inputGroupFluid}>
                                <label style={styles.label}>Metric (e.g. +142%)</label>
                                <input
                                  type="text"
                                  value={proj.metric}
                                  onChange={(e) => updateShowcaseField(idx, "metric", e.target.value)}
                                  style={styles.input}
                                />
                              </div>
                              <div style={styles.inputGroupFluid}>
                                <label style={styles.label}>Metric Label</label>
                                <input
                                  type="text"
                                  value={proj.metricLabel}
                                  onChange={(e) => updateShowcaseField(idx, "metricLabel", e.target.value)}
                                  style={styles.input}
                                />
                              </div>
                            </div>

                            <div style={styles.inputGroup}>
                              <label style={styles.label}>Description</label>
                              <textarea
                                value={proj.description}
                                onChange={(e) => updateShowcaseField(idx, "description", e.target.value)}
                                style={styles.textarea}
                              />
                            </div>

                            <div style={styles.inputGroup}>
                              <label style={styles.label}>Tags (Comma-separated)</label>
                              <input
                                type="text"
                                value={proj.tags.join(", ")}
                                onChange={(e) => updateShowcaseTags(idx, e.target.value)}
                                style={styles.input}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* 2. FEATURED PROJECTS BY INDUSTRY */}
                {portfolioData.industries.some(ind => ind.projects.some(p => portfolioFilter === "All" || p.type === portfolioFilter)) && (
                  <>
                    <div style={styles.portfolioSectionHeader}>
                      <h3>Featured Work by Industry</h3>
                    </div>

                    {portfolioData.industries.map((ind, indIdx) => {
                      const hasVisibleProj = ind.projects.some(p => portfolioFilter === "All" || p.type === portfolioFilter);
                      if (!hasVisibleProj) return null;
                      return (
                        <div key={indIdx} style={styles.industryBox}>
                          <div style={styles.industryTitleRow}>
                            <h4>{ind.name}</h4>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleDeleteIndustry(ind.name)} style={{ ...styles.deleteBtn, padding: "4px 8px", fontSize: "12px" }}>
                                <Icon name="delete" /> Delete Industry Box
                              </button>
                              <button onClick={() => addFeaturedProject(indIdx)} style={styles.addBtnSmall}>
                                <Icon name="add" /> Add Project
                              </button>
                            </div>
                          </div>
                          <div style={styles.projectListGrid}>
                            {ind.projects.map((proj, projIdx) => {
                              if (portfolioFilter !== "All" && proj.type !== portfolioFilter) return null;
                              return (
                                <div key={projIdx} style={{ ...styles.projectItemCard, flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <label style={{ fontSize: "10px", color: "#cbd5e1", fontWeight: "600", letterSpacing: "0.03em" }}>PROJECT TITLE</label>
                                    <input
                                      type="text"
                                      value={proj.title}
                                      onChange={(e) => updateFeaturedProject(indIdx, projIdx, "title", e.target.value)}
                                      style={styles.inputSmall}
                                      placeholder="Enter project name..."
                                    />
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                                      <label style={{ fontSize: "10px", color: "#cbd5e1", fontWeight: "600", letterSpacing: "0.03em" }}>CATEGORY</label>
                                      <select
                                        value={proj.type}
                                        onChange={(e) => updateFeaturedProject(indIdx, projIdx, "type", e.target.value)}
                                        style={styles.selectSmall}
                                      >
                                        <option value="Website & SEO">Website & SEO</option>
                                        <option value="Campaigns">Campaigns</option>
                                        <option value="AI Videos">AI Videos</option>
                                        <option value="Creative Content">Creative Content</option>
                                        <option value="Reels">Reels</option>
                                      </select>
                                    </div>
                                    <button
                                      onClick={() => deleteFeaturedProject(indIdx, projIdx)}
                                      style={{ ...styles.deleteBtnIcon, marginTop: "14px", padding: "6px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "4px" }}
                                      title="Delete project"
                                    >
                                      <Icon name="delete" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 3. GENERAL / OTHER PROJECTS */}
                {portfolioData.otherProjects.some(proj => portfolioFilter === "All" || proj.type === portfolioFilter) && (
                  <>
                    <div style={styles.portfolioSectionHeader}>
                      <h3>General Other Projects</h3>
                      <button onClick={addOtherProject} style={styles.addBtnSmall}>
                        <Icon name="add" /> Add Project
                      </button>
                    </div>

                    <div style={styles.projectListGrid}>
                      {portfolioData.otherProjects.map((proj, idx) => {
                        if (portfolioFilter !== "All" && proj.type !== portfolioFilter) return null;
                        return (
                          <div key={idx} style={{ ...styles.projectItemCard, flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "10px", color: "#cbd5e1", fontWeight: "600", letterSpacing: "0.03em" }}>PROJECT TITLE</label>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => updateOtherProject(idx, "title", e.target.value)}
                                style={styles.inputSmall}
                                placeholder="Enter project name..."
                              />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                                <label style={{ fontSize: "10px", color: "#cbd5e1", fontWeight: "600", letterSpacing: "0.03em" }}>CATEGORY</label>
                                <select
                                  value={proj.type}
                                  onChange={(e) => updateOtherProject(idx, "type", e.target.value)}
                                  style={styles.selectSmall}
                                >
                                  <option value="Website & SEO">Website & SEO</option>
                                  <option value="Campaigns">Campaigns</option>
                                  <option value="AI Videos">AI Videos</option>
                                  <option value="Creative Content">Creative Content</option>
                                  <option value="Reels">Reels</option>
                                </select>
                              </div>
                              <button
                                onClick={() => deleteOtherProject(idx)}
                                style={{ ...styles.deleteBtnIcon, marginTop: "14px", padding: "6px", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "4px" }}
                                title="Delete project"
                              >
                                <Icon name="delete" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* 4. CREATIVE MEDIA GRID GROUPS */}
                {(() => {
                  const isCreativeFilterActive = portfolioFilter === "All" || portfolioFilter === "Creative Content" || portfolioFilter === "AI Videos" || portfolioFilter === "Reels" || portfolioFilter === "Website & SEO" || portfolioFilter === "Campaigns";
                  if (!isCreativeFilterActive) return null;

                  const hasVisibleCreative = portfolioData.creativeGroups.some(group =>
                    group.images.some(img => {
                      const type = getMediaTypeAdmin(img.type, img.src, img.category);
                      if (portfolioFilter === "All") return true;
                      if (portfolioFilter === "Creative Content") return type === "image";
                      if (portfolioFilter === "AI Videos") return type === "video";
                      if (portfolioFilter === "Reels") return type === "reel";
                      if (portfolioFilter === "Website & SEO") return type === "website";
                      if (portfolioFilter === "Campaigns") return type === "campaign";
                      return false;
                    })
                  );

                  if (!hasVisibleCreative) return null;

                  return (
                    <>
                      <div style={styles.portfolioSectionHeader}>
                        <h3>Creative Grid Items</h3>
                      </div>

                      {portfolioData.creativeGroups.map((group, grpIdx) => {
                        const hasVisibleImages = group.images.some(img => {
                          const type = getMediaTypeAdmin(img.type, img.src, img.category);
                          if (portfolioFilter === "All") return true;
                          if (portfolioFilter === "Creative Content") return type === "image";
                          if (portfolioFilter === "AI Videos") return type === "video";
                          if (portfolioFilter === "Reels") return type === "reel";
                          if (portfolioFilter === "Website & SEO") return type === "website";
                          if (portfolioFilter === "Campaigns") return type === "campaign";
                          return false;
                        });

                        if (!hasVisibleImages) return null;

                        return (
                          <div key={grpIdx} style={styles.industryBox}>
                            <div style={styles.industryTitleRow}>
                              <h4>{group.industry} Media</h4>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleDeleteIndustry(group.industry)} style={{ ...styles.deleteBtn, padding: "4px 8px", fontSize: "12px" }}>
                                  <Icon name="delete" /> Delete Industry Box
                                </button>
                                <button onClick={() => addCreativeMedia(grpIdx)} style={styles.addBtnSmall}>
                                  <Icon name="add" /> Add Media File
                                </button>
                              </div>
                            </div>

                            <div style={styles.mediaGrid}>
                              {group.images.map((img, imgIdx) => {
                                const type = getMediaTypeAdmin(img.type, img.src, img.category);
                                let isVisible = true;
                                if (portfolioFilter === "Creative Content" && type !== "image") isVisible = false;
                                if (portfolioFilter === "AI Videos" && type !== "video") isVisible = false;
                                if (portfolioFilter === "Reels" && type !== "reel") isVisible = false;
                                if (portfolioFilter === "Website & SEO" && type !== "website") isVisible = false;
                                if (portfolioFilter === "Campaigns" && type !== "campaign") isVisible = false;

                                if (!isVisible) return null;

                                return (
                                  <div key={imgIdx} style={styles.mediaCard}>
                                    <div style={styles.mediaCardTop}>
                                      <span style={styles.mediaTypeLabel}>{img.type}</span>
                                      <button onClick={() => deleteCreativeMedia(grpIdx, imgIdx)} style={styles.deleteBtnIcon}>
                                        <Icon name="delete" />
                                      </button>
                                    </div>

                                    <div style={styles.inputGroupSmall}>
                                      <label style={styles.labelSmall}>Title</label>
                                      <input
                                        type="text"
                                        value={img.title}
                                        onChange={(e) => updateCreativeMedia(grpIdx, imgIdx, "title", e.target.value)}
                                        style={styles.inputSmall}
                                      />
                                    </div>

                                    <div style={styles.inputGroupSmall}>
                                      <label style={styles.labelSmall}>Media path / URL</label>
                                      <input
                                        type="text"
                                        value={img.src}
                                        onChange={(e) => updateCreativeMedia(grpIdx, imgIdx, "src", e.target.value)}
                                        style={styles.inputSmall}
                                        placeholder="e.g. /creative_content/image.jpg or https://..."
                                      />
                                    </div>

                                    <div style={styles.inputGroupSmall}>
                                      <label style={styles.labelSmall}>Media Type</label>
                                      <select
                                        value={img.type}
                                        onChange={(e) => updateCreativeMedia(grpIdx, imgIdx, "type", e.target.value)}
                                        style={styles.selectSmall}
                                      >
                                        <option value="image">Image</option>
                                        <option value="campaign">Campaign Image</option>
                                        <option value="video">Direct MP4 Video</option>
                                        <option value="reel">Direct MP4 Reel</option>
                                        <option value="youtube">YouTube (Video/Shorts)</option>
                                        <option value="instagram">Instagram Reel</option>
                                        <option value="iframe">Other Iframe Embed</option>
                                        <option value="website">Website Link (Auto Screenshot)</option>
                                      </select>
                                    </div>

                                    {img.type === "website" && (
                                      <div style={styles.inputGroupSmall}>
                                        <label style={styles.labelSmall}>Drop Website Image Here</label>
                                        <div
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.borderColor = "#e56030";
                                            e.currentTarget.style.backgroundColor = "rgba(229, 96, 48, 0.05)";
                                          }}
                                          onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.borderColor = "rgba(229, 96, 48, 0.3)";
                                            e.currentTarget.style.backgroundColor = "transparent";
                                          }}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.style.borderColor = "rgba(229, 96, 48, 0.3)";
                                            e.currentTarget.style.backgroundColor = "transparent";
                                            const file = e.dataTransfer.files[0];
                                            if (file && file.type.startsWith("image/")) {
                                              handleFileUpload(file, grpIdx, imgIdx);
                                            }
                                          }}
                                          style={{
                                            border: "2px dashed rgba(229, 96, 48, 0.3)",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            textAlign: "center",
                                            fontSize: "11px",
                                            color: "#e56030",
                                            cursor: "pointer",
                                            backgroundColor: "rgba(229, 96, 48, 0.02)",
                                            transition: "all 0.2s ease"
                                          }}
                                          onClick={() => document.getElementById(`ws-upload-${grpIdx}-${imgIdx}`).click()}
                                        >
                                          <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>🖼️</span>
                                          <span>Drag & drop image here, or <strong>click to upload</strong></span>
                                          <input
                                            id={`ws-upload-${grpIdx}-${imgIdx}`}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) handleFileUpload(file, grpIdx, imgIdx);
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <div style={styles.inputGroupSmall}>
                                      <label style={styles.labelSmall}>Description</label>
                                      <textarea
                                        rows={2}
                                        value={img.description}
                                        onChange={(e) => updateCreativeMedia(grpIdx, imgIdx, "description", e.target.value)}
                                      />
                                    </div>

                                    <div style={styles.inputGroupSmall}>
                                      <label style={styles.labelSmall}>Display Tab / Category</label>
                                      <select
                                        value={img.category || ""}
                                        onChange={(e) => updateCreativeMedia(grpIdx, imgIdx, "category", e.target.value)}
                                        style={styles.selectSmall}
                                      >
                                        <option value="">Default (Based on Media Type)</option>
                                        <option value="image">Creative Content</option>
                                        <option value="video">AI Videos</option>
                                        <option value="reel">Reels</option>
                                        <option value="website">Website & SEO</option>
                                      </select>
                                    </div>

                                    <div style={styles.inputGroupSmall}>
                                      <label style={styles.labelSmall}>Sequence / Sort Order</label>
                                      <input
                                        type="number"
                                        value={img.globalIndex !== undefined && img.globalIndex !== null ? img.globalIndex : ""}
                                        placeholder="e.g. 1, 2, 3"
                                        onChange={(e) => updateCreativeMedia(grpIdx, imgIdx, "globalIndex", e.target.value ? Number(e.target.value) : "")}
                                        style={styles.inputSmall}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            );
          })()}

          {activeTab === "blogs" && (
            <div>
              {editingBlog === null ? (
                <div>
                  <div style={styles.contentHeader}>
                    <h2>Manage Blog Posts</h2>
                    <button onClick={handleCreateBlogClick} style={styles.saveBtn}>
                      <Icon name="add" /> Create Blog Post
                    </button>
                  </div>

                  {/* Import External Blogs Box */}
                  <div style={{ ...styles.card, marginBottom: "32px", border: "1px dashed rgba(253, 126, 20, 0.4)", backgroundColor: "rgba(253, 126, 20, 0.02)" }}>
                    <div style={styles.cardHeader}>
                      <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FD7E14", margin: 0 }}>
                        <Icon name="cloud_download" /> Import from External Blog Source
                      </h3>
                    </div>
                    <form onSubmit={handleImportBlogs} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                      <div className="admin-input-row" style={styles.inputRow}>
                        <div style={styles.inputGroupFluid}>
                          <label style={styles.label}>Source Platform</label>
                          <select
                            value={importSourceType}
                            onChange={(e) => setImportSourceType(e.target.value)}
                            style={styles.select}
                          >
                            <option value="devto">Dev.to (by Username)</option>
                            <option value="rss">RSS Feed (Medium, WordPress, etc.)</option>
                            <option value="url">Any Webpage URL (Scrape Post)</option>
                          </select>
                        </div>
                        <div style={styles.inputGroupFluid}>
                          <label style={styles.label}>Default Category</label>
                          <select
                            value={importCategory}
                            onChange={(e) => setImportCategory(e.target.value)}
                            style={styles.select}
                          >
                            <option value="Marketing">Marketing</option>
                            <option value="SEO">SEO</option>
                            <option value="Web Development">Web Development</option>
                            <option value="AI Reels">AI Reels</option>
                            <option value="Agency Growth">Agency Growth</option>
                          </select>
                        </div>
                      </div>

                      <div style={styles.inputGroup}>
                        {importSourceType === "devto" ? (
                          <>
                            <label style={styles.label}>Dev.to Username</label>
                            <input
                              type="text"
                              value={importUsername}
                              onChange={(e) => setImportUsername(e.target.value)}
                              placeholder="e.g. nutlope"
                              style={styles.input}
                              required
                            />
                          </>
                        ) : importSourceType === "rss" ? (
                          <>
                            <label style={styles.label}>RSS Feed URL</label>
                            <input
                              type="url"
                              value={importFeedUrl}
                              onChange={(e) => setImportFeedUrl(e.target.value)}
                              placeholder="e.g. https://medium.com/feed/tag/technology"
                              style={styles.input}
                              required
                            />
                          </>
                        ) : (
                          <>
                            <label style={styles.label}>Any Webpage URL (Link)</label>
                            <input
                              type="url"
                              value={importFeedUrl}
                              onChange={(e) => setImportFeedUrl(e.target.value)}
                              placeholder="e.g. https://blog.google/technology/ai/gemini/"
                              style={styles.input}
                              required
                            />
                          </>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isImporting}
                        style={{
                          ...styles.saveBtn,
                          alignSelf: "flex-start",
                          backgroundColor: "#FD7E14",
                          opacity: isImporting ? 0.7 : 1,
                        }}
                      >
                        {isImporting ? (
                          <>Importing...</>
                        ) : (
                          <>
                            <Icon name="cloud_download" /> Sync & Import
                          </>
                        )}
                      </button>
                    </form>

                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(253, 126, 20, 0.15)", fontSize: "13px" }}>
                      <span style={{ fontWeight: "700", color: "#FD7E14", display: "block", marginBottom: "8px" }}>
                        💡 Free Blog Sources & Links (Click to autofill):
                      </span>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <strong>Dev.to Usernames:</strong>
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                            {["nutlope", "wesbos", "dangoslen"].map(user => (
                              <button
                                key={user}
                                type="button"
                                onClick={() => {
                                  setImportSourceType("devto");
                                  setImportUsername(user);
                                  setImportFeedUrl("");
                                }}
                                style={{ padding: "4px 8px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", cursor: "pointer", color: "#333" }}
                              >
                                {user}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <strong>RSS Feeds:</strong>
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                            {[
                              { name: "Medium AI Feed", url: "https://medium.com/feed/tag/artificial-intelligence" },
                              { name: "Medium Tech Feed", url: "https://medium.com/feed/tag/technology" },
                              { name: "Dev.to Main Feed", url: "https://dev.to/feed" }
                            ].map(feed => (
                              <button
                                key={feed.name}
                                type="button"
                                onClick={() => {
                                  setImportSourceType("rss");
                                  setImportFeedUrl(feed.url);
                                  setImportUsername("");
                                }}
                                style={{ padding: "4px 8px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", cursor: "pointer", color: "#333" }}
                              >
                                {feed.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <strong>Sample Webpage URLs:</strong>
                          <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                            {[
                              { name: "Neil Patel Blog", url: "https://neilpatel.com/blog/" },
                              { name: "Digital Marketing Institute Blog", url: "https://digitalmarketinginstitute.com/blog" },
                              { name: "Vercel Next.js 15 Blog", url: "https://vercel.com/blog/nextjs-15" },
                              { name: "Google Gemini Blog", url: "https://blog.google/technology/ai/google-gemini-update-flash-models-io-2024/" }
                            ].map(web => (
                              <button
                                key={web.name}
                                type="button"
                                onClick={() => {
                                  setImportSourceType("url");
                                  setImportFeedUrl(web.url);
                                  setImportUsername("");
                                }}
                                style={{ padding: "4px 8px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "4px", fontSize: "12px", cursor: "pointer", color: "#333" }}
                                title={web.url}
                              >
                                {web.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.blogListGrid}>
                    {blogsData.map((blog) => (
                      <div key={blog.id} style={styles.blogAdminCard}>
                        <div>
                          <div style={styles.blogMetaRow}>
                            <span style={styles.blogCategoryTag}>{blog.category}</span>
                            <span style={blog.published ? styles.blogPublishedTag : styles.blogDraftTag}>
                              {blog.published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <h3 style={styles.blogAdminTitle}>{blog.title}</h3>
                          <p style={styles.blogAdminExcerpt}>{blog.excerpt}</p>
                        </div>

                        <div style={styles.blogAdminActionRow}>
                          <button onClick={() => handleEditBlogClick(blog)} style={styles.editBtnSmall}>
                            <Icon name="edit" /> Edit
                          </button>
                          <button onClick={() => handleDeleteBlog(blog.id)} style={styles.deleteBtnIconOnly}>
                            <Icon name="delete" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={styles.contentHeader}>
                    <h2>{editingBlog === "new" ? "Create New Blog Post" : "Edit Blog Post"}</h2>
                    <button onClick={() => setEditingBlog(null)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveBlog} style={styles.blogFormContainer}>
                    <div className="admin-input-row" style={styles.inputRow}>
                      <div style={styles.inputGroupFluid}>
                        <label style={styles.label}>Title</label>
                        <input
                          type="text"
                          value={blogForm.title}
                          onChange={handleBlogTitleChange}
                          placeholder="How AI is changing marketing..."
                          style={styles.input}
                          required
                        />
                      </div>

                      <div style={styles.inputGroupFluid}>
                        <label style={styles.label}>Slug URL path</label>
                        <input
                          type="text"
                          value={blogForm.slug}
                          onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                          placeholder="how-ai-is-changing-marketing"
                          style={styles.input}
                          required
                        />
                      </div>
                    </div>

                    <div className="admin-input-row" style={styles.inputRow}>
                      <div style={styles.inputGroupFluid}>
                        <label style={styles.label}>Category</label>
                        <select
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                          style={styles.select}
                        >
                          <option value="Marketing">Marketing</option>
                          <option value="SEO">SEO</option>
                          <option value="Web Development">Web Development</option>
                          <option value="AI Reels">AI Reels</option>
                          <option value="Agency Growth">Agency Growth</option>
                        </select>
                      </div>

                      <div style={styles.inputGroupFluid}>
                        <label style={styles.label}>Cover Image path</label>
                        <input
                          type="text"
                          value={blogForm.coverImage}
                          onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                          placeholder="/creative_content/Creative1.jpeg"
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Excerpt (Summary)</label>
                      <input
                        type="text"
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        placeholder="A short summary of the blog post details..."
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Content Markdown Body (or paste External Redirect URL e.g. https://medium.com/...)</label>
                      <textarea
                        rows={12}
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        placeholder="Paste the redirect URL (e.g. https://medium.com/@username/title) or type the Markdown body..."
                        style={styles.textarea}
                        required
                      />
                    </div>

                    <div style={styles.checkboxGroup}>
                      <label style={styles.switchLabel}>
                        <input
                          type="checkbox"
                          checked={blogForm.published}
                          onChange={(e) => setBlogForm({ ...blogForm, published: e.target.checked })}
                        />{" "}
                        Publish immediately
                      </label>
                    </div>

                    <button type="submit" style={styles.saveBtn}>
                      <Icon name="save" /> Save Post
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div>
              <div style={styles.contentHeader}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>WhatsApp Automation Panel</h2>
                  <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>Configure provider keys, test delivery, and review notification logs</p>
                </div>
                <button onClick={loadWhatsAppInfo} style={styles.refreshBtn}>
                  <Icon name="refresh" /> Refresh Logs & Status
                </button>
              </div>

              {/* Status & Test Form Grid */}
              <div className="admin-overview-grid" style={styles.overviewGrid}>

                {/* Configuration details */}
                <div style={styles.statusCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>Active Connection</h3>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: whatsappData.config?.provider !== "none" ? "rgba(16, 185, 129, 0.15)" : "rgba(253, 126, 20, 0.15)",
                      color: whatsappData.config?.provider !== "none" ? "#10B981" : "#FD7E14",
                      border: `1px solid ${whatsappData.config?.provider !== "none" ? "rgba(16, 185, 129, 0.3)" : "rgba(253, 126, 20, 0.3)"}`
                    }}>
                      {whatsappData.config?.provider ? whatsappData.config.provider.toUpperCase() : "NONE (SANDBOX)"}
                    </span>
                  </div>
                  <p style={styles.cardDesc}>
                    Dynamic routing configuration based on server-side `.env` variables. Fallback is set to sandbox console logging if no API keys are provided.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                      <span style={{ color: "#94a3b8" }}>Admin Recipient Phone Number:</span>
                      <span style={{ fontWeight: "600" }}>+{whatsappData.config?.adminNumber || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                      <span style={{ color: "#94a3b8" }}>Meta Cloud API status:</span>
                      <span style={{ fontWeight: "600", color: whatsappData.config?.meta?.configured ? "#10B981" : "#ef4444" }}>
                        {whatsappData.config?.meta?.configured ? "Configured" : "Not Set"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#94a3b8" }}>UltraMsg HTTP status:</span>
                      <span style={{ fontWeight: "600", color: whatsappData.config?.ultramsg?.configured ? "#10B981" : "#ef4444" }}>
                        {whatsappData.config?.ultramsg?.configured ? "Configured" : "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Message Sender Form */}
                <div style={styles.statusCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>Dispatch Test WhatsApp</h3>
                  </div>
                  <p style={styles.cardDesc}>Send manual notification test to verify webhook routing and network credentials.</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                    <div style={styles.inputGroupSmall}>
                      <label style={styles.labelSmall}>Recipient Number (e.g. 919096090701)</label>
                      <input
                        type="text"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        placeholder="Country code + phone"
                        style={styles.inputSmall}
                      />
                    </div>
                    <div style={styles.inputGroupSmall}>
                      <label style={styles.labelSmall}>Message Body</label>
                      <textarea
                        rows={2}
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="Type test message body..."
                        style={styles.textareaSmall}
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!testRecipient || !testMessage) {
                          showToast("Please fill in all manual test fields.", "error");
                          return;
                        }
                        if (!isValidMobileNumber(testRecipient)) {
                          showToast("Please enter a valid 10-digit recipient phone number.", "error");
                          return;
                        }
                        setIsTestSending(true);
                        try {
                          const res = await fetch("/api/admin/whatsapp", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ recipient: testRecipient, message: testMessage })
                          });
                          const resData = await res.json();
                          if (resData.success) {
                            showToast(resData.message || "Message dispatched successfully!");
                            setTestMessage("");
                            loadWhatsAppInfo();
                          } else {
                            showToast(resData.error || "Failed to dispatch message.", "error");
                          }
                        } catch (err) {
                          showToast("Network dispatch error.", "error");
                        } finally {
                          setIsTestSending(false);
                        }
                      }}
                      disabled={isTestSending}
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: "#FD7E14",
                        color: "#fff",
                        border: "none",
                        marginTop: "4px"
                      }}
                    >
                      <Icon name="send" /> {isTestSending ? "Dispatching..." : "Send Message"}
                    </button>
                  </div>
                </div>

              </div>

              {/* Delivery logs list */}
              <div style={{ ...styles.portfolioSectionHeader, marginTop: "40px" }}>
                <h3>Recent Delivery Notification Logs</h3>
                <span style={{ fontSize: "12px", color: whatsappData.dbConnected ? "#10B981" : "#ef4444" }}>
                  {whatsappData.dbConnected ? "Database Storage Online" : "Database Offline (No logs history saved)"}
                </span>
              </div>

              <div style={{ overflowX: "auto", marginTop: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
                      <th style={{ padding: "12px 8px" }}>ID</th>
                      <th style={{ padding: "12px 8px" }}>Recipient</th>
                      <th style={{ padding: "12px 8px" }}>Message</th>
                      <th style={{ padding: "12px 8px" }}>Provider</th>
                      <th style={{ padding: "12px 8px" }}>Status</th>
                      <th style={{ padding: "12px 8px" }}>Error Info</th>
                      <th style={{ padding: "12px 8px" }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whatsappData.logs && whatsappData.logs.length > 0 ? (
                      whatsappData.logs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px 8px", fontFamily: "monospace", color: "#94a3b8" }}>{log.id}</td>
                          <td style={{ padding: "10px 8px", fontWeight: "600" }}>+{log.recipient}</td>
                          <td style={{ padding: "10px 8px", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.message}>
                            {log.message}
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8" }}>{log.provider}</span>
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "600",
                              backgroundColor: log.status === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                              color: log.status === "success" ? "#10B981" : "#ef4444"
                            }}>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ padding: "10px 8px", color: "#f87171", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.error || ""}>
                            {log.error || "-"}
                          </td>
                          <td style={{ padding: "10px 8px", color: "#94a3b8" }}>
                            {new Date(log.created_at).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ padding: "20px 8px", textAlign: "center", color: "#94a3b8" }}>
                          No notification dispatch logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeTab === "onboarding" && (
            <div>
              <div style={styles.contentHeader}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Client Onboarding Details</h2>
                  <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>View billing profile records, callbacks, scheduled strategy calls, and manage campaign status</p>
                </div>
                <button onClick={loadOnboardingData} style={styles.refreshBtn}>
                  <Icon name="refresh" /> Refresh List
                </button>
              </div>

              <div style={{ overflowX: "auto", marginTop: "24px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
                      <th style={{ padding: "12px 8px" }}>Client Info</th>
                      <th style={{ padding: "12px 8px" }}>Plans Purchased</th>
                      <th style={{ padding: "12px 8px" }}>Billing Address</th>
                      <th style={{ padding: "12px 8px" }}>Callback / Meeting</th>
                      <th style={{ padding: "12px 8px" }}>Status</th>
                      <th style={{ padding: "12px 8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onboardingData && onboardingData.length > 0 ? (
                      onboardingData.map((client) => (
                        <tr key={client.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", verticalAlign: "top" }}>
                          {/* Client Info */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{ fontWeight: "700", color: "#f8fafc" }}>{client.contact_name || "N/A"}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Alt: {client.alt_phone || "None"}</div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Pay ID: {client.payment_id}</div>
                          </td>
                          {/* Plans Purchased */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{ fontWeight: "600", color: "#f1f5f9" }}>{client.plans}</div>
                            <span style={{
                              display: "inline-block",
                              marginTop: "4px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: "700",
                              backgroundColor: "rgba(253, 126, 20, 0.1)",
                              color: "#FD7E14"
                            }}>
                              {client.business_type || "Individual"}
                            </span>
                            {client.gstin && (
                              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", fontFamily: "monospace" }}>
                                GSTIN: {client.gstin}
                              </div>
                            )}
                            {client.promo_code && client.promo_code !== "None" && (
                              <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "4px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: "700",
                                backgroundColor: "rgba(16, 185, 129, 0.15)",
                                color: "#10B981",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                marginLeft: "6px"
                              }}>
                                <Icon name="sell" style={{ fontSize: "11px" }} />
                                {client.promo_code}
                              </div>
                            )}
                          </td>
                          {/* Address */}
                          <td style={{ padding: "14px 8px", maxWidth: "220px" }}>
                            <div style={{ color: "#e2e8f0", lineHeight: "1.3" }}>
                              {client.address_line1}
                              {client.address_line2 ? `, ${client.address_line2}` : ""}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                              {client.city}, {client.state_name} - {client.pin_code}
                            </div>
                          </td>
                          {/* Callback / Meeting */}
                          <td style={{ padding: "14px 8px" }}>
                            {client.request_callback === 1 ? (
                              <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                color: "#f87171",
                                marginBottom: "6px"
                              }}>
                                <Icon name="phone_callback" style={{ fontSize: "14px" }} />
                                Callback Req
                              </div>
                            ) : (
                              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>No callback req</div>
                            )}
                            {client.scheduled_date ? (
                              <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
                                <div style={{ fontWeight: "700" }}>🗓️ Strategy Call:</div>
                                <div style={{ color: "#94a3b8", marginTop: "2px" }}>{client.scheduled_date}</div>
                                <div style={{ color: "#94a3b8" }}>{client.scheduled_time}</div>
                              </div>
                            ) : (
                              <div style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>Not scheduled yet</div>
                            )}
                          </td>
                          {/* Status */}
                          <td style={{ padding: "14px 8px" }}>
                            <select
                              value={client.status || "Pending"}
                              onChange={(e) => handleUpdateOnboardingStatus(client.id, e.target.value)}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "#1e293b",
                                color: "#fff",
                                fontSize: "12px",
                                outline: "none",
                                cursor: "pointer",
                                fontWeight: "600"
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Active">Active</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "14px 8px" }}>
                            <button
                              onClick={() => handleDeleteOnboarding(client.id)}
                              style={styles.deleteBtnIconOnly}
                              title="Delete Record"
                            >
                              <Icon name="delete" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: "30px 8px", textAlign: "center", color: "#94a3b8" }}>
                          No client onboarding details recorded in database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reminders" && (
            <div>
              <div style={styles.contentHeader}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Scheduled Payment Reminders</h2>
                  <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>View when potential customers have rescheduled their checkout payments</p>
                </div>
                <button onClick={loadRemindersData} style={styles.refreshBtn}>
                  <Icon name="refresh" /> Refresh List
                </button>
              </div>

              <div style={{ overflowX: "auto", marginTop: "24px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
                      <th style={{ padding: "12px 8px" }}>Customer Info</th>
                      <th style={{ padding: "12px 8px" }}>Selected Plan</th>
                      <th style={{ padding: "12px 8px" }}>Scheduled Date</th>
                      <th style={{ padding: "12px 8px" }}>Created At</th>
                      <th style={{ padding: "12px 8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remindersData && remindersData.length > 0 ? (
                      remindersData.map((reminder) => (
                        <tr key={reminder.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", verticalAlign: "middle" }}>
                          {/* Customer Info */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{ fontWeight: "700", color: "#f8fafc" }}>{reminder.customer_name || "N/A"}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Phone: {reminder.customer_phone || "N/A"}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Email: {reminder.customer_email || "N/A"}</div>
                          </td>
                          {/* Plan Details */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{ fontWeight: "600", color: "#f1f5f9" }}>{reminder.plan_name}</div>
                            <div style={{ fontSize: "12px", color: "#FD7E14", marginTop: "2px", fontWeight: "700" }}>₹{reminder.plan_price}</div>
                          </td>
                          {/* Scheduled Date */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              backgroundColor: "rgba(253, 126, 20, 0.15)",
                              color: "#FD7E14"
                            }}>
                              <Icon name="calendar_month" style={{ fontSize: "16px" }} />
                              {reminder.reminder_date}
                            </div>
                          </td>
                          {/* Created At */}
                          <td style={{ padding: "14px 8px", color: "#94a3b8" }}>
                            {new Date(reminder.created_at).toLocaleString()}
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "14px 8px" }}>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              style={styles.deleteBtnIconOnly}
                              title="Delete Reminder"
                            >
                              <Icon name="delete" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "30px 8px", textAlign: "center", color: "#94a3b8" }}>
                          No payment reminders recorded in database yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div>
              <div style={styles.contentHeader}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Job Applications</h2>
                  <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>Manage candidate applications submitted through the Careers page</p>
                </div>
                <button onClick={loadApplicationsData} style={styles.refreshBtn}>
                  <Icon name="refresh" /> Refresh List
                </button>
              </div>

              <div style={{ overflowX: "auto", marginTop: "24px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
                      <th style={{ padding: "12px 8px" }}>Applicant Info</th>
                      <th style={{ padding: "12px 8px" }}>Job Role</th>
                      <th style={{ padding: "12px 8px" }}>Location</th>
                      <th style={{ padding: "12px 8px" }}>Resume & Info</th>
                      <th style={{ padding: "12px 8px" }}>Status</th>
                      <th style={{ padding: "12px 8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsData && applicationsData.length > 0 ? (
                      applicationsData.map((app) => (
                        <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", verticalAlign: "top" }}>
                          {/* Applicant Info */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{ fontWeight: "700", color: "#f8fafc" }}>{app.name}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{app.phone}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{app.email}</div>
                          </td>
                          {/* Job Role */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{ fontWeight: "600", color: "#3B82F6" }}>{app.job_title}</div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                              {new Date(app.created_at).toLocaleString()}
                            </div>
                          </td>
                          {/* Location */}
                          <td style={{ padding: "14px 8px" }}>
                            <div style={{ color: "#e2e8f0" }}>{app.address || "N/A"}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                              {app.city ? app.city + ", " : ""}{app.district || ""}
                            </div>
                          </td>
                          {/* Resume & Info */}
                          <td style={{ padding: "14px 8px", maxWidth: "250px" }}>
                            <div style={{ marginBottom: "6px" }}>
                              <a 
                                href={app.resume_url} 
                                download
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                  display: "inline-flex", 
                                  alignItems: "center", 
                                  gap: "4px",
                                  padding: "4px 8px", 
                                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                                  color: "#10B981", 
                                  textDecoration: "none",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: "600" 
                                }}
                              >
                                <Icon name="description" style={{ fontSize: "14px" }} /> View Resume
                              </a>
                            </div>
                            {app.message && (
                              <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", whiteSpace: "pre-wrap", maxHeight: "60px", overflowY: "auto" }}>
                                "{app.message}"
                              </div>
                            )}
                          </td>
                          {/* Status */}
                          <td style={{ padding: "14px 8px" }}>
                            <select
                              value={app.status || "Pending"}
                              onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                              style={{
                                padding: "6px 8px",
                                borderRadius: "6px",
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "#1e293b",
                                color: "#fff",
                                fontSize: "12px",
                                outline: "none",
                                cursor: "pointer",
                                fontWeight: "600"
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Hired">Hired</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "14px 8px" }}>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              style={styles.deleteBtnIconOnly}
                              title="Delete Record"
                            >
                              <Icon name="delete" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: "30px 8px", textAlign: "center", color: "#94a3b8" }}>
                          No job applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== PROMO CODES MANAGEMENT TAB ===== */}
          {activeTab === "promos" && (
            <div>
              <div style={styles.contentHeader}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Promo Codes</h2>
                  <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>Create, manage, and track promotional discount codes</p>
                </div>
                <button onClick={loadPromoData} style={styles.refreshBtn}>
                  <Icon name="refresh" /> Refresh
                </button>
              </div>

              {/* Create New Promo Code Form */}
              <div style={styles.statusCard}>
                <div style={styles.cardHeader}>
                  <h3 style={{ margin: 0, fontSize: "18px" }}><Icon name="add_circle" /> Create New Promo Code</h3>
                </div>
                <form onSubmit={handleSavePromo} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <label style={styles.labelSmall}>Promo Code (auto-generated if blank)</label>
                      <input
                        type="text"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. SAVE5"
                        style={styles.inputSmall}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: "140px" }}>
                      <label style={styles.labelSmall}>Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={promoForm.discount_percent}
                        onChange={(e) => setPromoForm({ ...promoForm, discount_percent: e.target.value })}
                        placeholder="e.g. 10"
                        style={styles.inputSmall}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: "160px" }}>
                      <label style={styles.labelSmall}>Min Order Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={promoForm.min_order_amount}
                        onChange={(e) => setPromoForm({ ...promoForm, min_order_amount: e.target.value })}
                        placeholder="e.g. 3000"
                        style={styles.inputSmall}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label style={styles.labelSmall}>Description (optional)</label>
                    <input
                      type="text"
                      value={promoForm.description}
                      onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      placeholder="e.g. 5% OFF on orders of ₹3,000+"
                      style={styles.inputSmall}
                    />
                  </div>
                  <button type="submit" style={{ ...styles.actionBtn, backgroundColor: "#FD7E14", color: "#fff", border: "none", alignSelf: "flex-start", padding: "10px 24px" }}>
                    <Icon name="add" /> Create Promo Code
                  </button>
                </form>
              </div>

              {/* Existing Promo Codes Table */}
              <div style={{ overflowX: "auto", marginTop: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={{ textAlign: "left", padding: "12px 8px", color: "#94a3b8", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Code</th>
                      <th style={{ textAlign: "left", padding: "12px 8px", color: "#94a3b8", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Discount</th>
                      <th style={{ textAlign: "left", padding: "12px 8px", color: "#94a3b8", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Min Order</th>
                      <th style={{ textAlign: "left", padding: "12px 8px", color: "#94a3b8", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</th>
                      <th style={{ textAlign: "left", padding: "12px 8px", color: "#94a3b8", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Used</th>
                      <th style={{ textAlign: "left", padding: "12px 8px", color: "#94a3b8", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "12px 8px", color: "#94a3b8", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promosData.length > 0 ? (
                      promosData.map((promo) => (
                        <tr key={promo.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "14px 8px" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "800",
                              letterSpacing: "0.04em",
                              background: "linear-gradient(135deg, rgba(253,126,20,0.2), rgba(253,126,20,0.08))",
                              color: "#FD7E14",
                              border: "1px solid rgba(253,126,20,0.3)"
                            }}>
                              {promo.code}
                            </span>
                          </td>
                          <td style={{ padding: "14px 8px", fontWeight: "700", color: "#10B981" }}>{promo.discount_percent}%</td>
                          <td style={{ padding: "14px 8px", fontWeight: "600" }}>₹{Number(promo.min_order_amount).toLocaleString("en-IN")}</td>
                          <td style={{ padding: "14px 8px", color: "#94a3b8", maxWidth: "200px" }}>{promo.description || "—"}</td>
                          <td style={{ padding: "14px 8px", fontWeight: "600" }}>{promo.times_used || 0}</td>
                          <td style={{ padding: "14px 8px" }}>
                            <span
                              onClick={() => handleTogglePromoStatus(promo.id, promo.is_active)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                backgroundColor: promo.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: promo.is_active ? "#10B981" : "#EF4444",
                                border: `1px solid ${promo.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`
                              }}
                            >
                              <Icon name={promo.is_active ? "toggle_on" : "toggle_off"} />
                              {promo.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 8px" }}>
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              style={styles.deleteBtnIconOnly}
                              title="Delete Promo Code"
                            >
                              <Icon name="delete" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ padding: "30px 8px", textAlign: "center", color: "#94a3b8" }}>
                          No promo codes found. Default codes will be auto-created on first checkout.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quick Reference Card */}
              <div style={{ ...styles.statusCard, marginTop: "20px" }}>
                <div style={styles.cardHeader}>
                  <h3 style={{ margin: 0, fontSize: "16px" }}><Icon name="info" /> Default Promo Rules</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>SAVE5</span>
                    <span style={{ fontWeight: "600", color: "#10B981" }}>5% OFF → Min ₹3,000</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                    <span style={{ color: "#94a3b8" }}>GROWTH10</span>
                    <span style={{ fontWeight: "600", color: "#10B981" }}>10% OFF → Min ₹8,000</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#94a3b8" }}>SCALE15</span>
                    <span style={{ fontWeight: "600", color: "#10B981" }}>15% OFF → Min ₹15,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== LIVE VISITORS & TRAFFIC ANALYTICS TAB ===== */}
          {activeTab === "visitors" && (
            <div>
              {/* Header */}
              <div style={styles.contentHeader}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0 }}>Live Visitors & Traffic</h2>
                    {visitorsData.liveOnline > 0 && (
                      <span style={{
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        color: "#10B981",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#10B981",
                          boxShadow: "0 0 8px #10B981",
                          display: "inline-block"
                        }}></span>
                        {visitorsData.liveOnline} Online Right Now
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
                    Automated real-time visitor tracking, analytics, and traffic logs for https://www.aidigital.biz/
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {/* Auto-refresh selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Icon name="sync" style={{ fontSize: "16px", color: "#94a3b8" }} />
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Auto-refresh:</span>
                    <select
                      value={visitorAutoRefresh}
                      onChange={(e) => setVisitorAutoRefresh(e.target.value)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#10B981",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      <option value="10" style={{ background: "#1e293b", color: "#fff" }}>Every 10s</option>
                      <option value="30" style={{ background: "#1e293b", color: "#fff" }}>Every 30s</option>
                      <option value="off" style={{ background: "#1e293b", color: "#fff" }}>Off (Manual)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => loadVisitorsData(visitorRange, visitorSearch, visitorPage)}
                    style={styles.refreshBtn}
                    disabled={isLoadingVisitors}
                    title="Refresh Live Visitor Data"
                  >
                    <Icon name={isLoadingVisitors ? "hourglass_empty" : "refresh"} /> {isLoadingVisitors ? "Refreshing..." : "Refresh"}
                  </button>

                  <button
                    onClick={handleExportVisitorsCSV}
                    style={{
                      ...styles.refreshBtn,
                      backgroundColor: "rgba(59, 130, 246, 0.15)",
                      borderColor: "rgba(59, 130, 246, 0.3)",
                      color: "#60a5fa"
                    }}
                    title="Export Current Filtered Visitors to CSV"
                  >
                    <Icon name="download" /> Export CSV
                  </button>

                  <button
                    onClick={() => handleClearVisitorLogs("clean_old")}
                    style={{
                      ...styles.refreshBtn,
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderColor: "rgba(239, 68, 68, 0.25)",
                      color: "#f87171"
                    }}
                    title="Clean old visitor logs older than 60 days"
                  >
                    <Icon name="cleaning_services" /> Clean 60d+
                  </button>
                </div>
              </div>

              {/* Time Range Selector */}
              <div style={{ display: "flex", gap: "8px", margin: "16px 0", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#94a3b8", marginRight: "4px", fontWeight: "600" }}>Timeframe:</span>
                {[
                  { id: "today", label: "Today" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "7d", label: "Last 7 Days" },
                  { id: "30d", label: "Last 30 Days" },
                  { id: "all", label: "All Time" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setVisitorRange(item.id);
                      setVisitorPage(1);
                      loadVisitorsData(item.id, visitorSearch, 1);
                    }}
                    style={{
                      padding: "7px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: visitorRange === item.id ? "1px solid #10B981" : "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: visitorRange === item.id ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.02)",
                      color: visitorRange === item.id ? "#10B981" : "#cbd5e1",
                      transition: "all 0.2s"
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* KPI Metrics Cards Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "24px"
              }}>
                {/* 1. Live Online Now */}
                <div style={{
                  ...styles.miniCard,
                  backgroundColor: "rgba(16, 185, 129, 0.06)",
                  border: "1px solid rgba(16, 185, 129, 0.25)"
                }}>
                  <div style={styles.miniCardHeader}>
                    <Icon name="sensors" style={{ color: "#10B981" }} />
                    <h4 style={{ margin: 0, color: "#10B981" }}>Live Online Now</h4>
                  </div>
                  <p style={{ ...styles.statNumber, color: "#10B981" }}>{visitorsData.liveOnline || 0}</p>
                  <span style={styles.statLabel}>Active in last 3 minutes</span>
                </div>

                {/* 2. Total Pageviews */}
                <div style={styles.miniCard}>
                  <div style={styles.miniCardHeader}>
                    <Icon name="visibility" style={{ color: "#3B82F6" }} />
                    <h4 style={{ margin: 0 }}>Total Pageviews</h4>
                  </div>
                  <p style={styles.statNumber}>{(visitorsData.summary?.totalPageviews || 0).toLocaleString()}</p>
                  <span style={styles.statLabel}>
                    {(visitorsData.summary?.totalSessions || 0).toLocaleString()} browsing sessions
                  </span>
                </div>

                {/* 3. Unique Visitors */}
                <div style={styles.miniCard}>
                  <div style={styles.miniCardHeader}>
                    <Icon name="person" style={{ color: "#8B5CF6" }} />
                    <h4 style={{ margin: 0 }}>Unique Visitors</h4>
                  </div>
                  <p style={styles.statNumber}>{(visitorsData.summary?.uniqueVisitors || 0).toLocaleString()}</p>
                  <span style={styles.statLabel}>
                    {visitorsData.summary?.newVisitors || 0} first-time visitors
                  </span>
                </div>

                {/* 4. Avg Session Duration */}
                <div style={styles.miniCard}>
                  <div style={styles.miniCardHeader}>
                    <Icon name="timer" style={{ color: "#F59E0B" }} />
                    <h4 style={{ margin: 0 }}>Avg Time on Site</h4>
                  </div>
                  <p style={styles.statNumber}>{formatDuration(visitorsData.summary?.avgDurationSeconds || 0)}</p>
                  <span style={styles.statLabel}>Average duration per visit</span>
                </div>

                {/* 5. Top Location */}
                <div style={styles.miniCard}>
                  <div style={styles.miniCardHeader}>
                    <Icon name="public" style={{ color: "#EC4899" }} />
                    <h4 style={{ margin: 0 }}>Top Country</h4>
                  </div>
                  <p style={{ ...styles.statNumber, fontSize: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {visitorsData.charts?.topCountries?.[0]
                      ? `${getCountryFlag(visitorsData.charts.topCountries[0].country_code)} ${visitorsData.charts.topCountries[0].country}`
                      : "—"}
                  </p>
                  <span style={styles.statLabel}>
                    {visitorsData.charts?.topCountries?.[0]?.count || 0} visits from this region
                  </span>
                </div>

                {/* 6. Top Traffic Source */}
                <div style={styles.miniCard}>
                  <div style={styles.miniCardHeader}>
                    <Icon name="campaign" style={{ color: "#06B6D4" }} />
                    <h4 style={{ margin: 0 }}>Top Source</h4>
                  </div>
                  <p style={{ ...styles.statNumber, fontSize: "18px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#06B6D4" }}>
                    {visitorsData.charts?.topSources?.[0]?.source_name || "Direct"}
                  </p>
                  <span style={styles.statLabel}>
                    {visitorsData.charts?.topSources?.[0]?.count || 0} visits • Bounce: {visitorsData.summary?.bounceRate || 0}%
                  </span>
                </div>
              </div>

              {/* Visual Breakdown Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                {/* Traffic Trend Visualizer */}
                <div style={styles.statusCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="show_chart" style={{ color: "#3B82F6" }} /> Traffic Activity ({visitorRange.toUpperCase()})
                    </h3>
                  </div>
                  {visitorsData.charts?.trend && visitorsData.charts.trend.length > 0 ? (
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "130px", padding: "10px 0 0 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        {(() => {
                          const maxViews = Math.max(...visitorsData.charts.trend.map(t => Number(t.views) || 1), 1);
                          return visitorsData.charts.trend.map((t, idx) => {
                            const heightPct = Math.max(12, Math.round(((Number(t.views) || 0) / maxViews) * 100));
                            return (
                              <div
                                key={idx}
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "4px",
                                  height: "100%",
                                  justifyContent: "flex-end"
                                }}
                                title={`${t.label}: ${t.views} views (${t.visitors} unique visitors)`}
                              >
                                <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>{t.views}</span>
                                <div
                                  style={{
                                    width: "100%",
                                    minWidth: "12px",
                                    maxWidth: "28px",
                                    height: `${heightPct}%`,
                                    background: "linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)",
                                    borderRadius: "4px 4px 0 0",
                                    transition: "all 0.3s"
                                  }}
                                />
                                <span style={{ fontSize: "10px", color: "#64748b", whiteSpace: "nowrap" }}>{t.label}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: "13px", padding: "20px 0", textAlign: "center" }}>
                      No activity recorded for this timeframe yet.
                    </p>
                  )}
                </div>

                {/* Device, OS & Browser Breakdown */}
                <div style={styles.statusCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="devices" style={{ color: "#10B981" }} /> Devices, OS & Browsers
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
                    {/* Device distribution bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span style={{ color: "#94a3b8" }}>Device Types</span>
                        <span style={{ fontWeight: "600", color: "#fff" }}>
                          {visitorsData.charts?.devices?.map(d => `${d.device}: ${d.count}`).join(" • ") || "—"}
                        </span>
                      </div>
                      <div style={{ height: "7px", width: "100%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                        {(() => {
                          const totalDev = visitorsData.charts?.devices?.reduce((acc, d) => acc + Number(d.count), 0) || 1;
                          const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];
                          return visitorsData.charts?.devices?.map((d, i) => (
                            <div
                              key={i}
                              style={{
                                width: `${(Number(d.count) / totalDev) * 100}%`,
                                backgroundColor: colors[i % colors.length]
                              }}
                              title={`${d.device}: ${d.count}`}
                            />
                          ));
                        })()}
                      </div>
                    </div>

                    {/* OS Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {visitorsData.charts?.os?.map((o, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            backgroundColor: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#cbd5e1"
                          }}
                        >
                          💻 {o.os}: <strong>{o.count}</strong>
                        </span>
                      ))}
                    </div>

                    {/* Browser list */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {visitorsData.charts?.browsers?.map((b, i) => (
                        <span
                          key={i}
                          style={{
                            padding: "3px 8px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            backgroundColor: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#94a3b8"
                          }}
                        >
                          🌐 {b.browser}: <strong>{b.count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Visited Pages */}
                <div style={styles.statusCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="link" style={{ color: "#F59E0B" }} /> Most Visited Pages
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                    {visitorsData.charts?.topPages && visitorsData.charts.topPages.length > 0 ? (
                      visitorsData.charts.topPages.slice(0, 5).map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)"
                          }}
                        >
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                            <span style={{ fontWeight: "700", color: "#60a5fa" }}>{p.page_path}</span>
                            {p.page_title && <span style={{ color: "#64748b", marginLeft: "6px", fontSize: "11px" }}>({p.page_title})</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: "#10B981", fontWeight: "700" }}>{p.views} views</span>
                            <span style={{ color: "#94a3b8", fontSize: "11px" }}>({formatDuration(Math.round(p.avg_time))})</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", margin: 0 }}>No pageviews yet.</p>
                    )}
                  </div>
                </div>

                {/* Traffic Sources & Locations */}
                <div style={styles.statusCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="campaign" style={{ color: "#EC4899" }} /> Sources & Top Locations
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                    {visitorsData.charts?.topSources && visitorsData.charts.topSources.length > 0 ? (
                      visitorsData.charts.topSources.slice(0, 3).map((s, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12px",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)"
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#e2e8f0" }}>{s.source_name}</span>
                          <span style={{ fontWeight: "700", color: "#EC4899" }}>{s.count} visits</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#94a3b8", fontSize: "12px", textAlign: "center", margin: 0 }}>No referral sources recorded.</p>
                    )}

                    {/* Top Cities */}
                    {visitorsData.charts?.topCities && visitorsData.charts.topCities.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {visitorsData.charts.topCities.slice(0, 4).map((c, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "11px",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              backgroundColor: "rgba(236, 72, 153, 0.1)",
                              color: "#f472b6",
                              border: "1px solid rgba(236, 72, 153, 0.2)"
                            }}
                          >
                            📍 {c.city}: {c.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Granular Real-time Visitor Stream Table */}
              <div style={{ ...styles.statusCard, marginTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon name="list_alt" style={{ color: "#3B82F6" }} /> Real-time Visitor Activity Log
                    </h3>
                    <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>
                      Showing {visitorsData.logs?.length || 0} of {visitorsData.pagination?.total || 0} recorded visitor sessions
                    </p>
                  </div>

                  {/* Search filter input */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", maxWidth: "360px" }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="text"
                        placeholder="Search IP, Country, Page, Referrer, UTM..."
                        value={visitorSearch}
                        onChange={(e) => {
                          setVisitorSearch(e.target.value);
                          setVisitorPage(1);
                          loadVisitorsData(visitorRange, e.target.value, 1);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px 8px 34px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.15)",
                          backgroundColor: "rgba(255,255,255,0.04)",
                          color: "#fff",
                          fontSize: "13px",
                          outline: "none"
                        }}
                      />
                      <Icon
                        name="search"
                        style={{
                          position: "absolute",
                          left: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontSize: "16px"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto", marginTop: "16px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left", color: "#94a3b8" }}>
                        <th style={{ padding: "12px 8px" }}>Status</th>
                        <th style={{ padding: "12px 8px" }}>Location & IP</th>
                        <th style={{ padding: "12px 8px" }}>Device / OS / Browser</th>
                        <th style={{ padding: "12px 8px" }}>Page Visited</th>
                        <th style={{ padding: "12px 8px" }}>Traffic Source</th>
                        <th style={{ padding: "12px 8px" }}>Time Spent</th>
                        <th style={{ padding: "12px 8px" }}>Visited At</th>
                        <th style={{ padding: "12px 8px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitorsData.logs && visitorsData.logs.length > 0 ? (
                        visitorsData.logs.map((log) => (
                          <tr
                            key={log.id}
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              backgroundColor: log.is_online ? "rgba(16, 185, 129, 0.05)" : "transparent"
                            }}
                          >
                            {/* Status */}
                            <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                              {log.is_online ? (
                                <span style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                                  color: "#10B981",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  padding: "3px 8px",
                                  borderRadius: "12px"
                                }}>
                                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }}></span>
                                  ONLINE NOW
                                </span>
                              ) : (
                                <span style={{ color: "#64748b", fontSize: "12px" }}>
                                  {formatTimeAgo(log.created_at)}
                                </span>
                              )}
                            </td>

                            {/* Location & IP */}
                            <td style={{ padding: "12px 8px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontSize: "16px" }}>{getCountryFlag(log.country_code)}</span>
                                  <span style={{ fontWeight: "700", color: "#fff" }}>
                                    {log.city && log.city !== "Unknown" ? `${log.city}, ` : ""}
                                    {log.country || "Unknown"}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: "11px",
                                  color: "#94a3b8",
                                  fontFamily: "monospace",
                                  backgroundColor: "rgba(255,255,255,0.04)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                  width: "fit-content"
                                }}>
                                  {log.ip_address || "127.0.0.1"}
                                </span>
                              </div>
                            </td>

                            {/* Device / OS / Browser */}
                            <td style={{ padding: "12px 8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Icon
                                  name={log.device_type === "Mobile" ? "smartphone" : log.device_type === "Tablet" ? "tablet" : "desktop_windows"}
                                  style={{ fontSize: "16px", color: log.device_type === "Mobile" ? "#38bdf8" : "#a78bfa" }}
                                />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{log.browser} on {log.os}</span>
                                  {log.screen_resolution && (
                                    <span style={{ color: "#64748b", fontSize: "11px" }}>{log.screen_resolution}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Page Visited */}
                            <td style={{ padding: "12px 8px", maxWidth: "220px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <a
                                  href={log.page_url || log.page_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: "#60a5fa", fontWeight: "700", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                  title={log.page_url}
                                >
                                  {log.page_path}
                                </a>
                                {log.page_title && (
                                  <span style={{ color: "#64748b", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {log.page_title}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Traffic Source */}
                            <td style={{ padding: "12px 8px", maxWidth: "160px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: log.referrer?.includes("google") ? "#34a853" : log.referrer?.includes("instagram") || log.referrer?.includes("facebook") ? "#e1306c" : "#cbd5e1"
                                }}>
                                  {log.referrer === "Direct" || !log.referrer ? "Direct Click" : log.referrer}
                                </span>
                                {log.utm_source && (
                                  <span style={{
                                    fontSize: "10px",
                                    color: "#f59e0b",
                                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                                    padding: "1px 4px",
                                    borderRadius: "3px",
                                    width: "fit-content"
                                  }}>
                                    UTM: {log.utm_source}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Time Spent */}
                            <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                              <span style={{
                                fontWeight: "700",
                                color: (log.duration_seconds || 0) > 30 ? "#10B981" : "#94a3b8",
                                fontSize: "12px"
                              }}>
                                ⏱️ {formatDuration(log.duration_seconds)}
                              </span>
                            </td>

                            {/* Visited At */}
                            <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ color: "#fff", fontWeight: "600", fontSize: "12px" }}>
                                  {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "—"}
                                </span>
                                <span style={{ color: "#64748b", fontSize: "11px" }}>
                                  {log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}
                                </span>
                              </div>
                            </td>

                            {/* Action */}
                            <td style={{ padding: "12px 8px" }}>
                              <button
                                onClick={() => handleDeleteVisitorLog(log.id)}
                                style={styles.deleteBtnIconOnly}
                                title="Delete Visitor Record"
                              >
                                <Icon name="delete" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ padding: "40px 8px", textAlign: "center", color: "#94a3b8" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                              <Icon name="radar" style={{ fontSize: "36px", color: "#64748b" }} />
                              <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: "#cbd5e1" }}>No visitor logs recorded yet</p>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>
                                New visitors who browse or click links on https://www.aidigital.biz/ will automatically show up here in real-time!
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {visitorsData.pagination && visitorsData.pagination.totalPages > 1 && (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "13px",
                    color: "#94a3b8"
                  }}>
                    <span>
                      Page {visitorsData.pagination.page} of {visitorsData.pagination.totalPages} ({visitorsData.pagination.total} total visits)
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          const prevPage = Math.max(1, visitorPage - 1);
                          setVisitorPage(prevPage);
                          loadVisitorsData(visitorRange, visitorSearch, prevPage);
                        }}
                        disabled={visitorPage <= 1}
                        style={{
                          ...styles.refreshBtn,
                          padding: "6px 14px",
                          opacity: visitorPage <= 1 ? 0.4 : 1,
                          cursor: visitorPage <= 1 ? "not-allowed" : "pointer"
                        }}
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => {
                          const nextPage = Math.min(visitorsData.pagination.totalPages, visitorPage + 1);
                          setVisitorPage(nextPage);
                          loadVisitorsData(visitorRange, visitorSearch, nextPage);
                        }}
                        disabled={visitorPage >= visitorsData.pagination.totalPages}
                        style={{
                          ...styles.refreshBtn,
                          padding: "6px 14px",
                          opacity: visitorPage >= visitorsData.pagination.totalPages ? 0.4 : 1,
                          cursor: visitorPage >= visitorsData.pagination.totalPages ? "not-allowed" : "pointer"
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "visibility" && (
            <VisibilityManager
              showToast={showToast}
              onCountUpdate={setVisibilityCounts}
            />
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  loginContainer: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    padding: "20px",
    fontFamily: "Inter, sans-serif"
  },
  loginCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "40px 32px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
    justifyContent: "center"
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(to top right, #3B82F6, #FD7E14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "800",
    fontSize: "12px"
  },
  logoText: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.025em"
  },
  loginSubtitle: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "28px"
  },
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  inputGroupFluid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1
  },
  label: {
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "600"
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  },
  textarea: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit"
  },
  select: {
    backgroundColor: "rgba(9, 13, 22, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none"
  },
  errorAlert: {
    color: "#f87171",
    fontSize: "12px",
    textAlign: "center"
  },
  loginButton: {
    backgroundColor: "#FD7E14",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.2s"
  },
  adminWrapper: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    color: "#f8fafc",
    fontFamily: "Inter, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(10px)"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  headerTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: 0,
    lineHeight: "1.2"
  },
  headerSubtitle: {
    fontSize: "11px",
    color: "#94a3b8"
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#cbd5e1",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px"
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    minHeight: "calc(100vh - 69px)"
  },
  sidebar: {
    padding: "24px 16px",
    borderRight: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  sidebarBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    color: "#94a3b8",
    padding: "10px 14px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px"
  },
  sidebarBtnActive: {
    backgroundColor: "rgba(253, 126, 20, 0.15)",
    color: "#FD7E14"
  },
  content: {
    padding: "32px 40px",
    overflowY: "auto",
    maxHeight: "calc(100vh - 69px)"
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#3B2FC9",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px"
  },
  cancelBtn: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#cbd5e1",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },
  tabRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px"
  },
  tabSelectBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.08)",
    color: "#94a3b8",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },
  tabSelectBtnActive: {
    backgroundColor: "#fff",
    color: "#0f172a",
    borderColor: "#fff"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "24px",
    marginBottom: "32px"
  },
  infoBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "rgba(253, 126, 20, 0.08)",
    border: "1px solid rgba(253, 126, 20, 0.25)",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "24px",
    fontSize: "13px",
    color: "#e2e8f0"
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  switchLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  toast: {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 9999,
    padding: "12px 24px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  portfolioSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "40px",
    marginBottom: "16px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    paddingBottom: "8px"
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#FD7E14",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
  },
  addBtnSmall: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600"
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "transparent",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#ef4444",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px"
  },
  inputRow: {
    display: "flex",
    gap: "16px"
  },
  industryBox: {
    backgroundColor: "rgba(255,255,255,0.01)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px"
  },
  industryTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px"
  },
  projectListGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px"
  },
  projectItemCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "6px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  inputSmall: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "4px",
    padding: "6px 10px",
    color: "#fff",
    fontSize: "12px",
    outline: "none",
    flex: 1
  },
  textareaSmall: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "4px",
    padding: "6px 10px",
    color: "#fff",
    fontSize: "12px",
    outline: "none",
    width: "100%",
    fontFamily: "inherit"
  },
  selectSmall: {
    backgroundColor: "rgba(9, 13, 22, 0.9)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "4px",
    padding: "6px",
    color: "#fff",
    fontSize: "12px",
    outline: "none"
  },
  deleteBtnIcon: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  mediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px"
  },
  mediaCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  mediaCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  mediaTypeLabel: {
    fontSize: "10px",
    textTransform: "uppercase",
    backgroundColor: "#3B2FC9",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "700"
  },
  inputGroupSmall: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  labelSmall: {
    fontSize: "10px",
    color: "#94a3b8"
  },
  blogListGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px"
  },
  blogAdminCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "16px"
  },
  blogMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px"
  },
  blogCategoryTag: {
    fontSize: "10px",
    color: "#FD7E14",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  blogPublishedTag: {
    fontSize: "10px",
    color: "#10B981",
    fontWeight: "600"
  },
  blogDraftTag: {
    fontSize: "10px",
    color: "#f59e0b",
    fontWeight: "600"
  },
  blogAdminTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "8px"
  },
  blogAdminExcerpt: {
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: "1.4"
  },
  blogAdminActionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "12px",
    marginTop: "8px"
  },
  editBtnSmall: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600"
  },
  deleteBtnIconOnly: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center"
  },
  blogFormContainer: {
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center"
  },
  glowSphere1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
    top: "10%",
    left: "10%",
    zIndex: 0,
    pointerEvents: "none"
  },
  glowSphere2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(253, 126, 20, 0.12) 0%, rgba(0, 0, 0, 0) 70%)",
    bottom: "10%",
    right: "10%",
    zIndex: 0,
    pointerEvents: "none"
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "24px",
    marginTop: "20px"
  },
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backdropFilter: "blur(12px)"
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase"
  },
  cardDesc: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.5"
  },
  databaseActions: {
    marginTop: "auto"
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#3B2FC9",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    width: "100%",
    transition: "background-color 0.2s"
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#cbd5e1",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },
  statsSummaryGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  miniCard: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backdropFilter: "blur(12px)"
  },
  miniCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600"
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#fff",
    margin: 0
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b"
  }
};
