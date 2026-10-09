import mongoose from "mongoose";

// One document per admin login. The session cookie carries a JWT whose `jti`
// points here, so a logout (or a forced logout) revokes the cookie server-side
// even though the JWT itself has not expired yet.
const AdminSessionSchema = new mongoose.Schema({
  jti: { type: String, index: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.AdminSession ||
  mongoose.model("AdminSession", AdminSessionSchema);
