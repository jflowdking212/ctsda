module.exports = {
  apps: [
    {
      name: "ctsda-web",
      cwd: "/home/acecoter/public_html/ctsda.acecoterieconsulting.com/apps/web",
      script: "npm",
      args: "start -- -p 4005",
      env: {
        NODE_ENV: "production",
        PORT: 4005
      }
    },
    {
      name: "ctsda-api",
      cwd: "/home/acecoter/public_html/ctsda.acecoterieconsulting.com/apps/api",
      script: "dist/src/main.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};
