"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const app_1 = require("./app");
const dbconnect_1 = require("./dbconnect");
// แปลง process.env.PORT ให้เป็น number
const PORT = parseInt(process.env.PORT || "3306", 10);
// ฟังก์ชันหา IP ของ Wi-Fi / LAN
function getLocalIP() {
    const nets = (0, os_1.networkInterfaces)();
    for (const name of Object.keys(nets)) {
        const iface = nets[name];
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    // ทดสอบการเชื่อมต่อ DB
    yield (0, dbconnect_1.testConnection)();
    // Listen ที่ 0.0.0.0 → เข้าถึงจาก localhost + LAN
    app_1.app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Game Store API running at http://localhost:${PORT}`);
        console.log(`🌐 Accessible in LAN at http://${HOST}:${PORT}`);
    });
}))();
