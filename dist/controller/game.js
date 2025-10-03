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
// src/controller/game.ts
const express_1 = __importDefault(require("express"));
const dbconnect_1 = require("../dbconnect");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.router = express_1.default.Router();
// ------------------ CONFIG UPLOAD ------------------
const uploadsDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// ------------------ READ ------------------
// Get all games
exports.router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield dbconnect_1.pool.query(`SELECT g.*, c.name AS category_name 
       FROM games g 
       LEFT JOIN categories c ON g.category_id = c.id`);
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// Get game by ID
exports.router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = Number(req.params.id);
    if (!gameId)
        return res.status(400).json({ error: "Invalid game ID" });
    try {
        const [rows] = yield dbconnect_1.pool.query(`SELECT g.*, c.name AS category_name
       FROM games g
       LEFT JOIN categories c ON g.category_id = c.id
       WHERE g.id = ?`, [gameId]);
        if (rows.length === 0)
            return res.status(404).json({ error: "Game not found" });
        res.json(rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// ------------------ CREATE ------------------
exports.router.post("/", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, category_id, description, release_date } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    if (!name || !price || !category_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    // ถ้า client ไม่ส่ง release_date ให้ใช้วันนี้
    const releaseDateToUse = release_date || new Date().toISOString().split("T")[0];
    try {
        const [result] = yield dbconnect_1.pool.query(`INSERT INTO games (name, price, category_id, image_url, description, release_date)
       VALUES (?, ?, ?, ?, ?, ?)`, [name, price, category_id, image_url, description || null, releaseDateToUse]);
        res.json({ message: "Game added", game_id: result.insertId, image_url, release_date: releaseDateToUse });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// ------------------ UPDATE ------------------
exports.router.put("/:id", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = Number(req.params.id);
    const { name, price, category_id, description, release_date } = req.body;
    if (!gameId)
        return res.status(400).json({ error: "Invalid game ID" });
    try {
        // ดึง image_url เดิม
        let currentImage = null;
        const [rows] = yield dbconnect_1.pool.query("SELECT image_url FROM games WHERE id = ?", [gameId]);
        if (rows.length > 0) {
            currentImage = rows[0].image_url;
        }
        const image_url = req.file ? `/uploads/${req.file.filename}` : currentImage;
        const fields = [];
        const params = [];
        if (name !== undefined) {
            fields.push("name = ?");
            params.push(name);
        }
        if (price !== undefined) {
            fields.push("price = ?");
            params.push(price);
        }
        if (category_id !== undefined) {
            fields.push("category_id = ?");
            params.push(category_id);
        }
        if (description !== undefined) {
            fields.push("description = ?");
            params.push(description);
        }
        if (release_date !== undefined) {
            fields.push("release_date = ?");
            params.push(release_date);
        }
        if (image_url !== undefined) {
            fields.push("image_url = ?");
            params.push(image_url);
        }
        if (fields.length === 0)
            return res.status(400).json({ error: "No fields to update" });
        params.push(gameId);
        const sql = `UPDATE games SET ${fields.join(", ")} WHERE id = ?`;
        yield dbconnect_1.pool.query(sql, params);
        res.json({ message: "Game updated", image_url });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// ------------------ DELETE ------------------
exports.router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = Number(req.params.id);
    const conn = yield dbconnect_1.pool.getConnection();
    try {
        const [rows] = yield conn.query("SELECT COUNT(*) as count FROM purchase_items WHERE game_id = ?", [gameId]);
        if (rows[0].count > 0) {
            return res.status(400).json({ error: "Cannot delete this game, it has been purchased." });
        }
        yield conn.query("DELETE FROM games WHERE id = ?", [gameId]);
        res.json({ message: "Game deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
    finally {
        conn.release();
    }
}));
