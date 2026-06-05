/**
 * RESUME_MODE=dynamic  → generate PDF from MongoDB portfolio data
 * RESUME_MODE=static   → serve pre-uploaded PDF from public/
 */
export function getResumeConfig() {
  const mode = process.env.RESUME_MODE === "static" ? "static" : "dynamic";
  const staticFile =
    process.env.RESUME_STATIC_FILE || "/resume/Mahbub_Alam_Resume.pdf";

  return { mode, staticFile };
}
