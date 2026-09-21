import buildInfo from "./buildInfo.json";

export const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ||
  process.env.APP_VERSION ||
  buildInfo.version ||
  "3.0.0";

export const BUILD_NUMBER =
  process.env.NEXT_PUBLIC_BUILD_NUMBER ||
  process.env.BUILD_NUMBER ||
  buildInfo.buildNumber ||
  "21092026-171";

export const COMMIT_HASH = buildInfo.commitHash || "a443317";
export const COMMIT_COUNT = buildInfo.commitCount || 171;
export const BUILD_DATE = buildInfo.buildDate || "";

export const APP_BUILD_LABEL = `v${APP_VERSION} • Build ${BUILD_NUMBER}`;

export const BUILD_INFO = {
  version: APP_VERSION,
  buildNumber: BUILD_NUMBER,
  commitHash: COMMIT_HASH,
  commitCount: COMMIT_COUNT,
  buildDate: BUILD_DATE,
  label: APP_BUILD_LABEL,
};

export default BUILD_INFO;
