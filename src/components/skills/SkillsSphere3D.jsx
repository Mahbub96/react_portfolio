"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import styles from "./skillsSphere3D.module.css";

export default function SkillsSphere3D({ skills = [] }) {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0.003, y: 0.004 });
  const animFrameRef = useRef(null);

  // Normalize skills list
  const skillNames = useMemo(() => {
    const list = skills
      .map((s) => (typeof s === "string" ? s : s?.name || s?.title))
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [skills]);

  // Compute spherical coordinates using Fibonacci sphere algorithm
  const points = useMemo(() => {
    const total = skillNames.length || 1;
    const radius = 150; // Radius in pixels
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    return skillNames.map((name, i) => {
      const y = 1 - (i / (total - 1 || 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      return {
        name,
        origX: x * radius,
        origY: y * radius,
        origZ: z * radius,
      };
    });
  }, [skillNames]);

  const [transformedPoints, setTransformedPoints] = useState([]);

  // Animation Loop for Sphere Rotation
  useEffect(() => {
    let currentRotX = 0;
    let currentRotY = 0;

    const loop = () => {
      if (!isDraggingRef.current) {
        currentRotX += velocityRef.current.x;
        currentRotY += velocityRef.current.y;
      }

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      const calculated = points.map((p) => {
        // Rotate around Y-axis
        const x1 = p.origX * cosY - p.origZ * sinY;
        const z1 = p.origZ * cosY + p.origX * sinY;

        // Rotate around X-axis
        const y2 = p.origY * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.origY * sinX;

        // Perspective projection
        const depth = z2 + 220; // Shift along Z
        const scale = Math.max(0.65, Math.min(1.2, depth / 220));
        const opacity = Math.max(0.25, Math.min(1, (z2 + 150) / 300));

        return {
          name: p.name,
          x: x1,
          y: y2,
          z: z2,
          scale,
          opacity,
          zIndex: Math.round(z2 + 200),
        };
      });

      setTransformedPoints(calculated);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [points]);

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    velocityRef.current = {
      x: -deltaY * 0.0003,
      y: deltaX * 0.0003,
    };

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    // Keep a subtle baseline drift speed
    if (Math.abs(velocityRef.current.x) < 0.002) velocityRef.current.x = 0.003;
    if (Math.abs(velocityRef.current.y) < 0.002) velocityRef.current.y = 0.004;
  };

  return (
    <div className={styles.sphereSection}>
      <div
        ref={containerRef}
        className={styles.sphereCanvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="region"
        aria-label="Interactive 3D Skills Sphere. Drag to rotate."
      >
        {transformedPoints.map((p, idx) => (
          <div
            key={`${p.name}-${idx}`}
            className={styles.skillItem3D}
            style={{
              transform: `translate(-50%, -50%) translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(
                1
              )}px, 0) scale(${p.scale.toFixed(2)})`,
              opacity: p.opacity.toFixed(2),
              zIndex: p.zIndex,
            }}
          >
            {p.name}
          </div>
        ))}
      </div>
      <div className={styles.sphereHint}>✦ Drag to spin the 3D constellation</div>
    </div>
  );
}
