module.exports = {
  apps: [
    {
      // Production App
      name: "mahbub.dev",
      script: "server.js",
      cwd: "/var/www/html/mahbub.dev/.next/standalone",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NODE_OPTIONS: "--max-old-space-size=512",
        MONGODB_URI: process.env.MONGODB_URI,
        NEXT_PUBLIC_BASE_URL: "https://mahbub.dev",
      },
      error_file: "/var/www/html/mahbub.dev/logs/error.log",
      out_file: "/var/www/html/mahbub.dev/logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
    },

    {
      // Test App
      name: "test.mahbub.dev",
      script: "server.js",
      cwd: "/var/www/html/test.mahbub.dev/.next/standalone",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "test",
        PORT: 4000, // Make sure test uses a different port
        NODE_OPTIONS: "--max-old-space-size=512",
        MONGODB_URI: process.env.MONGODB_URI, // Can use same DB or test DB
        NEXT_PUBLIC_BASE_URL: "https://test.mahbub.dev",
      },
      error_file: "/var/www/html/test.mahbub.dev/logs/error.log",
      out_file: "/var/www/html/test.mahbub.dev/logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
    },
  ],
};
