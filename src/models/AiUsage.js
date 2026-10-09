import mongoose from "mongoose";
import { collectionPrefix } from "@/lib/blog/env.mjs";

/**
 * One row per AI request that reached the provider (or failed trying).
 * Used for the daily cap and for cost review. Draft text is never stored.
 */
const AiUsageSchema = new mongoose.Schema(
  {
    target: String,
    model: String,
    status: { type: String, enum: ["ok", "insufficient_context", "invalid_output", "provider_error"] },
    promptTokens: Number,
    completionTokens: Number,
    ms: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
AiUsageSchema.index({ createdAt: -1 });

export function aiUsageModel() {
  const name = `${collectionPrefix()}AiUsage`;
  return mongoose.models[name] || mongoose.model(name, AiUsageSchema, `${collectionPrefix()}ai_usage`);
}
