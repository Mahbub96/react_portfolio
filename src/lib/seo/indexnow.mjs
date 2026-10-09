/**
 * IndexNow submission (Bing, Yandex, Seznam, Naver...). Shared by the blog
 * publish flow and scripts/indexnow.mjs.
 *
 * The key file public/<KEY>.txt must be live at https://mahbub.dev/<KEY>.txt;
 * IndexNow fetches it to prove ownership. The key is not a secret.
 */
export const INDEXNOW_HOST = "mahbub.dev";
export const INDEXNOW_KEY = "28df78752bbf6920a66c71aa2f29ece0";

/** Submit absolute URLs. Resolves to the HTTP status (200/202 = accepted). */
export async function submitIndexNow(urlList, { timeoutMs = 10000 } = {}) {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  return response.status;
}
