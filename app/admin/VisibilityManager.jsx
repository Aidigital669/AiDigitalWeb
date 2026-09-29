"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

function Icon({ name, className = "", style = {} }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ verticalAlign: "middle", ...style }} aria-hidden="true">
      {name}
    </span>
  );
}

const GROUP_CONFIG = {
  home: {
    title: "Home Page (/)",
    subtitle: "Main website landing page & conversion sections",
    icon: "home",
    color: "#2563EB",
    pageId: "page_home",
    previewUrl: "/",
  },
  pricing: {
    title: "Pricing Plans Page (/pricing)",
    subtitle: "Packages for Ads, Websites, AI Videos & Creative Packs",
    icon: "sell",
    color: "#10B981",
    pageId: "page_pricing",
    previewUrl: "/pricing",
  },
  portfolio: {
    title: "Portfolio Showcase (/portfolio)",
    subtitle: "Case studies, verified metrics & client creative gallery",
    icon: "dashboard",
    color: "#8B5CF6",
    pageId: "page_portfolio",
    previewUrl: "/portfolio",
  },
  blog: {
    title: "Blogs & Insights (/blog)",
    subtitle: "Articles, marketing tutorials & knowledge base",
    icon: "article",
    color: "#F59E0B",
    pageId: "page_blog",
    previewUrl: "/blog",
  },
  careers: {
    title: "Careers & Hiring (/careers)",
    subtitle: "Open positions, company perks & candidate applications",
    icon: "work",
    color: "#EC4899",
    pageId: "page_careers",
    previewUrl: "/careers",
  },
  checkout: {
    title: "Cart & Checkout (/cart, /checkout)",
    subtitle: "Shopping cart verification and payment gateway",
    icon: "shopping_cart_checkout",
    color: "#06B6D4",
    pageId: "page_checkout",
    previewUrl: "/checkout",
  },
  global: {
    title: "Global Elements & Floating Widgets",
    subtitle: "Header nav, footer, WhatsApp launcher, and AI live chat",
    icon: "widgets",
    color: "#FD7E14",
    pageId: null,
    previewUrl: "/",
  },
  custom: {
    title: "Custom Sections & Components",
    subtitle: "Dynamically added elements and custom hooks",
    icon: "extension",
    color: "#64748B",
    pageId: null,
    previewUrl: "/",
  },
};

export default function VisibilityManager({ showToast, onCountUpdate }) {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ total: 0, visible: 0, hidden: 0, pages: 0, sections: 0, widgets: 0 });
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    id: "",
    name: "",
    page_group: "home",
    type: "section",
    description: "",
    is_visible: true,
  });

  const lastReportedCountsRef = useRef(null);

  // Safely notify parent (AdminPage) of count updates outside the render phase
  useEffect(() => {
    if (typeof onCountUpdate === "function" && counts && counts.total > 0) {
      const serialized = JSON.stringify(counts);
      if (lastReportedCountsRef.current !== serialized) {
        lastReportedCountsRef.current = serialized;
        onCountUpdate(counts);
      }
    }
  }, [counts, onCountUpdate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/visibility?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
          if (data.counts) {
            setCounts(data.counts);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load visibility:", err);
      showToast("Error loading visibility configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    const nextStatus = !currentStatus;

    // Optimistic UI update
    setUpdatingIds((prev) => new Set(prev).add(id));
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, is_visible: nextStatus } : it))
    );
    setCounts((prev) => ({
      ...prev,
      visible: nextStatus ? prev.visible + 1 : prev.visible - 1,
      hidden: nextStatus ? prev.hidden - 1 : prev.hidden + 1,
    }));

    try {
      const res = await fetch("/api/admin/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_visible: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const itemObj = items.find((i) => i.id === id);
        showToast(
          `${itemObj?.name || id} is now ${nextStatus ? "VISIBLE" : "HIDDEN"}`
        );
      } else {
        showToast(data.error || "Failed to update visibility", "error");
        loadData();
      }
    } catch (err) {
      showToast("Network error updating status", "error");
      loadData();
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggleGroup = async (groupKey, newStatus) => {
    const label = GROUP_CONFIG[groupKey]?.title || groupKey;
    if (
      !confirm(
        `Are you sure you want to ${newStatus ? "SHOW" : "HIDE"} all elements in ${label}?`
      )
    ) {
      return;
    }

    // Optimistic update
    setItems((prev) =>
      prev.map((it) =>
        it.page_group === groupKey ? { ...it, is_visible: newStatus } : it
      )
    );

    try {
      const res = await fetch("/api/admin/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_group: groupKey, is_visible: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Updated ${label}`);
        loadData();
      } else {
        showToast(data.error || "Failed to update group", "error");
        loadData();
      }
    } catch (err) {
      showToast("Network error updating group", "error");
      loadData();
    }
  };

  const handleResetAll = async () => {
    if (
      !confirm(
        "Are you sure you want to reset ALL pages and sections across the entire website to VISIBLE?"
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/admin/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_all" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("All pages and sections are now VISIBLE!");
        loadData();
      } else {
        showToast(data.error || "Failed to reset visibility", "error");
      }
    } catch (err) {
      showToast("Network error resetting", "error");
    }
  };

  const handleSaveCustom = async (e) => {
    e.preventDefault();
    if (!newForm.id || !newForm.name) {
      showToast("Please enter an ID and Name", "error");
      return;
    }
    const cleanId = newForm.id.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    try {
      const res = await fetch("/api/admin/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          item: { ...newForm, id: cleanId },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Custom section added!");
        setShowAddModal(false);
        setNewForm({
          id: "",
          name: "",
          page_group: "home",
          type: "section",
          description: "",
          is_visible: true,
        });
        loadData();
      } else {
        showToast(data.error || "Failed to add section", "error");
      }
    } catch (err) {
      showToast("Network error saving section", "error");
    }
  };

  // Group and filter items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      // Group filter
      if (filterGroup === "hidden" && it.is_visible) return false;
      if (filterGroup === "pages" && it.type !== "page") return false;
      if (filterGroup === "widgets" && it.type !== "widget") return false;
      if (
        filterGroup !== "all" &&
        filterGroup !== "hidden" &&
        filterGroup !== "pages" &&
        filterGroup !== "widgets" &&
        it.page_group !== filterGroup
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = it.name?.toLowerCase().includes(q);
        const matchesId = it.id?.toLowerCase().includes(q);
        const matchesDesc = it.description?.toLowerCase().includes(q);
        const matchesGroup = it.page_group?.toLowerCase().includes(q);
        return matchesName || matchesId || matchesDesc || matchesGroup;
      }

      return true;
    });
  }, [items, filterGroup, searchQuery]);

  // Group items by page_group
  const groupedData = useMemo(() => {
    const groups = {};
    Object.keys(GROUP_CONFIG).forEach((gk) => {
      groups[gk] = [];
    });

    filteredItems.forEach((it) => {
      const g = it.page_group || "custom";
      if (!groups[g]) groups[g] = [];
      groups[g].push(it);
    });

    return groups;
  }, [filteredItems]);

  return (
    <div style={{ color: "#fff", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Header Card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                background: "rgba(37, 99, 235, 0.2)",
                color: "#60A5FA",
                padding: "8px",
                borderRadius: "10px",
                display: "inline-flex",
              }}
            >
              <Icon name="tune" style={{ fontSize: "24px" }} />
            </span>
            <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
              Page & Section Visibility Controls
            </h2>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0, maxWidth: "680px" }}>
            Master switchboard: Instantly show or hide any full page, specific section, or floating widget across the entire website in real-time.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={loadData}
            style={actionBtnStyle}
            title="Reload current visibility settings"
          >
            <Icon name="sync" className={loading ? "spin" : ""} style={{ fontSize: "18px" }} /> Refresh
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...actionBtnStyle,
              background: "rgba(37, 99, 235, 0.15)",
              borderColor: "rgba(37, 99, 235, 0.4)",
              color: "#93c5fd",
              textDecoration: "none",
            }}
          >
            <Icon name="open_in_new" style={{ fontSize: "18px" }} /> Preview Site
          </a>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              ...actionBtnStyle,
              background: "rgba(16, 185, 129, 0.15)",
              borderColor: "rgba(16, 185, 129, 0.4)",
              color: "#6ee7b7",
            }}
          >
            <Icon name="add" style={{ fontSize: "18px" }} /> Add Element
          </button>

          <button
            onClick={handleResetAll}
            style={{
              ...actionBtnStyle,
              background: "rgba(239, 68, 68, 0.12)",
              borderColor: "rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
            title="Make all pages and sections visible"
          >
            <Icon name="restart_alt" style={{ fontSize: "18px" }} /> Reset All
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={statCardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Total Elements</span>
            <Icon name="layers" style={{ color: "#60A5FA", fontSize: "20px" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginTop: "8px" }}>
            {counts.total}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {counts.pages} Pages • {counts.sections} Sections • {counts.widgets} Widgets
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Visible (Active)</span>
            <Icon name="visibility" style={{ color: "#10B981", fontSize: "20px" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#10B981", marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            {counts.visible}
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
          </div>
          <div style={{ fontSize: "12px", color: "#10B981", marginTop: "4px" }}>
            {counts.total > 0 ? Math.round((counts.visible / counts.total) * 100) : 0}% of site visible
          </div>
        </div>

        <div
          style={{
            ...statCardStyle,
            borderColor: counts.hidden > 0 ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.08)",
            background: counts.hidden > 0 ? "rgba(239, 68, 68, 0.06)" : "rgba(255, 255, 255, 0.02)",
            cursor: "pointer",
          }}
          onClick={() => setFilterGroup(filterGroup === "hidden" ? "all" : "hidden")}
          title="Click to toggle hidden filter"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: counts.hidden > 0 ? "#fca5a5" : "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>
              Hidden (Offline)
            </span>
            <Icon name="visibility_off" style={{ color: counts.hidden > 0 ? "#ef4444" : "#64748b", fontSize: "20px" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: counts.hidden > 0 ? "#ef4444" : "#64748b", marginTop: "8px" }}>
            {counts.hidden}
          </div>
          <div style={{ fontSize: "12px", color: counts.hidden > 0 ? "#f87171" : "#64748b", marginTop: "4px" }}>
            {counts.hidden > 0 ? "Click to view hidden items" : "All elements are visible"}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Site Status</span>
            <Icon name="verified_user" style={{ color: counts.hidden === 0 ? "#10B981" : "#F59E0B", fontSize: "20px" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: counts.hidden === 0 ? "#10B981" : "#F59E0B", marginTop: "12px" }}>
            {counts.hidden === 0 ? "100% Fully Live" : "Partially Tailored"}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            Live sync to Database & JSON
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "14px",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Icon
              name="search"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "18px",
              }}
            />
            <input
              type="text"
              placeholder="Search by name, ID, or description (e.g. 'hero', 'pricing', 'whatsapp')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 42px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <Icon name="close" style={{ fontSize: "16px" }} />
              </button>
            )}
          </div>

          {searchQuery && (
            <span style={{ fontSize: "13px", color: "#60A5FA", fontWeight: "600" }}>
              Found {filteredItems.length} match{filteredItems.length === 1 ? "" : "es"}
            </span>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Elements", icon: "select_all", count: items.length },
            { key: "pages", label: "Pages Only", icon: "web", count: items.filter((i) => i.type === "page").length },
            { key: "home", label: "Home Page", icon: "home", count: items.filter((i) => i.page_group === "home").length },
            { key: "pricing", label: "Pricing Page", icon: "sell", count: items.filter((i) => i.page_group === "pricing").length },
            { key: "portfolio", label: "Portfolio", icon: "dashboard", count: items.filter((i) => i.page_group === "portfolio").length },
            { key: "blog", label: "Blogs", icon: "article", count: items.filter((i) => i.page_group === "blog").length },
            { key: "careers", label: "Careers", icon: "work", count: items.filter((i) => i.page_group === "careers").length },
            { key: "checkout", label: "Cart / Checkout", icon: "shopping_cart", count: items.filter((i) => i.page_group === "checkout").length },
            { key: "global", label: "Global / Widgets", icon: "widgets", count: items.filter((i) => i.page_group === "global").length },
            { key: "hidden", label: `Hidden (${counts.hidden})`, icon: "visibility_off", count: counts.hidden },
          ].map((pill) => {
            const isActive = filterGroup === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setFilterGroup(pill.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  border: isActive ? "1px solid #2563EB" : "1px solid rgba(255, 255, 255, 0.08)",
                  background: isActive ? "#2563EB" : "rgba(255, 255, 255, 0.04)",
                  color: isActive ? "#fff" : pill.key === "hidden" && pill.count > 0 ? "#f87171" : "#94a3b8",
                }}
              >
                <Icon name={pill.icon} style={{ fontSize: "15px" }} />
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Groups List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {Object.entries(GROUP_CONFIG).map(([groupKey, conf]) => {
          const groupItems = groupedData[groupKey] || [];
          if (groupItems.length === 0) return null;

          // Find if there is a main page item for this group
          const pageItem = groupItems.find((i) => i.type === "page" || i.id === conf.pageId);
          const isPageOff = pageItem && !pageItem.is_visible;
          const sectionItems = groupItems.filter((i) => i.id !== pageItem?.id);

          return (
            <div
              key={groupKey}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: isPageOff
                  ? "1px solid rgba(239, 68, 68, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              {/* Group Header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  background: isPageOff
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(255, 255, 255, 0.02)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      backgroundColor: `${conf.color}22`,
                      color: conf.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={conf.icon} style={{ fontSize: "22px" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700" }}>{conf.title}</h3>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.06)",
                          color: "#94a3b8",
                        }}
                      >
                        {groupItems.length} elements
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: "13px" }}>
                      {conf.subtitle}
                    </p>
                  </div>
                </div>

                {/* Group Level Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  {conf.previewUrl && (
                    <a
                      href={conf.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "#94a3b8",
                        textDecoration: "none",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <Icon name="open_in_new" style={{ fontSize: "15px" }} /> View Page
                    </a>
                  )}

                  <button
                    onClick={() => handleToggleGroup(groupKey, true)}
                    style={{
                      ...groupActionBtnStyle,
                      color: "#6ee7b7",
                      borderColor: "rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                    }}
                    title="Enable all sections in this group"
                  >
                    <Icon name="check" style={{ fontSize: "14px" }} /> Show All
                  </button>

                  <button
                    onClick={() => handleToggleGroup(groupKey, false)}
                    style={{
                      ...groupActionBtnStyle,
                      color: "#fca5a5",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                      background: "rgba(239, 68, 68, 0.08)",
                    }}
                    title="Hide all sections in this group"
                  >
                    <Icon name="block" style={{ fontSize: "14px" }} /> Hide All
                  </button>

                  {/* If this group has a master Page switch */}
                  {pageItem && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "6px 14px",
                        borderRadius: "10px",
                        background: pageItem.is_visible
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.2)",
                        border: `1px solid ${pageItem.is_visible ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: pageItem.is_visible ? "#6ee7b7" : "#fca5a5",
                        }}
                      >
                        Entire Page: {pageItem.is_visible ? "ONLINE" : "OFFLINE"}
                      </span>
                      <ToggleSwitch
                        checked={pageItem.is_visible}
                        onChange={() => handleToggle(pageItem.id, pageItem.is_visible)}
                        loading={updatingIds.has(pageItem.id)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Warning if Entire Page is Disabled */}
              {isPageOff && (
                <div
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Icon name="warning" style={{ fontSize: "18px", color: "#f87171" }} />
                  <strong>Entire {conf.title} is currently HIDDEN.</strong> Direct visitors will see the maintenance screen, and navbar links to this page are hidden.
                </div>
              )}

              {/* Grid of Sections */}
              <div
                style={{
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "16px",
                }}
              >
                {sectionItems.map((item) => {
                  const isUpdating = updatingIds.has(item.id);
                  const isWidget = item.type === "widget";

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: item.is_visible
                          ? "1px solid rgba(255, 255, 255, 0.08)"
                          : "1px solid rgba(239, 68, 68, 0.3)",
                        backgroundColor: item.is_visible
                          ? "rgba(255, 255, 255, 0.02)"
                          : "rgba(239, 68, 68, 0.04)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div>
                        {/* Top row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <div>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: isWidget
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : "rgba(59, 130, 246, 0.15)",
                                color: isWidget ? "#fbbf24" : "#60a5fa",
                              }}
                            >
                              {item.type}
                            </span>
                            <h4
                              style={{
                                margin: "6px 0 2px 0",
                                fontSize: "15px",
                                fontWeight: "700",
                                color: item.is_visible ? "#fff" : "#94a3b8",
                                textDecoration: item.is_visible ? "none" : "line-through",
                              }}
                            >
                              {item.name}
                            </h4>
                          </div>

                          <ToggleSwitch
                            checked={item.is_visible}
                            onChange={() => handleToggle(item.id, item.is_visible)}
                            loading={isUpdating}
                          />
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom status badge and technical ID */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: "10px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                          fontSize: "11px",
                        }}
                      >
                        <code style={{ color: "#475569", background: "rgba(255,255,255,0.02)", padding: "2px 5px", borderRadius: "4px" }}>
                          {item.id}
                        </code>

                        <span
                          style={{
                            fontWeight: "700",
                            color: item.is_visible ? "#10B981" : "#ef4444",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: item.is_visible ? "#10B981" : "#ef4444",
                              boxShadow: item.is_visible ? "0 0 6px #10B981" : "0 0 6px #ef4444",
                            }}
                          />
                          {item.is_visible ? "VISIBLE" : "HIDDEN"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Register a Custom Section */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="add_circle" style={{ color: "#3B82F6" }} /> Register Section or Page
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <Icon name="close" style={{ fontSize: "20px" }} />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Element ID (Key used in code)</label>
                <input
                  type="text"
                  placeholder="e.g. holiday_promo_banner"
                  value={newForm.id}
                  onChange={(e) => setNewForm({ ...newForm, id: e.target.value })}
                  required
                  style={inputStyle}
                />
                <small style={{ color: "#64748b", fontSize: "11px", marginTop: "4px", display: "block" }}>
                  Used with isVisible(&quot;{newForm.id || 'your_id'}&quot;) in JSX
                </small>
              </div>

              <div>
                <label style={labelStyle}>Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Holiday Promo Banner"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Page Group</label>
                  <select
                    value={newForm.page_group}
                    onChange={(e) => setNewForm({ ...newForm, page_group: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="home">Home Page</option>
                    <option value="pricing">Pricing</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="blog">Blogs</option>
                    <option value="careers">Careers</option>
                    <option value="checkout">Cart / Checkout</option>
                    <option value="global">Global / Widgets</option>
                    <option value="custom">Custom Other</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Element Type</label>
                  <select
                    value={newForm.type}
                    onChange={(e) => setNewForm({ ...newForm, type: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="section">Section</option>
                    <option value="page">Full Page</option>
                    <option value="widget">Floating Widget</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description (Optional)</label>
                <textarea
                  placeholder="Brief description of what this section controls..."
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ ...actionBtnStyle, background: "rgba(255,255,255,0.05)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...actionBtnStyle,
                    background: "#2563EB",
                    borderColor: "#3B82F6",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Modern iOS-style toggle switch
function ToggleSwitch({ checked, onChange, loading = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={loading}
      style={{
        position: "relative",
        width: "48px",
        height: "26px",
        borderRadius: "13px",
        backgroundColor: checked ? "#10B981" : "rgba(255, 255, 255, 0.15)",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        padding: "2px",
        outline: "none",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transform: checked ? "translateX(22px)" : "translateX(0px)",
          transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

const actionBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  color: "#fff",
  padding: "8px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const groupActionBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "5px 10px",
  borderRadius: "6px",
  border: "1px solid",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

const statCardStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.02)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  padding: "18px 20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#94a3b8",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};
