module.exports = {
  apps: [
    {
      name: "next-app",
      script: "node .next/standalone/server.js",
      env: {
        NODE_ENV: "production",
        MONGODB_URI:
          "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8",
      },
    },
  ],
};
