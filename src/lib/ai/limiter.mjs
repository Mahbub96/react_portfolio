/**
 * Per-minute request limiter for AI calls.
 *
 * In memory is enough: the site runs as a single PM2 process, and a restart
 * only forgets one minute of history. The daily cap is counted in MongoDB
 * (see usage.js) so it survives restarts.
 */
const WINDOW_MS = 60_000;

/** Rolling 60-second window. */
export function createMinuteLimiter(perMinute, now = () => Date.now()) {
  let hits = [];
  const prune = (t) => {
    hits = hits.filter((h) => t - h < WINDOW_MS);
  };
  return {
    /** Reserve one request; { ok, remaining, retryAfter } (seconds). */
    take() {
      const t = now();
      prune(t);
      if (hits.length >= perMinute) {
        return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((hits[0] + WINDOW_MS - t) / 1000)) };
      }
      hits.push(t);
      return { ok: true, remaining: perMinute - hits.length, retryAfter: 0 };
    },
    remaining() {
      prune(now());
      return Math.max(0, perMinute - hits.length);
    },
  };
}
