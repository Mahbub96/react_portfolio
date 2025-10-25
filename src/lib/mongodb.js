import mongoose from "mongoose";

// Only use an explicit MONGODB_URI when provided. During CI/build we
// intentionally avoid defaulting to a local MongoDB instance so the
// build/export won't attempt to connect to localhost:27017 and fail.
const MONGODB_URI = process.env.MONGODB_URI || null;

if (!MONGODB_URI) {
  // Do not throw here — allow the app to run in environments without a DB
  // (for example CI or static export). Callers should handle a missing DB
  // and provide fallbacks where appropriate.
  // eslint-disable-next-line no-console
  console.warn(
    "MONGODB_URI is not defined — database connections will be skipped."
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (!MONGODB_URI) {
    // Skip attempting to connect when no URI is provided.
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("Failed to connect to MongoDB:", e);
    cached.promise = null;
    throw e;
  }

  console.log("MongoDB connected successfully");
  return cached.conn;
}

export default connectDB;
