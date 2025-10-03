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
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const dbconnect_1 = require("../dbconnect");
exports.adminRouter = express_1.default.Router();
// Middleware ตรวจสอบว่าเป็น admin
exports.adminRouter.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // สมมติว่ามี middleware ตรวจสอบ JWT หรือ session แล้วเก็บ user ไว้
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
    }
    // req.user = { id: 1, role: "admin" };
    next();
}));
/**
 * 1. ดูประวัติธุรกรรมผู้ใช้แต่ละคน
 * GET /admin/users/:user_id/transactions
 */
exports.adminRouter.get("/users/:user_id/transactions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.user_id);
    try {
        const [rows] = yield dbconnect_1.pool.query(`SELECT id, type, amount, description, created_at
        FROM user_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC`, [userId]);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}));
/**
 * 2. สร้างหรือแก้ไขโค้ดส่วนลด
 * POST /admin/discount-codes
 */
exports.adminRouter.put("/discount-codes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const { code, type, value, min_total, usage_limit, single_use_per_user, start_date, end_date, active } = req.body;
    try {
        // อัพเดทโค้ดส่วนลด
        yield dbconnect_1.pool.query(`UPDATE discount_codes
        SET code = ?, type = ?, value = ?, min_total = ?, usage_limit = ?, single_use_per_user = ?, start_date = ?, end_date = ?, active = ?
        WHERE id = ?`, [code, type, value, min_total || 0, usage_limit || null, single_use_per_user ? 1 : 0, start_date || null, end_date || null, active ? 1 : 0, id]);
        // ✅ ถ้าเปิดใช้งานใหม่ active = 1 ให้รีเซ็ต record การใช้งานเก่า
        if (active) {
            yield dbconnect_1.pool.query('DELETE FROM user_discount_codes WHERE discount_code_id = ?', [id]);
        }
        res.json({ message: "Discount code updated" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}));
/**
 * 3. ตรวจสอบโค้ดส่วนลดก่อนใช้ (สำหรับ admin หรือ frontend)
 * GET /admin/discount-codes/:code
 */
exports.adminRouter.get("/discount-codes/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.params.code;
    try {
        const [rows] = yield dbconnect_1.pool.query("SELECT * FROM discount_codes WHERE code = ? AND active = 1", [code]);
        if (!rows.length)
            return res.status(404).json({ error: "Discount code not found or inactive" });
        res.json(rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}));
/**
 * 4. ลบโค้ดส่วนลด พร้อมลบ record ของผู้ใช้ที่เคยใช้โค้ดนี้
 * DELETE /admin/discount-codes/:id
 */
exports.adminRouter.delete("/discount-codes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id)
        return res.status(400).json({ error: "Missing discount code ID" });
    try {
        // 1. ลบ record การซื้อที่ใช้ discount code นี้
        yield dbconnect_1.pool.query('DELETE FROM purchases WHERE discount_code_id = ?', [id]);
        // 2. ลบ record ของผู้ใช้ที่เคยใช้โค้ดนี้
        yield dbconnect_1.pool.query('DELETE FROM user_discount_codes WHERE discount_code_id = ?', [id]);
        // 3. ลบ record โค้ดส่วนลด
        const [result] = yield dbconnect_1.pool.query('DELETE FROM discount_codes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Discount code not found" });
        }
        res.json({ message: "Deleted successfully" });
    }
    catch (err) {
        console.error(err);
        // ถ้ามี foreign key constraint อื่น ๆ ยังล้มเหลว
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "Cannot delete discount code, still referenced in another table" });
        }
        res.status(500).json({ error: "Database error" });
    }
}));
/**
 * 5. ดูประวัติธุรกรรมทั้งหมด (สำหรับ admin)
 * GET /admin/transactions
 */
exports.adminRouter.get("/transactions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield dbconnect_1.pool.query(`
        SELECT ut.id, ut.user_id, u.username AS user_name, ut.type, ut.amount, ut.description, ut.created_at
        FROM user_transactions ut
        JOIN users u ON ut.user_id = u.id
        ORDER BY ut.created_at DESC
      `);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}));
// GET /admin/discount-codes
exports.adminRouter.get("/discount-codes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield dbconnect_1.pool.query("SELECT * FROM discount_codes ORDER BY id DESC");
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}));
// สร้างโค้ดส่วนลดใหม่
exports.adminRouter.post("/discount-codes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, type, value, min_total, usage_limit, single_use_per_user, start_date, end_date, active } = req.body;
    try {
        const [result] = yield dbconnect_1.pool.query(`INSERT INTO discount_codes
        (code, type, value, min_total, usage_limit, single_use_per_user, start_date, end_date, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            code,
            type,
            value,
            min_total || 0,
            usage_limit || null,
            single_use_per_user ? 1 : 0,
            start_date || null,
            end_date || null,
            active ? 1 : 0
        ]);
        // ✅ ถ้า active = 1 ไม่ต้องลบ record เพราะยังไม่มีใครใช้
        res.json({ message: "Discount code created", id: result.insertId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}));
