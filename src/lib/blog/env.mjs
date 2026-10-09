/**
 * Blog runtime settings, resolved from the environment at call time.
 *
 * Test, development and production may share one MongoDB, so blog data is
 * isolated by a collection prefix: production uses none, everything else
 * defaults to "<SITE_ENV>_" (e.g. "test_", "dev_"). A post written on
 * test.mahbub.dev or on a laptop can therefore never appear on mahbub.dev.
 */
import { resolve } from "node:path";

/** "production" | "test" | "dev" (unset). */
export function siteEnv() {
  return process.env.SITE_ENV || "dev";
}

export function isProductionSite() {
  return siteEnv() === "production";
}

export function collectionPrefix() {
  const explicit = process.env.BLOG_COLLECTION_PREFIX;
  if (explicit !== undefined && explicit !== "") return explicit;
  return isProductionSite() ? "" : `${siteEnv()}_`;
}

/**
 * Where uploaded images are written. Deploys wipe public/, so uploads live
 * outside the build: in production the standalone server runs from
 * $SERVER_DIR/.next/standalone, so the default is $SERVER_DIR/uploads/blog.
 */
export function uploadDir() {
  if (process.env.BLOG_UPLOAD_DIR) return resolve(process.env.BLOG_UPLOAD_DIR);
  return process.env.NODE_ENV === "production"
    ? resolve(process.cwd(), "../../uploads/blog")
    : resolve(process.cwd(), ".uploads/blog");
}

/** Public URL prefix the upload route serves (app/uploads/blog/[...path]). */
export const UPLOAD_URL_PREFIX = "/uploads/blog/";
