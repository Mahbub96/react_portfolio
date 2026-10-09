#!/usr/bin/env node
/**
 * Prints the admin credential lines for $SERVER_DIR/.env.runtime:
 *
 *   pnpm admin:hash
 *
 * Asks for the new admin password (input hidden), then prints
 * ADMIN_PASSWORD_HASH (bcrypt, cost 12) and a fresh random JWT_SECRET.
 *
 * The hash is printed base64-encoded with a "b64:" prefix: raw bcrypt hashes
 * contain "$", which bash and Next's .env loader would both try to expand.
 * The encoded form has no "$", so the same line works in .env.runtime,
 * .env.local and the process environment (src/config/admin.js decodes it).
 */
import { randomBytes } from "node:crypto";
import readline from "node:readline";
import bcrypt from "bcryptjs";

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    rl._writeToOutput = (text) => {
      // Echo the prompt and newline only, never the typed characters.
      if (text.includes(question) || text === "\r\n" || text === "\n") {
        rl.output.write(text);
      }
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const password = await askHidden("New admin password: ");
const confirm = await askHidden("Repeat password: ");

if (password !== confirm) {
  console.error("Passwords do not match.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const encoded = `b64:${Buffer.from(hash, "utf8").toString("base64")}`;
const secret = randomBytes(48).toString("base64url");

console.log("\nAdd to .env.runtime on the server (and .env.local for development):\n");
console.log(`ADMIN_PASSWORD_HASH=${encoded}`);
console.log(`JWT_SECRET=${secret}`);
console.log("\nUse a different JWT_SECRET on test and production (run this again).");
