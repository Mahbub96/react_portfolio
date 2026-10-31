"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import styles from "./tiltCard.module.css";

export default function TiltCard3D({
  children,
  className = "",
  style = {},
  maxTilt = 10,
  glare = true,
  scale = 1.02,
  initialTilt = null,
  onClick,
  onKeyDown,
  role,
  tabIndex,
  ...rest
}) {
  const cardRef = useRef(null);
  const defaultTransform = initialTilt
    ? `rotateX(${initialTilt.rotateX}deg) rotateY(${initialTilt.rotateY}deg) scale3d(1, 1, 1)`
    : "";
  const [transformStyle, setTransformStyle] = useState(defaultTransform);
  const [glareStyle, setGlareStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const listener = (e) => setReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (reducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-maxTilt to +maxTilt)
      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTransformStyle(
        `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
          2
        )}deg) scale3d(${scale}, ${scale}, ${scale})`
      );

      if (glare) {
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        setGlareStyle({
          background: `radial-gradient(circle 240px at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.22), transparent 70%)`,
        });
      }
    },
    [maxTilt, glare, scale, reducedMotion]
  );

  const handleMouseEnter = () => {
    if (!reducedMotion) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle(defaultTransform);
    setGlareStyle({});
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.tiltWrapper} ${className}`}
      style={{
        ...style,
        ...(onClick ? { cursor: "pointer" } : {}),
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      {...rest}
    >
      <div
        className={`${styles.tiltInner} ${isHovered ? styles.isHovered : ""}`}
        style={transformStyle ? { transform: transformStyle } : undefined}
      >
        {children}
        {glare && (
          <div
            className={styles.glareOverlay}
            style={glareStyle}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
