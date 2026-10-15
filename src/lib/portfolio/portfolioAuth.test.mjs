import { test } from "node:test";
import assert from "node:assert/strict";
import { requireAdmin } from "../adminSession.js";

test("requireAdmin rejects unauthenticated requests without session cookie", async () => {
  const req = new Request("http://localhost:3000/api/admin/portfolio", {
    method: "GET",
    headers: { host: "localhost:3000" },
  });

  const auth = await requireAdmin(req);
  assert.equal(auth.valid, false);
  assert.equal(auth.status, 401);
});

test("requireAdmin rejects cross-origin mutations", async () => {
  const req = new Request("http://localhost:3000/api/admin/portfolio/Projects", {
    method: "POST",
    headers: {
      host: "localhost:3000",
      origin: "https://evil-attacker.com",
    },
  });

  const auth = await requireAdmin(req);
  assert.equal(auth.valid, false);
  assert.equal(auth.status, 403);
});
