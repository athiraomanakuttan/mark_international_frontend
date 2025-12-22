module.exports = {
  apps: [{
    name: 'mark-international-frontend',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Prevent Node.js from crashing on unhandled rejections
      NODE_OPTIONS: '--max-old-space-size=2048'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Monitor for timeouts and slow requests
    log_type: 'json',
    merge_logs: true,
    
    // Restart on high memory usage (potential memory leaks from hanging requests)
    max_memory_restart: '500M',
    
    // Custom monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    
    // Health monitoring - CRITICAL for preventing restart loops
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Wait for app to be ready
    listen_timeout: 10000,
    
    // Graceful shutdown
    shutdown_with_message: true,
    
    // Auto restart on crash with exponential backoff
    exp_backoff_restart_delay: 100,
    
    // Environment-specific settings
    env_production: {
      NODE_ENV: 'production',
      // Add your backend URL
      NEXT_PUBLIC_BACKEND_URI: process.env.NEXT_PUBLIC_BACKEND_URI || 'YOUR_BACKEND_URL'
    }
  }]
};