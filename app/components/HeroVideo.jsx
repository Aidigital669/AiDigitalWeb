"use client";

import React, { useRef, useState, useEffect } from "react";
import PricingPopup from "./PricingPopup";
import { Icon } from "./SiteChrome";

export default function HeroVideo() {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

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
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="hero-full-video-header" aria-label="Header Video">
      {/* Background Pricing Lead Modal (opens on 10s delay) */}
      <PricingPopup dialogRef={dialogRef} />

      {/* Full Header Video - Maximum Visibility & Contrast */}
      <video
        ref={videoRef}
        src="/Header.mp4"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        onClick={togglePlay}
        className="hero-header-main-video"
      />

      {/* Subtle Bottom Controls (Discrete Sound Button) */}
      <div className="hero-video-controls-overlay">
        <button
          type="button"
          className="hero-video-sound-pill"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video sound" : "Mute video sound"}
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          <Icon name={isMuted ? "volume_off" : "volume_up"} />
          <span>{isMuted ? "Unmute" : "Sound On"}</span>
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
    </div>
  );
}
