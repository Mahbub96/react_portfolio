"use client";

import React, { useState, useEffect } from "react";
import {
  HiCode,
  HiOutlineDesktopComputer,
  HiOutlineDatabase,
  HiOutlineServer,
} from "react-icons/hi";
import { SiJavascript, SiReact, SiNodedotjs, SiMongodb } from "react-icons/si";
import styles from "./loadingScreen.module.css";

const LoadingScreen = ({ onLoadingComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const loadingSteps = [
    {
      icon: HiCode,
      text: "Initializing Development Environment",
      color: "#64ffda",
    },
    {
      icon: SiJavascript,
      text: "Loading JavaScript Framework",
      color: "#F7DF1E",
    },
    { icon: SiReact, text: "Starting React Application", color: "#61DAFB" },
    {
      icon: SiNodedotjs,
      text: "Connecting to Backend Services",
      color: "#339933",
    },
    {
      icon: SiMongodb,
      text: "Establishing Database Connection",
      color: "#47A248",
    },
    {
      icon: HiOutlineServer,
      text: "Configuring Server Infrastructure",
      color: "#FF6B35",
    },
    {
      icon: HiOutlineDatabase,
      text: "Loading Portfolio Data",
      color: "#4ECDC4",
    },
    {
      icon: HiOutlineDesktopComputer,
      text: "Rendering Portfolio Interface",
      color: "#45B7D1",
    },
  ];

  useEffect(() => {
    // Show content after a brief delay
    const showTimer = setTimeout(() => setShowContent(true), 100);

    // Start loading animation
    const loadingTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onLoadingComplete();
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      return () => clearInterval(interval);
    }, 300);

    // Update loading steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return loadingSteps.length - 1;
        }
        return prev + 1;
      });
    }, 300);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(loadingTimer);
      clearInterval(stepInterval);
    };
  }, [onLoadingComplete, loadingSteps.length]);

  const CurrentIcon = loadingSteps[currentStep]?.icon || HiCode;

  return (
    <div className={styles.loadingScreen}>
      {/* Background gradient */}
      <div className={styles.backgroundGradient}></div>

      {/* Animated background elements */}
      <div className={styles.floatingElements}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={styles.floatingElement}
            style={{ "--delay": `${i * 0.5}s` }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className={`${styles.content} ${showContent ? styles.show : ""}`}>
        {/* Logo/Brand */}
        <div className={styles.brandSection}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <HiCode />
            </div>
            <h1 className={styles.brandName}>Mahbub Alam</h1>
            <p className={styles.brandTitle}>Full Stack Developer</p>
          </div>
        </div>

        {/* Loading animation */}
        <div className={styles.loadingSection}>
          <div className={styles.loadingIcon}>
            <CurrentIcon style={{ color: loadingSteps[currentStep]?.color }} />
          </div>

          <div className={styles.loadingText}>
            <p className={styles.currentStep}>
              {loadingSteps[currentStep]?.text}
            </p>
            <p className={styles.loadingMessage}>
              Building something amazing...
            </p>
          </div>

          {/* Progress bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Tech stack preview */}
        <div className={styles.techStack}>
          <div className={styles.techIcons}>
            <SiJavascript className={styles.techIcon} />
            <SiReact className={styles.techIcon} />
            <SiNodedotjs className={styles.techIcon} />
            <SiMongodb className={styles.techIcon} />
            <HiOutlineServer className={styles.techIcon} />
            <HiOutlineDatabase className={styles.techIcon} />
          </div>
        </div>
      </div>

      {/* Loading dots */}
      <div className={styles.loadingDots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
