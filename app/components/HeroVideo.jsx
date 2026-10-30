"use client";

import React, { useRef, useState, useEffect } from "react";
import PricingPopup from "./PricingPopup";
import { Icon } from "./SiteChrome";

export default function HeroVideo() {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const manuallyPausedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayFeedback, setShowPlayFeedback] = useState(false);

  // Triggers the pricing popup natively with a 10-second delay when the page renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        dialogRef.current.showModal();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Ensure autoplay on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  // Auto-pause video when scrolled away from video section, resume when scrolled back into view
  useEffect(() => {
    const target = containerRef.current || videoRef.current;
    if (!target) return;

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        const video = videoRef.current;
        if (!video) return;

        if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
          // Scrolled out of the video header section -> pause/stop video
          if (!video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        } else {
          // Scrolled back into view -> resume playing if user didn't manually pause
          if (video.paused && !manuallyPausedRef.current) {
            video.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {});
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.15, 0.5]
    });

    observer.observe(target);

    // Instant fallback for fast scrolling
    const handleScroll = () => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container) return;

      const rect = container.getBoundingClientRect();
      // If header is scrolled past the viewport
      if (rect.bottom <= 50 || rect.top >= window.innerHeight) {
        if (!video.paused) {
          video.pause();
          setIsPlaying(false);
        }
      } else if (rect.bottom > 100 && rect.top < window.innerHeight - 100) {
        if (video.paused && !manuallyPausedRef.current) {
          video.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {});
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        manuallyPausedRef.current = false;
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        manuallyPausedRef.current = true;
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowPlayFeedback(true);
      setTimeout(() => setShowPlayFeedback(false), 700);
    }
  };

  return (
    <div className="hero-full-video-header" ref={containerRef} aria-label="Header Video">
      {/* Background Pricing Lead Modal (opens on 10s delay) */}
      <PricingPopup dialogRef={dialogRef} />

      {/* Full Header Video (100% full brightness & opacity, zero dark overlays) */}
      <video
        ref={videoRef}
        src="/Header.mp4"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        preload="auto"
        onClick={togglePlay}
        className="hero-header-main-video"
      />

      {/* Click feedback animation (Play/Pause ripple) */}
      {showPlayFeedback && (
        <div className="hero-video-ripple-feedback" aria-hidden="true">
          <div className="ripple-circle">
            <Icon name={isPlaying ? "play_arrow" : "pause"} />
          </div>
        </div>
      )}

      {/* Floating Animated Sound Controls */}
      <div className="hero-video-controls-overlay">
        <button
          type="button"
          className={`hero-video-sound-pill ${!isMuted ? "sound-active" : ""}`}
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          <span className="sound-pulse-ring" aria-hidden="true" />
          <Icon name={isMuted ? "volume_off" : "volume_up"} />
          <span>{isMuted ? "Sound On" : "Playing Sound"}</span>
          {!isMuted && (
            <span className="sound-equalizer-bars" aria-hidden="true">
              <span className="eq-bar bar-1" />
              <span className="eq-bar bar-2" />
              <span className="eq-bar bar-3" />
            </span>
          )}
        </button>

        <button
          type="button"
          className="hero-video-play-pill"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          title={isPlaying ? "Pause video" : "Play video"}
        >
          <Icon name={isPlaying ? "pause" : "play_arrow"} />
        </button>
      </div>

      {/* Animated Luxury Shimmer Light Border at bottom of header */}
      <div className="hero-header-shimmer-line" aria-hidden="true">
        <div className="shimmer-light-beam" />
      </div>
    </div>
  );
}
