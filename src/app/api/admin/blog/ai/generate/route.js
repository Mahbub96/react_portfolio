import { secureResponse } from "@/lib/auth";
import { adminRoute } from "@/lib/blog/adminApi";
import { BlogError } from "@/lib/blog/adminPosts";
import { LIMITS } from "@/lib/blog/schema.mjs";
import { FIELD_SPECS } from "@/lib/ai/fields.mjs";
import { generateSchema } from "@/lib/ai/schema.mjs";
import { AiError, aiStatus, generateField, startBodyStream } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

function aiErrorResponse(error) {
  const response = secureResponse(
    { error: error.message, code: error.code || null, retryAfter: error.retryAfter || null },
    error.status
  );
  if (error.retryAfter) response.headers.set("Retry-After", String(error.retryAfter));
  return response;
}

/**
 * Body actions stream newline-delimited JSON:
 *   {"type":"chunk","text":"…"}  …as the model writes
 *   {"type":"done","status":"ok","value":"<validated markdown>","warnings":[…],"remaining":{…}}
 *   {"type":"error","error":"…","code":"…"}
 */
function bodyStream(started) {
  const encoder = new TextEncoder();
  const line = (obj) => encoder.encode(`${JSON.stringify(obj)}\n`);
  return new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        for await (const text of started.chunks) {
          full += text;
          controller.enqueue(line({ type: "chunk", text }));
        }
        const result = await started.finish(full);
        controller.enqueue(line({ type: "done", ...result, remaining: (await aiStatus()).remaining }));
      } catch (error) {
        controller.enqueue(line({ type: "error", error: error.message, code: error.code || null, retryAfter: error.retryAfter || null }));
      }
      controller.close();
    },
  });
}

// One suggestion for one field, only when the owner clicks Generate.
export const POST = adminRoute(async (request) => {
  const input = generateSchema.parse(await request.json());
  if (input.fields.contentJson && Buffer.byteLength(JSON.stringify(input.fields.contentJson)) > LIMITS.contentBytes) {
    throw new BlogError("The post is too large to send", 413);
  }
  try {
    if (FIELD_SPECS[input.target].kind !== "markdown") {
      const result = await generateField(input);
      return { ...result, remaining: (await aiStatus()).remaining };
    }
    const started = await startBodyStream(input);
    if (started.early) {
      const done = { type: "done", ...started.early, remaining: (await aiStatus()).remaining };
      return new Response(`${JSON.stringify(done)}\n`, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
    }
    return new Response(bodyStream(started), {
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
    });
  } catch (error) {
    if (error instanceof AiError) return aiErrorResponse(error);
    throw error;
  }
});
