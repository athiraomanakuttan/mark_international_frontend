module.exports = {
  apps: [{
    name: 'mark-international-frontend',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
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
    
    // Health monitoring
    min_uptime: '10s',
    max_restarts: 10,
    
    // Environment-specific settings
    env_production: {
      NODE_ENV: 'production',
      // Add your backend URL
      NEXT_PUBLIC_BACKEND_URI: 'YOUR_BACKEND_URL'
    }
  }]
};