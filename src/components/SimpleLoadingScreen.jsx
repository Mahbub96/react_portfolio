"use client";
import React, { useState, useEffect } from "react";
import { FaCode, FaLaptopCode, FaDatabase, FaServer } from "react-icons/fa";
import styles from "./loadingScreen.module.css";

const SimpleLoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingSteps = [
    { icon: FaCode, text: "Initializing Codebase", duration: 800 },
    { icon: FaLaptopCode, text: "Loading Components", duration: 600 },
    { icon: FaDatabase, text: "Connecting Database", duration: 700 },
    { icon: FaServer, text: "Starting Server", duration: 500 },
  ];

  useEffect(() => {
    const totalDuration = loadingSteps.reduce(
      (sum, step) => sum + step.duration,
      0
    );
    const interval = 50; // Update every 50ms
    const increment = 100 / (totalDuration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;

        // Determine current step based on progress
        let stepProgress = 0;
        for (let i = 0; i < loadingSteps.length; i++) {
          stepProgress += (loadingSteps[i].duration / totalDuration) * 100;
          if (newProgress <= stepProgress) {
            setCurrentStep(i);
            break;
          }
        }

        if (newProgress >= 100) {
          setIsComplete(true);
          clearInterval(timer);
          setTimeout(() => {
            onLoadingComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  const CurrentIcon = loadingSteps[currentStep]?.icon || FaCode;

  return (
    <div
      className={`${styles.loadingScreen} ${isComplete ? styles.fadeOut : ""}`}
    >
      <div className={styles.loadingContainer}>
        {/* Logo/Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.bracket}>{"<"}</span>
            <span className={styles.name}>Mahbub Alam</span>
            <span className={styles.bracket}>{" />"}</span>
          </div>
          <p className={styles.tagline}>Full Stack Developer</p>
        </div>

        {/* Loading Animation */}
        <div className={styles.loadingAnimation}>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className={styles.progressText}>{Math.round(progress)}%</div>
          </div>

          {/* Current Step */}
          <div className={styles.currentStep}>
            {loadingSteps[currentStep] && (
              <>
                <div className={styles.stepIcon}>
                  <CurrentIcon size={20} />
                </div>
                <span className={styles.stepText}>
                  {loadingSteps[currentStep].text}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Animated Background */}
        <div className={styles.backgroundAnimation}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoadingScreen;
