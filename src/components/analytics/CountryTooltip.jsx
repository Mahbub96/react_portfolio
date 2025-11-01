"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Country Tooltip Component
 * Shows city names when hovering over country name
 * Uses portal to avoid overflow issues
 */
export default function CountryTooltip({ country, cities = [], children }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    placement: "above",
  });
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  // Memoize valid cities to prevent unnecessary recalculations
  const validCities = useMemo(
    () =>
      Array.isArray(cities)
        ? [
            ...new Set(
              cities.filter((c) => c && c !== "Unknown" && c !== "unknown")
            ),
          ]
        : [],
    [cities]
  );

  // Show tooltip even if no cities (just show country info)
  const hasCities = validCities && validCities.length > 0;

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!wrapperRef.current) return null;

    const rect = wrapperRef.current.getBoundingClientRect();

    // Use actual dimensions if tooltip is rendered, otherwise use estimates
    let tooltipHeight = 150;
    let tooltipWidth = 250;

    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      tooltipHeight = tooltipRect.height || 150;
      tooltipWidth = tooltipRect.width || 250;
    }

    // Check if there's enough space above
    const spaceAbove = rect.top;
    const shouldShowAbove = spaceAbove > tooltipHeight + 20;

    const top = shouldShowAbove
      ? rect.top - tooltipHeight - 10
      : rect.bottom + 10;

    // Center horizontally but adjust if it would overflow
    let left = rect.left + rect.width / 2;

    // Adjust if tooltip would overflow left
    if (left - tooltipWidth / 2 < 10) {
      left = 10 + tooltipWidth / 2;
    }

    // Adjust if tooltip would overflow right
    if (left + tooltipWidth / 2 > window.innerWidth - 10) {
      left = window.innerWidth - 10 - tooltipWidth / 2;
    }

    return {
      top,
      left,
      placement: shouldShowAbove ? "above" : "below",
    };
  }, []);

  // Update position function for scroll/resize
  const updatePosition = useCallback(() => {
    if (!showTooltip) return;

    const newPosition = calculatePosition();
    if (newPosition) {
      setTooltipPosition((prev) => {
        // Only update if position actually changed significantly
        if (
          Math.abs(prev.top - newPosition.top) < 1 &&
          Math.abs(prev.left - newPosition.left) < 1 &&
          prev.placement === newPosition.placement
        ) {
          return prev;
        }
        return newPosition;
      });
    }
  }, [showTooltip, calculatePosition]);

  // Calculate initial tooltip position when shown
  useEffect(() => {
    if (!showTooltip || !wrapperRef.current) {
      return;
    }

    // Set initial position with estimated size
    const initialPosition = calculatePosition();
    if (initialPosition) {
      setTooltipPosition(initialPosition);
    }

    // Update position with actual dimensions after tooltip is rendered
    const timeoutId = setTimeout(() => {
      updatePosition();
    }, 0);

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showTooltip, calculatePosition, updatePosition]);

  // Update position after tooltip is rendered (using a separate effect with delay)
  useEffect(() => {
    if (!showTooltip) return;

    // Use multiple small delays to ensure tooltip dimensions are available
    const timeouts = [
      setTimeout(() => updatePosition(), 0),
      setTimeout(() => updatePosition(), 10),
      setTimeout(() => updatePosition(), 50),
    ];

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [showTooltip, updatePosition]);

  return (
    <>
      <div
        ref={wrapperRef}
        className={styles.countryTooltipWrapper}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ display: "inline-block", width: "100%" }}
      >
        {children}
      </div>
      {showTooltip &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`${styles.countryTooltip} ${
              tooltipPosition.placement === "above"
                ? styles.tooltipAbove
                : styles.tooltipBelow
            }`}
            style={{
              position: "fixed",
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className={styles.tooltipHeader}>
              <strong>{country}</strong>
            </div>
            <div className={styles.tooltipCities}>
              {hasCities ? (
                <>
                  <div className={styles.citiesList}>
                    {validCities.slice(0, 10).map((city, idx) => (
                      <span key={`${city}-${idx}`} className={styles.cityTag}>
                        {city}
                      </span>
                    ))}
                  </div>
                  {validCities.length > 10 && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      +{validCities.length - 10} more cities
                    </div>
                  )}
                </>
              ) : (
                <span className={styles.noCities}>No city data available</span>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
