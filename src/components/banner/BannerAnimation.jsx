"use client";

import React from "react";
import { TypeAnimation } from "react-type-animation";
import styles from "./banner.module.css";

// Client-side only component for typing animation
const BannerAnimation = ({ roles }) => {
  const defaultRoles = [
    "Full Stack Developer",
    1500,
    "Mobile App Developer",
    1500,
    "ML Engineer",
    1500,
    "Data Scientist",
    1500,
    "DevSecOps Engineer",
    1500,
  ];

  const rolesToAnimate = roles || defaultRoles;

  return (
    <div className={styles.animationContainer}>
      <TypeAnimation
        sequence={rolesToAnimate}
        speed={40}
        repeat={Infinity}
        deletionSpeed={60}
        className={styles.animatedText}
        aria-label="Professional roles animation"
        cursor={true}
      />
    </div>
  );
};

export default BannerAnimation;
