"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import defaultData from "../../data/visibilitySettings.json";

// Bump this version string any time default visibility settings change.
// This automatically clears the browser sessionStorage cache.
const CACHE_VERSION = "v5-realestate-only";
const CACHE_KEY = `ai_visibility_settings_${CACHE_VERSION}`;

const VisibilityContext = createContext({
  visibility: defaultData?.settings || {},
  isLoading: false,
  isVisible: () => true,
  isPageVisible: () => true,
  isSectionVisible: () => true,
  refreshVisibility: async () => {},
});

export function VisibilityProvider({ children }) {
  // Start with defaults from JSON file (non-real estate industries are false by default)
  const [visibility, setVisibility] = useState(defaultData?.settings || {});
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisibility = useCallback(async () => {
    try {
      const res = await fetch("/api/visibility?t=" + Date.now(), {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.visibility) {
          setVisibility(data.visibility);
          try {
            // Clear ALL old cache keys (previous versions)
            Object.keys(sessionStorage).forEach((key) => {
              if (key.startsWith("ai_visibility_settings")) {
                sessionStorage.removeItem(key);
              }
            });
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data.visibility));
          } catch (e) {
            // ignore storage errors
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch latest visibility settings:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only use cached value if it's from the current version
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        setVisibility(JSON.parse(cached));
      }
    } catch (e) {
      // ignore
    }

    // Always fetch fresh data from server on mount
    fetchVisibility();

    // Re-check every 30 seconds and on window focus
    const handleFocus = () => fetchVisibility();
    window.addEventListener("focus", handleFocus);
    const interval = setInterval(fetchVisibility, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [fetchVisibility]);

  const isVisible = useCallback(
    (id, defaultVal = true) => {
      if (!id) return defaultVal;
      if (Object.prototype.hasOwnProperty.call(visibility, id)) {
        return Boolean(visibility[id]);
      }
      return defaultVal;
    },
    [visibility]
  );

  const isPageVisible = useCallback(
    (pageKey) => {
      if (!pageKey) return true;
      const cleanKey = pageKey.replace(/^\//, "").trim() || "home";
      const fullKey = cleanKey.startsWith("page_") ? cleanKey : `page_${cleanKey}`;
      return isVisible(fullKey, true);
    },
    [isVisible]
  );

  const isSectionVisible = useCallback(
    (sectionKey) => {
      return isVisible(sectionKey, true);
    },
    [isVisible]
  );

  return (
    <VisibilityContext.Provider
      value={{
        visibility,
        isLoading,
        isVisible,
        isPageVisible,
        isSectionVisible,
        refreshVisibility: fetchVisibility,
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility() {
  const context = useContext(VisibilityContext);
  if (!context) {
    return {
      visibility: {},
      isLoading: false,
      isVisible: () => true,
      isPageVisible: () => true,
      isSectionVisible: () => true,
      refreshVisibility: async () => {},
    };
  }
  return context;
}
