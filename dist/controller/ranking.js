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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
exports.updateRanking = updateRanking;
const express_1 = __importDefault(require("express"));
const dbconnect_1 = require("../dbconnect");
exports.router = express_1.default.Router();
// ดึง Top 5 เกมขายดีที่สุดตลอดกาล
exports.router.get("/top", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // query จาก ranking table โดยตรง
        const [rows] = yield dbconnect_1.pool.query(`
      SELECT g.id, g.name, g.image_url, r.sales_count
      FROM ranking r
      JOIN games g ON r.game_id = g.id
      ORDER BY r.sales_count DESC
      LIMIT 5
      `);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// ฟังก์ชันอัปเดตยอดขายสะสมเมื่อซื้อเกม
function updateRanking(gameId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield dbconnect_1.pool.query(`
      INSERT INTO ranking (game_id, sales_count)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE
        sales_count = sales_count + 1
      `, [gameId]);
        }
        catch (err) {
            console.error("Failed to update ranking:", err);
        }
    });
}
