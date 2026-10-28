"use client";

import React, { useRef, useState, useEffect } from "react";
import PricingPopup from "./PricingPopup";
import { Icon } from "./SiteChrome";

export default function HeroVideo() {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

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

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(current);
    }
  };

  return (
    <div className="hero-video-section" aria-label="Hero Video Showcase">
      {/* Handled natively with no buttons or local react visibility state hooks */}
      <PricingPopup dialogRef={dialogRef} />

      {/* Ambient background glows */}
      <div className="hero-video-glow glow-1" aria-hidden="true" />
      <div className="hero-video-glow glow-2" aria-hidden="true" />

      {/* Floating decorative badge 1 (Top Left) */}
      <div className="hero-video-badge badge-top-left" aria-hidden="true">
        <span className="badge-pulse-dot" />
        <Icon name="ads_click" />
        <div>
          <strong>Real Estate Growth</strong>
          <span>Meta &amp; Google Ads</span>
        </div>
      </div>

      {/* Floating decorative badge 2 (Mid Right) */}
      <div className="hero-video-badge badge-mid-right" aria-hidden="true">
        <Icon name="insights" />
        <div>
          <strong>More Visibility &amp; Sales</strong>
          <span>High-Intent Campaigns</span>
        </div>
      </div>

      {/* Floating decorative badge 3 (Bottom Right) */}
      <div className="hero-video-badge badge-bottom-right" aria-hidden="true">
        <Icon name="rocket_launch" />
        <div>
          <strong>Site Visits &amp; Closings</strong>
          <span>Let&apos;s Grow Together &rarr;</span>
        </div>
      </div>

      {/* Device / Phone Frame Card */}
      <div
        className="hero-video-card"
        onClick={togglePlay}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            togglePlay();
          }
        }}
        aria-label={isPlaying ? "Click to pause video" : "Click to play video"}
      >
        <div className="hero-video-bezel">
          {/* Top Notch */}
          <div className="hero-video-notch" aria-hidden="true" />

          {/* Sound toggle pill */}
          <button
            type="button"
            className="hero-video-sound-btn"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            <Icon name={isMuted ? "volume_off" : "volume_up"} />
            <span>{isMuted ? "Unmute" : "Sound On"}</span>
          </button>

          {/* Video element */}
          <video
            ref={videoRef}
            src="/FirstVideo.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hero-video-player"
          />

          {/* Paused state overlay button */}
          {!isPlaying && (
            <div className="hero-video-play-overlay">
              <div className="play-button-icon">
                <Icon name="play_arrow" />
              </div>
            </div>
          )}

          {/* Bottom progress bar */}
          <div className="hero-video-progress-track">
            <div
              className="hero-video-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

