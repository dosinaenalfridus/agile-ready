module.exports = {
  apps: [
    {
      name: "agileready-web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "1G",
    },
  ],
};
