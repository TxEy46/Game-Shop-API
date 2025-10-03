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
// src/server.ts
const app_1 = require("./app");
const dbconnect_1 = require("./dbconnect");
const PORT = 3000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, dbconnect_1.testConnection)();
    app_1.app.listen(PORT, () => {
        console.log(`🚀 Game Store API running at http://localhost:${PORT}`);
    });
}))();
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
