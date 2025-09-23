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


// // ฟังก์ชันหา IP ของ Wi-Fi / LAN
// function getLocalIP(): string {
//   const nets = networkInterfaces();
//   for (const name of Object.keys(nets)) {
//     const iface = nets[name]!;
//     for (const net of iface) {
//       // ใช้ IPv4 และไม่ใช่ loopback
//       if (net.family === 'IPv4' && !net.internal) {
//         return net.address;
//       }
//     }
//   }
//   return '0.0.0.0';
// }

// const HOST = getLocalIP();

// app.listen(PORT, HOST, () => {
//   console.log(`🚀 Game Store API running at http://${HOST}:${PORT}`);
// });
