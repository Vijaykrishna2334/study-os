module.exports = {
  apps: [
    {
      name: "study-app",
      script: "/var/www/study-app/.next/standalone/server.js",
      cwd: "/var/www/study-app/.next/standalone",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        GOOGLE_APPLICATION_CREDENTIALS: "/var/www/study-app/gcp-key.json",
      },
      max_memory_restart: "1500M",
      instances: 1,
      autorestart: true,
      watch: false,
      error_file: "/var/log/study-app/error.log",
      out_file: "/var/log/study-app/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
