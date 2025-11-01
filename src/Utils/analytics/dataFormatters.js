/**
 * Data Formatters for Analytics
 * Makes technical data human-readable for technical and non-technical users
 */

/**
 * Format component name to be human-readable
 */
export function formatComponentName(componentId) {
  if (!componentId || componentId === "unknown") {
    return "Unknown Element";
  }

  // Remove CSS module hashes and technical identifiers
  let cleanName = componentId
    .replace(/_[a-zA-Z0-9]{5,}/g, "") // Remove module hashes like _9bJBP
    .replace(/^analytics_/i, "")
    .replace(/^navbar_/i, "")
    .replace(/^banner_/i, "")
    .replace(/^link\[#/i, "Section: ")
    .replace(/\]$/i, "")
    .replace(/link\[/i, "Link: ")
    .replace(/button\[/i, "Button: ")
    .replace(/span\[/i, "")
    .replace(/svg$/i, "Icon")
    .replace(/_/g, " ")
    .trim();

  // Capitalize first letter of each word
  cleanName = cleanName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Special cases for common components
  const componentMap = {
    refreshbtn: "Refresh Button",
    navlinks: "Navigation Links",
    navnumber: "Navigation Number",
    techbackground: "Technology Background",
    profilesection: "Profile Section",
    experience: "Experience Section",
    about: "About Section",
    skills: "Skills Section",
    projects: "Projects Section",
    contact: "Contact Section",
    home: "Home Section",
  };

  const lowerName = cleanName.toLowerCase();
  for (const [key, value] of Object.entries(componentMap)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }

  return cleanName || "Interactive Element";
}

/**
 * Format medium name to be human-readable
 */
export function formatMediumName(medium) {
  if (!medium || medium === "-" || medium === "" || medium === "direct") {
    return "Direct Traffic";
  }

  const mediumMap = {
    organic: "Organic Search",
    referral: "Referral Link",
    social: "Social Media",
    cpc: "Paid Advertising",
    email: "Email Campaign",
    unknown: "Unknown Source",
  };

  return (
    mediumMap[medium.toLowerCase()] ||
    medium.charAt(0).toUpperCase() + medium.slice(1)
  );
}

/**
 * Format device name to be human-readable
 */
export function formatDeviceName(device) {
  const deviceMap = {
    desktop: "Desktop Computer",
    mobile: "Mobile Device",
    tablet: "Tablet Device",
    unknown: "Unknown Device",
  };

  return deviceMap[device?.toLowerCase()] || device || "Unknown Device";
}

/**
 * Format country name
 */
export function formatCountryName(country) {
  if (!country || country === "Unknown" || country === "unknown") {
    return "Unknown Location";
  }
  return country;
}

/**
 * Format duration in human-readable format
 */
export function formatDurationReadable(milliseconds) {
  if (!milliseconds || milliseconds < 0) return "0 seconds";

  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    return `${minutes} minute${
      minutes !== 1 ? "s" : ""
    } ${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${
    remainingMinutes !== 1 ? "s" : ""
  }`;
}

/**
 * Format scroll depth description
 */
export function formatScrollDepthDescription(percentage) {
  if (percentage < 25) return "Minimal scrolling";
  if (percentage < 50) return "Some scrolling";
  if (percentage < 75) return "Moderate scrolling";
  if (percentage < 95) return "Extensive scrolling";
  return "Scrolled to bottom";
}
