"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import defaultData from "../../data/visibilitySettings.json";

const VisibilityContext = createContext({
  visibility: defaultData?.settings || {},
  isLoading: false,
  isVisible: () => true,
  isPageVisible: () => true,
  isSectionVisible: () => true,
  refreshVisibility: async () => {},
});

export function VisibilityProvider({ children }) {
  const [visibility, setVisibility] = useState(defaultData?.settings || {});
  const [isLoading, setIsLoading] = useState(false);

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
            sessionStorage.setItem("ai_visibility_settings", JSON.stringify(data.visibility));
          } catch (e) {
            // ignore
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
    // Check sessionStorage cache first for instant hydration
    try {
      const cached = sessionStorage.getItem("ai_visibility_settings");
      if (cached) {
        setVisibility(JSON.parse(cached));
      }
    } catch (e) {
      // ignore
    }

    fetchVisibility();

    // Re-check periodically every 60 seconds (or on window focus)
    const handleFocus = () => fetchVisibility();
    window.addEventListener("focus", handleFocus);
    const interval = setInterval(fetchVisibility, 60000);

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
