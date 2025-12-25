const app = require("./app");
const env = require("./config/env");
const { dbPing } = require("./config/db");

const PORT = Number(env.PORT) || 4000;

// 1) Avval server portni ochsin (Render shu narsani kutadi)
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});

// 2) DB ulanishni keyin tekshir (ulanmasa ham server yiqilmaydi)
(async () => {
  await dbPing();
})();

// 3) Process crash bo‘lsa ham log chiqsin
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});
