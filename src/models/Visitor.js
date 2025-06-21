import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    page: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    country: String,
    city: String,
    region: String,
    timezone: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
VisitorSchema.index({ timestamp: -1 });
VisitorSchema.index({ page: 1 });
VisitorSchema.index({ ip: 1 });

export default mongoose.models.Visitor ||
  mongoose.model("Visitor", VisitorSchema);
