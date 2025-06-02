module.exports = {
  apps: [
    {
      name: 'app',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: true,
      ignore_watch: [
        'node_modules',    
        'uploads',   
        'logs',               
      ],
      autorestart: true, // 앱이 죽으면 자동 재시작
      max_restarts: 10, // 최대 재시작 시도 횟수
      min_uptime: '60s', // 최소 정상 작동 시간
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
