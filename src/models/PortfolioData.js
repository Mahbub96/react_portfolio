import mongoose from "mongoose";

const PortfolioDataSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
      enum: ["profile", "Skills", "Experiences", "Projects", "Educations"],
      unique: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for collectionName (unique)
PortfolioDataSchema.index({ collectionName: 1 }, { unique: true });

export default mongoose.models.PortfolioData ||
  mongoose.model("PortfolioData", PortfolioDataSchema);
