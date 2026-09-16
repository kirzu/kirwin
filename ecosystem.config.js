/**
 * PM2 ecosystem configuration for the Kirwin Bodywork Seminars Next.js app.
 *
 * Usage on the VPS:
 *   cd /var/www/kirwin
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup    # run the printed command once to enable boot auto-start
 *
 * To redeploy after pulling new code:
 *   pm2 reload kirwin
 */
module.exports = {
  apps: [
    {
      name: 'kirwin',
      cwd: '/var/www/kirwin',
      script: 'npm',
      args: 'run start',
      // Next.js production server.
      interpreter: 'none',
      // Process lifecycle.
      autorestart: true,
      restart_delay: 2000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Environment.
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logs.
      log_file: '/var/log/pm2/kirwin.log',
      out_file: '/var/log/pm2/kirwin.out.log',
      error_file: '/var/log/pm2/kirwin.error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Resource limits (prevent runaway memory).
      max_memory_restart: '512M',
    },
  ],
};
