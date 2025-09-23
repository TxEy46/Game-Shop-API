// src/server.ts
import { app } from "./app";
import { testConnection } from "./dbconnect";

const PORT = 3000;

(async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Game Store API running at http://localhost:${PORT}`);
  });
})();
