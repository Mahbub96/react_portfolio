module.exports = {
  apps: [
    {
      name: "mahbub.dev",
      script: "node",
      args: ".next/standalone/server.js",
      cwd: "/var/www/html/mahbub.dev",
      instances: 1, // or 'max' if you want PM2 to auto-scale by CPU cores
      exec_mode: "fork", // keeps it simple and stable for Next.js standalone
      max_memory_restart: "512M", // restarts automatically if memory exceeds 512 MB
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NODE_OPTIONS: "--max-old-space-size=512",
        MONGODB_URI: "mongodb://127.0.0.1:27017/portfolio?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.8"
      },
      error_file: "/var/www/html/mahbub.dev/logs/error.log",
      out_file: "/var/www/html/mahbub.dev/logs/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 5000
    }
  ]
};
