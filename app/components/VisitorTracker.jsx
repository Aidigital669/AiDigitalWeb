"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Generate unique identifier
function generateId(prefix = "id") {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomStr}`;
}

// Get or create persistent visitor ID (localStorage)
function getVisitorId() {
  if (typeof window === "undefined") return { vid: "", isNew: false };
  try {
    let vid = localStorage.getItem("ai_visitor_id") || localStorage.getItem("aidigital_vid");
    let isNew = false;
    if (!vid) {
      vid = generateId("v");
      localStorage.setItem("ai_visitor_id", vid);
      localStorage.setItem("aidigital_vid", vid);
      isNew = true;
    }
    return { vid, isNew };
  } catch (e) {
    return { vid: generateId("v"), isNew: false };
  }
}

// Get or create session ID (sessionStorage)
function getSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let sid = sessionStorage.getItem("ai_session_id") || sessionStorage.getItem("aidigital_sid");
    if (!sid) {
      sid = generateId("s");
      sessionStorage.setItem("ai_session_id", sid);
      sessionStorage.setItem("aidigital_sid", sid);
    }
    return sid;
  } catch (e) {
    return generateId("s");
  }
}

// Check if current user is an authenticated admin
function isAdminSession() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("admin_session=authenticated");
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTimeRef = useRef(Date.now());
  const heartbeatTimerRef = useRef(null);
  const currentRecordIdRef = useRef(null);
  const isExcludedRef = useRef(false);

  useEffect(() => {
    // Automatically ignore admin panel visits and requests with active admin sessions
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api") || isAdminSession()) {
      isExcludedRef.current = true;
      return;
    }
    isExcludedRef.current = false;

    const { vid, isNew } = getVisitorId();
    const sid = getSessionId();
    startTimeRef.current = Date.now();

    // Extract UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") || "";
    const utmMedium = params.get("utm_medium") || "";
    const utmCampaign = params.get("utm_campaign") || "";

    const payload = {
      visitor_id: vid,
      session_id: sid,
      is_new_visitor: isNew ? 1 : 0,
      page_url: window.location.href,
      page_path: pathname || "/",
      page_title: document.title || "BizzMaker",
      referrer: document.referrer || "Direct",
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      screen_resolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      language: navigator.language || navigator.userLanguage || "en",
    };

    // Track initial page visit
    const sendVisit = async () => {
      try {
        const res = await fetch("/api/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.record_id) {
            currentRecordIdRef.current = data.record_id;
          }
        }
      } catch (err) {
        // Silent catch to avoid interfering with user browsing
      }
    };

    sendVisit();

    // Periodic heartbeat (every 25 seconds) to calculate real-time duration and detect live presence
    const sendHeartbeat = () => {
      if (document.visibilityState === "hidden" || isExcludedRef.current) return;
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const heartbeatPayload = {
        record_id: currentRecordIdRef.current,
        visitor_id: vid,
        session_id: sid,
        page_path: pathname || "/",
        duration_seconds: durationSeconds,
      };

      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(heartbeatPayload)], {
            type: "application/json; charset=UTF-8",
          });
          navigator.sendBeacon("/api/track-visit", blob);
        } else {
          fetch("/api/track-visit", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(heartbeatPayload),
            keepalive: true,
          }).catch(() => {});
        }
      } catch (e) {}
    };

    heartbeatTimerRef.current = setInterval(sendHeartbeat, 25000);

    // Send final update when user navigates away or switches tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendHeartbeat();
      }
    };

    const handleBeforeUnload = () => {
      sendHeartbeat();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sendHeartbeat();
    };
  }, [pathname, searchParams]);

  return null;
}
