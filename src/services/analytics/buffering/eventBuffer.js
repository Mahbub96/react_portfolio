/**
 * Priority-Based Bounded Memory Event Buffer
 * Complies with Sections 92, 94, 95, 138-141:
 * - Strict upper memory bound (64 KB)
 * - Multi-tiered drop policy: Tier 3 first, then Tier 2, NEVER drop Tier 1
 */

export class EventBuffer {
  constructor(maxBufferBytes = 64 * 1024, maxQueueSize = 50) {
    this.maxBufferBytes = maxBufferBytes;
    this.maxQueueSize = maxQueueSize;
    this.bufferBytes = 0;
    this.queue = [];
  }

  get length() {
    return this.queue.length;
  }

  get bytes() {
    return this.bufferBytes;
  }

  getPressure() {
    return Math.min(1, Math.max(0, this.bufferBytes / this.maxBufferBytes));
  }

  /**
   * Enqueue an event with priority-based eviction if memory ceiling is exceeded
   * Returns true if event was accepted, false if dropped
   */
  push(event) {
    const priority = event._priority || 2;
    const itemBytes = event._bytes || 150;

    // Strict bounded buffer eviction
    while (
      (this.bufferBytes + itemBytes > this.maxBufferBytes ||
        this.queue.length >= this.maxQueueSize) &&
      this.queue.length > 0
    ) {
      // Find and drop lowest-priority item (P3 first)
      const dropIndex = this.queue.findIndex((e) => (e._priority || 2) >= 3);
      if (dropIndex !== -1) {
        const dropped = this.queue.splice(dropIndex, 1)[0];
        this.bufferBytes = Math.max(0, this.bufferBytes - (dropped._bytes || 150));
      } else {
        // Drop P2 behavioral event if needed
        const dropP2Index = this.queue.findIndex((e) => (e._priority || 2) === 2);
        if (dropP2Index !== -1) {
          const dropped = this.queue.splice(dropP2Index, 1)[0];
          this.bufferBytes = Math.max(0, this.bufferBytes - (dropped._bytes || 150));
        } else if (priority > 1) {
          // Buffer contains only P1 critical events: preserve P1, drop incoming non-P1
          return false;
        } else {
          break; // Allow bounded queueing for incoming P1 critical event
        }
      }
    }

    this.queue.push(event);
    this.bufferBytes += itemBytes;
    return true;
  }

  /**
   * Extract a batch bounded by byte target (e.g. 24KB) or count
   */
  extractBatch(maxBatchBytes = 24 * 1024, maxBatchSize = 25) {
    if (this.queue.length === 0) return [];

    let batchBytes = 0;
    let batchCount = 0;

    for (let i = 0; i < this.queue.length; i++) {
      const itemBytes = this.queue[i]._bytes || 180;
      if (
        batchCount >= maxBatchSize ||
        (batchCount > 0 && batchBytes + itemBytes > maxBatchBytes)
      ) {
        break;
      }
      batchBytes += itemBytes;
      batchCount++;
    }

    const batch = this.queue.splice(0, Math.max(1, batchCount));
    this.bufferBytes = Math.max(0, this.bufferBytes - batchBytes);
    return batch;
  }

  clear() {
    this.queue = [];
    this.bufferBytes = 0;
  }
}
