const app = require("./app");
const env = require("./config/env");
const { dbPing } = require("./config/db");

async function start() {
  await dbPing();

  app.listen(env.PORT, () => {
    console.log(`✅ Server running on http://localhost:${env.PORT}`);
    console.log(`✅ Health: http://localhost:${env.PORT}/health`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start:", err);
  process.exit(1);
});
