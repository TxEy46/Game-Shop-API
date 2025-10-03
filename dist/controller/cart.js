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
// Get cart ของ user
exports.router.get("/:user_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = Number(req.params.user_id);
    try {
        const [cartRows] = yield dbconnect_1.pool.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
        if (cartRows.length === 0) {
            return res.json([]);
        }
        const cartId = cartRows[0].id;
        const [items] = yield dbconnect_1.pool.query(`SELECT ci.id, ci.game_id, ci.quantity, g.name, g.price, g.image_url
       FROM cart_items ci
       JOIN games g ON ci.game_id = g.id
       WHERE ci.cart_id = ?`, [cartId]);
        res.json(items);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Add game to cart
exports.router.post("/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, game_id, quantity } = req.body;
    if (!user_id || !game_id)
        return res.status(400).json({ error: "Missing parameters" });
    const conn = yield dbconnect_1.pool.getConnection();
    try {
        yield conn.beginTransaction();
        // ตรวจว่ามี cart ของ user หรือยัง
        const [cartRows] = yield conn.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
        let cartId;
        if (cartRows.length === 0) {
            const [result] = yield conn.query("INSERT INTO carts (user_id) VALUES (?)", [user_id]);
            cartId = result.insertId;
        }
        else {
            cartId = cartRows[0].id;
        }
        // ตรวจว่ามีเกมใน cart หรือยัง
        const [itemRows] = yield conn.query("SELECT quantity FROM cart_items WHERE cart_id = ? AND game_id = ?", [cartId, game_id]);
        if (itemRows.length === 0) {
            yield conn.query("INSERT INTO cart_items (cart_id, game_id, quantity) VALUES (?, ?, ?)", [cartId, game_id, quantity || 1]);
        }
        else {
            yield conn.query("UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND game_id = ?", [quantity || 1, cartId, game_id]);
        }
        yield conn.commit();
        res.json({ message: "Added to cart" });
    }
    catch (err) {
        yield conn.rollback();
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        conn.release();
    }
}));
// Remove game from cart
exports.router.post("/remove", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, game_id } = req.body;
    if (!user_id || !game_id)
        return res.status(400).json({ error: "Missing parameters" });
    try {
        const [cartRows] = yield dbconnect_1.pool.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
        if (cartRows.length === 0)
            return res.status(400).json({ error: "Cart not found" });
        const cartId = cartRows[0].id;
        yield dbconnect_1.pool.query("DELETE FROM cart_items WHERE cart_id = ? AND game_id = ?", [cartId, game_id]);
        res.json({ message: "Removed from cart" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// Clear cart
exports.router.post("/clear", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.body;
    if (!user_id)
        return res.status(400).json({ error: "Missing user_id" });
    try {
        const [cartRows] = yield dbconnect_1.pool.query("SELECT id FROM carts WHERE user_id = ?", [user_id]);
        if (cartRows.length === 0)
            return res.json({ message: "Cart is already empty" });
        const cartId = cartRows[0].id;
        yield dbconnect_1.pool.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
        res.json({ message: "Cart cleared" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
