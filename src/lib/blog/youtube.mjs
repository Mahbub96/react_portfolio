/** Extract the 11-character id from any common YouTube URL form. */
export function youtubeId(input) {
  const value = String(input || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id = null;
    if (host === "youtu.be") id = url.pathname.slice(1, 12);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1] || null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
