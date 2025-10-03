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
exports.router = void 0;
const express_1 = require("express");
const dbconnect_1 = require("../dbconnect");
exports.router = (0, express_1.Router)();
// ดูยอดเงิน Wallet
exports.router.get("/:user_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = yield dbconnect_1.pool.query("SELECT wallet_balance FROM users WHERE id = ?", [user_id]);
        if (!rows.length)
            return res.status(404).json({ error: "User not found" });
        res.json({ wallet_balance: rows[0].wallet_balance });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
// เติมเงิน
exports.router.post("/deposit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, amount } = req.body;
    if (!amount || amount <= 0)
        return res.status(400).json({ error: "Invalid amount" });
    const conn = yield dbconnect_1.pool.getConnection();
    try {
        yield conn.beginTransaction();
        yield conn.query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, user_id]);
        yield conn.query("INSERT INTO user_transactions (user_id, type, amount, description) VALUES (?, 'deposit', ?, 'Deposit wallet')", [user_id, amount]);
        yield conn.commit();
        res.json({ message: "Deposit successful" });
    }
    catch (err) {
        yield conn.rollback();
        console.error(err);
        res.status(500).json({ error: "Deposit failed" });
    }
    finally {
        conn.release();
    }
}));
// Transaction History
exports.router.get("/transactions/:user_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = yield dbconnect_1.pool.query("SELECT type, amount, description, created_at FROM user_transactions WHERE user_id = ? ORDER BY created_at DESC", [user_id]);
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
