"use client";

/**
 * Browser-side client for /api/admin/blog/*. The session is the httpOnly
 * cookie; same-origin fetch sends it (and the Origin header) automatically.
 */

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function toLogin() {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/admin/login/?next=${encodeURIComponent(next)}`);
}

export async function adminFetch(path, { method = "GET", body, form, signal } = {}) {
  const response = await fetch(`/api/admin/blog${path}`, {
    method,
    signal,
    cache: "no-store",
    headers: form ? undefined : { "Content-Type": "application/json" },
    body: form || (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    toLogin();
    throw new ApiError("Signed out", 401, data);
  }
  if (!response.ok) {
    throw new ApiError(data.error || `Request failed (${response.status})`, response.status, data);
  }
  return data;
}
