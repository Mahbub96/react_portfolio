/**
 * Exponential Backoff with Jitter Retry Policy
 * Complies with Sections 97 & 98:
 * - Prevents thundering-herd retry storms against the 1 CPU / 1 GB RAM server
 */

export class RetryPolicy {
  constructor(baseDelay = 3000, maxDelay = 30000, multiplier = 1.8) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.multiplier = multiplier;
    this.attempts = 0;
  }

  recordSuccess() {
    this.attempts = 0;
  }

  recordFailure() {
    this.attempts++;
  }

  getNextDelay() {
    const jitter = Math.random() * 800;
    const exponential = this.baseDelay * Math.pow(this.multiplier, Math.min(6, this.attempts));
    return Math.min(this.maxDelay, exponential) + jitter;
  }
}
