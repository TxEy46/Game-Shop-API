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
const ranking_1 = require("./ranking");
exports.router = express_1.default.Router();
// POST /purchase - ซื้อเกม
exports.router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, game_ids, discount_code_id } = req.body;
    if (!Array.isArray(game_ids) || game_ids.length === 0) {
        return res.status(400).json({ error: "No games to purchase" });
    }
    const conn = yield dbconnect_1.pool.getConnection();
    try {
        yield conn.beginTransaction();
        // --- ตรวจสอบ wallet ---
        const [userRows] = yield conn.query("SELECT wallet_balance FROM users WHERE id = ?", [user_id]);
        if (!userRows.length)
            throw new Error("User not found");
        let walletBalance = Number(userRows[0].wallet_balance);
        // --- ดึงราคารวมของเกม ---
        const [gameRows] = yield conn.query("SELECT id, price FROM games WHERE id IN (?)", [game_ids]);
        const totalAmount = gameRows.reduce((sum, g) => sum + Number(g.price), 0);
        let finalAmount = totalAmount;
        // --- ตรวจสอบ discount code ---
        if (discount_code_id) {
            const [discountRows] = yield conn.query("SELECT * FROM discount_codes WHERE id = ? AND active = 1", [discount_code_id]);
            if (!discountRows.length)
                throw new Error("Discount code invalid or inactive");
            const discount = discountRows[0];
            // ตรวจสอบ min_total
            if (totalAmount < discount.min_total) {
                throw new Error(`ยอดรวมไม่ถึง ${discount.min_total} บาทสำหรับโค้ดนี้`);
            }
            // ตรวจสอบ single_use_per_user
            if (discount.single_use_per_user) {
                const [usedRows] = yield conn.query("SELECT id FROM user_discount_codes WHERE user_id = ? AND discount_code_id = ?", [user_id, discount_code_id]);
                if (usedRows.length)
                    throw new Error("คุณใช้โค้ดนี้แล้ว");
            }
            // ตรวจสอบ usage_limit
            if (discount.usage_limit !== null) {
                const [usedCountRows] = yield conn.query("SELECT COUNT(*) AS used_count FROM user_discount_codes WHERE discount_code_id = ?", [discount_code_id]);
                if (usedCountRows[0].used_count >= discount.usage_limit) {
                    throw new Error("โค้ดส่วนลดหมดแล้ว");
                }
            }
            // คำนวณ finalAmount
            finalAmount = discount.type === "percent"
                ? totalAmount * (1 - Number(discount.value) / 100)
                : totalAmount - Number(discount.value);
            if (finalAmount < 0)
                finalAmount = 0;
            // บันทึกการใช้โค้ด
            yield conn.query("INSERT INTO user_discount_codes (user_id, discount_code_id) VALUES (?, ?)", [user_id, discount_code_id]);
            // ปิดโค้ดถ้าเกิน usage_limit
            if (discount.usage_limit !== null) {
                const [usedCountRowsAfter] = yield conn.query("SELECT COUNT(*) AS used_count FROM user_discount_codes WHERE discount_code_id = ?", [discount_code_id]);
                if (usedCountRowsAfter[0].used_count >= discount.usage_limit) {
                    yield conn.query("UPDATE discount_codes SET active = 0 WHERE id = ?", [discount_code_id]);
                }
            }
        }
        // --- ตรวจสอบยอดเงินเพียงพอ ---
        if (walletBalance < finalAmount)
            throw new Error("Insufficient balance");
        // --- สร้าง purchase ---
        const [purchaseResult] = yield conn.query("INSERT INTO purchases (user_id, purchase_date, total_amount, discount_code_id, final_amount) VALUES (?, NOW(), ?, ?, ?)", [user_id, totalAmount, discount_code_id || null, finalAmount]);
        const purchaseId = purchaseResult.insertId;
        // --- เพิ่ม purchase_items และ purchased_games ---
        for (const game of gameRows) {
            yield conn.query("INSERT INTO purchase_items (purchase_id, game_id, price_at_purchase) VALUES (?, ?, ?)", [purchaseId, game.id, game.price]);
            yield conn.query("INSERT IGNORE INTO purchased_games (user_id, game_id) VALUES (?, ?)", [user_id, game.id]);
            // อัปเดต ranking
            yield (0, ranking_1.updateRanking)(game.id);
        }
        // --- หัก wallet ---
        yield conn.query("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?", [finalAmount, user_id]);
        // --- เพิ่ม transaction ---
        yield conn.query("INSERT INTO user_transactions (user_id, type, amount, description) VALUES (?, 'purchase', ?, 'Purchase games')", [user_id, finalAmount]);
        // --- ล้างตะกร้า ---
        const [cartRows] = yield conn.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
        if (cartRows.length) {
            const cartId = cartRows[0].id;
            yield conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
        }
        yield conn.commit();
        res.json({ message: "Purchase successful", purchase_id: purchaseId, finalAmount });
    }
    catch (err) {
        yield conn.rollback();
        res.status(400).json({ error: err.message });
    }
    finally {
        conn.release();
    }
}));
// GET เกมที่ผู้ใช้ซื้อแล้ว
exports.router.get("/:user_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = yield dbconnect_1.pool.query(`SELECT g.id, g.name, g.image_url
       FROM purchased_games pg
       JOIN games g ON pg.game_id = g.id
       WHERE pg.user_id = ?`, [user_id]);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
