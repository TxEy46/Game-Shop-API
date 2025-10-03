import { networkInterfaces } from "os";
import { app } from "./app";
import { testConnection } from "./dbconnect";

// แปลง process.env.PORT ให้เป็น number
const PORT = parseInt(process.env.PORT || "3306", 10);

// ฟังก์ชันหา IP ของ Wi-Fi / LAN
function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const iface = nets[name]!;
    for (const net of iface) {
      // ใช้ IPv4 และไม่ใช่ loopback
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '0.0.0.0';
}

const HOST = getLocalIP();

(async () => {
  // ทดสอบการเชื่อมต่อ DB
  await testConnection();

  // Listen ที่ 0.0.0.0 → เข้าถึงจาก localhost + LAN
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Game Store API running at http://localhost:${PORT}`);
    console.log(`🌐 Accessible in LAN at http://${HOST}:${PORT}`);
  });
})();
