/**
 * Performance Governor & Hardware Capability Detector
 * Complies with Sections 95, 96, 138-141:
 * - Four states: NORMAL (<0.50), PRESSURED (0.50-0.70), DEGRADED (0.70-0.85), MINIMAL (>=0.85)
 * - Hardware signal detection: CPU cores, device memory, low-spec data saver
 */

export class PerformanceGovernor {
  constructor() {
    this.isHardwareDegraded = false;
    this.detectHardwareCapability();
  }

  detectHardwareCapability() {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const isDataSaver = conn?.saveData === true;
      const isSlowNetwork =
        conn && (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
      const isLowEndCpu =
        navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
      const isLowMemory =
        navigator.deviceMemory && navigator.deviceMemory <= 2;

      if (isDataSaver || isSlowNetwork || isLowEndCpu || isLowMemory) {
        this.isHardwareDegraded = true;
      }
    } catch {
      // Never throw
    }
  }

  getGovernorState(currentBufferBytes, maxBufferBytes = 64 * 1024) {
    if (this.isHardwareDegraded) return "DEGRADED";
    const pressure = Math.min(1, Math.max(0, currentBufferBytes / maxBufferBytes));
    if (pressure >= 0.85) return "MINIMAL";
    if (pressure >= 0.7) return "DEGRADED";
    if (pressure >= 0.5) return "PRESSURED";
    return "NORMAL";
  }
}

export const performanceGovernor = new PerformanceGovernor();
export default performanceGovernor;
