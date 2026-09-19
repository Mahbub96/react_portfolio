import mongoose from "mongoose";

const AnalyticsEventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "session_start",
        "session_end",
        "page_view",
        "page_exit",
        "section_view",
        "click",
        "hover",
        "mouse_movement",
        "rage_click",
        "long_hover",
        "scroll",
        "scroll_milestone",
        "rapid_scroll",
        "input_interaction",
        "form_focus",
        "form_blur",
        "form_submit",
        "form_error",
        "navigation",
        "custom",
      ],
      index: true,
    },
    page: {
      type: String,
      required: true,
      index: true,
    },
    elementId: {
      type: String,
      default: null,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Device and environment context
    deviceType: {
      type: String,
      default: "unknown",
    },
    browser: {
      type: String,
      default: "unknown",
    },
    os: {
      type: String,
      default: "unknown",
    },
    country: {
      type: String,
      default: "Unknown",
    },
    city: {
      type: String,
      default: "Unknown",
    },
    ip: {
      type: String,
      default: "unknown",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast aggregation and querying
AnalyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ page: 1, eventType: 1 });
AnalyticsEventSchema.index({ elementId: 1, eventType: 1 });

// TTL index: automatically remove events after 90 days (7776000 seconds)
AnalyticsEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

export default mongoose.models.AnalyticsEvent ||
  mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
