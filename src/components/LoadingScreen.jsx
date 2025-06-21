import React from "react";
import {
  HiCode,
  HiOutlineDesktopComputer,
  HiOutlineDatabase,
  HiOutlineServer,
} from "react-icons/hi";
import { SiJavascript, SiReact, SiNodedotjs, SiMongodb } from "react-icons/si";
import styles from "./loadingScreen.module.css";

const LoadingScreen = ({ data }) => {
  // Extract data from database
  const profile = data?.profile?.data || {};
  const bannerData = data?.Banner?.data || {};
  const name = profile.name || bannerData.name || "Mahbub Alam";
  const title = profile.title || "Full Stack Developer";

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
      <div className={`${styles.content} ${styles.show}`}>
        {/* Logo/Brand */}
        <div className={styles.brandSection}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <HiCode />
            </div>
            <h1 className={styles.brandName}>{name}</h1>
            <p className={styles.brandTitle}>{title}</p>
          </div>
        </div>

        {/* Loading animation */}
        <div className={styles.loadingSection}>
          <div className={styles.loadingIcon}>
            <HiCode style={{ color: "#20c997" }} />
          </div>

          <div className={styles.loadingText}>
            <p className={styles.currentStep}>Loading Portfolio...</p>
            <p className={styles.loadingMessage}>
              Building something amazing...
            </p>
          </div>

          {/* Progress bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "100%" }}
              ></div>
            </div>
            <span className={styles.progressText}>Loading...</span>
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
