module.exports = {
  apps: [
    {
      name: "mahbub.dev",
      script: "server.js",
      cwd: "/var/www/html/mahbub.dev/.next/standalone",
      instances: 1, // use 'max' to scale by CPU cores
      exec_mode: "fork", // stable and simple for standalone Next.js
      max_memory_restart: "512M", // restart if memory exceeds 512MB

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NODE_OPTIONS: "--max-old-space-size=512",

        // ✅ DB should come from environment variables (set via deploy)
        MONGODB_URI: process.env.MONGODB_URI,
        NEXT_PUBLIC_BASE_URL: "https://mahbub.dev",
      },

      error_file: "/var/www/html/mahbub.dev/logs/error.log",
      out_file: "/var/www/html/mahbub.dev/logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000,
    },
  ],
};
