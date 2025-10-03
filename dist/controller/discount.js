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
const express_1 = __importDefault(require("express"));
const dbconnect_1 = require("../dbconnect");
exports.router = express_1.default.Router();
// GET โค้ดส่วนลดตาม code
exports.router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    if (!code)
        return res.status(400).json({ error: "Missing code" });
    try {
        const [rows] = yield dbconnect_1.pool.query("SELECT * FROM discount_codes WHERE code = ? AND active = 1", [code]);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}));
// ตัวอย่างใน discount router
exports.router.get("/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.params.code;
    const total = Number(req.query.total) || 0;
    const user_id = Number(req.query.user_id);
    try {
        const [rows] = yield dbconnect_1.pool.query("SELECT * FROM discount_codes WHERE code = ? AND active = 1", [code]);
        if (!rows.length)
            return res.json([]);
        const discount = rows[0];
        // ตรวจสอบยอดขั้นต่ำ
        if (total < discount.min_total)
            return res.json([]);
        // ตรวจสอบว่าผู้ใช้ใช้โค้ดนี้ไปแล้วหรือไม่
        let used_by_user = false;
        if (discount.single_use_per_user && user_id) {
            const [usedRows] = yield dbconnect_1.pool.query("SELECT id FROM user_discount_codes WHERE user_id = ? AND discount_code_id = ?", [user_id, discount.id]);
            used_by_user = usedRows.length > 0;
        }
        // คำนวณ finalAmount
        const finalAmount = discount.type === "percent"
            ? total * (1 - Number(discount.value) / 100)
            : total - Number(discount.value);
        res.json([Object.assign(Object.assign({}, discount), { finalAmount: finalAmount < 0 ? 0 : finalAmount, used_by_user })]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = exports.router;
