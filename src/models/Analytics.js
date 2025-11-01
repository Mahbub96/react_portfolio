import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    // Session Information
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    page: {
      type: String,
      required: true,
      index: true,
    },

    // Geographic Information
    country: String,
    city: String,
    region: String,
    timezone: String,

    // Device Information
    screenResolution: String,
    viewport: String,
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    platform: String,
    language: String,
    referrer: String,

    // Visit Metrics
    visitNumber: {
      type: Number,
      default: 1,
    },
    timeOnPage: {
      type: Number,
      default: 0,
    },
    entryTimestamp: {
      type: Date,
      default: Date.now,
    },
    exitTimestamp: Date,

    // Mouse Events
    mouseEvents: {
      clicks: {
        type: Number,
        default: 0,
      },
      moves: {
        type: Number,
        default: 0,
      },
      scrolls: {
        type: Number,
        default: 0,
      },
      mouseUps: {
        type: Number,
        default: 0,
      },
      mouseDowns: {
        type: Number,
        default: 0,
      },
      mouseWheels: {
        type: Number,
        default: 0,
      },
    },

    // Keyboard Events
    keyboardEvents: {
      keyPresses: {
        type: Number,
        default: 0,
      },
      keyDowns: {
        type: Number,
        default: 0,
      },
      keyUps: {
        type: Number,
        default: 0,
      },
    },

    // Interaction Details
    mouseHoldDuration: {
      type: Number,
      default: 0,
    },
    totalClicksOnPage: {
      type: Number,
      default: 0,
    },
    totalScrollDistance: {
      type: Number,
      default: 0,
    },
    maxScrollDepth: {
      type: Number,
      default: 0,
    },

    // Component Interactions
    componentsInteracted: [
      {
        component: String,
        interactionType: String,
        timestamp: Date,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    // Enhanced: Aggregated interactions by component
    aggregatedInteractions: [
      {
        component: String,
        count: Number,
        firstInteraction: Date,
        lastInteraction: Date,
        types: mongoose.Schema.Types.Mixed, // { click: 5, hover: 2, etc. }
        positions: [
          {
            x: Number,
            y: Number,
            timestamp: Date,
          },
        ],
      },
    ],

    // Enhanced: Interaction timeline for detailed analysis
    interactionTimeline: [
      {
        eventType: String,
        timestamp: Date,
        position: {
          x: Number,
          y: Number,
        },
        target: mongoose.Schema.Types.Mixed,
        page: String,
        scrollDepth: Number,
        viewport: mongoose.Schema.Types.Mixed,
        delay: Number, // Time since last interaction (ms)
      },
    ],

    // Enhanced: Track user delays and idle periods
    idlePeriods: [
      {
        duration: Number, // Duration in ms
        timestamp: Date,
        beforeComponent: String, // Component interacted with after idle
      },
    ],
    activeTime: Number, // Total active time on page (ms)

    // Browser Events
    browserEvents: {
      focus: Number,
      blur: Number,
      resize: Number,
      load: Number,
    },

    // Page Visibility
    visibilityEvents: {
      hidden: Number,
      visible: Number,
      totalHiddenTime: Number,
      totalVisibleTime: Number,
    },

    // Interaction Heatmap (sample of positions)
    clickPositions: [
      {
        x: Number,
        y: Number,
        timestamp: Date,
      },
    ],

    mousePositions: [
      {
        x: Number,
        y: Number,
        timestamp: Date,
      },
    ],

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ sessionId: 1 });
AnalyticsSchema.index({ ip: 1 });
AnalyticsSchema.index({ page: 1 });
AnalyticsSchema.index({ referrer: 1 });
AnalyticsSchema.index({ language: 1 });
AnalyticsSchema.index({ deviceType: 1 });
AnalyticsSchema.index({ country: 1 });

export default mongoose.models.Analytics ||
  mongoose.model("Analytics", AnalyticsSchema);
