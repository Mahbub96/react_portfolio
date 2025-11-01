/**
 * IP Geolocation Service
 * Handles IP address extraction and geolocation lookup
 */

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip) {
  if (!ip) return false;

  // IPv4 private ranges
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^::1$/,
    /^::ffff:127\./,
    /^::ffff:192\.168\./,
    /^::ffff:10\./,
    /^fc00:/,
    /^fe80:/,
  ];

  return privateRanges.some((range) => range.test(ip));
}

/**
 * Get public IP from external service
 */
async function getPublicIP() {
  const services = [
    "https://api.ipify.org?format=json",
    "https://api.ip.sb/ip",
    "https://checkip.amazonaws.com",
    "https://icanhazip.com",
  ];

  for (const service of services) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(service, {
        signal: controller.signal,
        headers: {
          Accept: "application/json, text/plain",
        },
      });

      clearTimeout(timeout);

      if (response.ok) {
        const text = await response.text();
        // Try to parse as JSON first
        try {
          const json = JSON.parse(text);
          const ip = json.ip || text.trim();
          if (ip && !isPrivateIP(ip)) {
            return ip;
          }
        } catch {
          // If not JSON, use text directly
          const ip = text.trim();
          if (ip && !isPrivateIP(ip)) {
            return ip;
          }
        }
      }
    } catch (error) {
      // Try next service
      continue;
    }
  }

  return null;
}

/**
 * Extract client IP address from Next.js request
 * @param {Request} request - Next.js request object
 * @returns {Promise<string>} - IP address or 'unknown'
 */
export async function extractClientIP(request) {
  // Try multiple headers (in order of priority)
  const headers = [
    request.headers.get("x-forwarded-for"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-client-ip"),
    request.headers.get("cf-connecting-ip"), // Cloudflare
    request.headers.get("true-client-ip"), // Some proxies
  ];

  let detectedIP = null;

  for (const header of headers) {
    if (header) {
      // Handle comma-separated IPs (take first one)
      const ip = header.split(",")[0].trim();
      // Validate IP format and check if it's not localhost
      if (ip && ip !== "::1" && ip !== "127.0.0.1" && ip !== "localhost") {
        detectedIP = ip;
        break;
      }
    }
  }

  // If we have a private IP, try to get public IP
  if (detectedIP && isPrivateIP(detectedIP)) {
    const publicIP = await getPublicIP();
    if (publicIP) {
      return publicIP;
    }
    // Note: Private IPs won't resolve to real locations, but we'll try
  }

  // If no IP detected and in development, try to get public IP
  if (!detectedIP && process.env.NODE_ENV === "development") {
    const publicIP = await getPublicIP();
    if (publicIP) {
      return publicIP;
    }
    // Fallback to a test IP only if we can't get public IP
    return "8.8.8.8";
  }

  return detectedIP || "unknown";
}

/**
 * Get geolocation data from IP address using multiple providers
 * @param {string} ip - IP address
 * @returns {Promise<{country: string, city: string, region: string}>}
 */
export async function getGeolocationFromIP(ip) {
  const defaultResult = {
    country: "Unknown",
    city: "Unknown",
    region: "Unknown",
  };

  // Skip if IP is invalid
  if (
    !ip ||
    ip === "unknown" ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip === "localhost"
  ) {
    return defaultResult;
  }

  // Try ipapi.co first (1000 requests/day free)
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      // Add timeout (only in Node 18+)
      ...(typeof AbortSignal.timeout !== "undefined" && {
        ...(typeof AbortSignal.timeout !== "undefined" && {
          signal: AbortSignal.timeout(5000),
        }),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Check if there's an error
      if (data.error) {
        throw new Error(data.reason || "IP geolocation error");
      }
      return {
        country: data.country_name || data.country_code || "Unknown",
        city: data.city || "Unknown",
        region: data.region || data.region_code || "Unknown",
      };
    }
  } catch (error) {
    // Try next service
  }

  // Fallback to ip-api.com (45 requests/minute free)
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,regionName`,
      {
        ...(typeof AbortSignal.timeout !== "undefined" && {
          signal: AbortSignal.timeout(5000),
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        return {
          country: data.country || "Unknown",
          city: data.city || "Unknown",
          region: data.regionName || "Unknown",
        };
      }
    }
  } catch (error) {
    // Try next service
  }

  // Last fallback: ipgeolocation.io (if API key is provided)
  if (process.env.IPGEOLOCATION_API_KEY) {
    try {
      const response = await fetch(
        `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${ip}`,
        {
          ...(typeof AbortSignal.timeout !== "undefined" && {
            signal: AbortSignal.timeout(5000),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name || data.country_code2 || "Unknown",
          city: data.city || "Unknown",
          region: data.state_prov || "Unknown",
        };
      }
    } catch (error) {
      // Service failed
    }
  }

  return defaultResult;
}

/**
 * Extract IP and get geolocation in one call
 * @param {Request} request - Next.js request object
 * @returns {Promise<{ip: string, country: string, city: string, region: string}>}
 */
export async function getIPAndGeolocation(request) {
  const ip = await extractClientIP(request);
  const geo = await getGeolocationFromIP(ip);
  return {
    ip,
    ...geo,
  };
}
