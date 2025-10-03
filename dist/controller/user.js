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
// src/controller/user.ts
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbconnect_1 = require("../dbconnect");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.router = express_1.default.Router();
// ตั้งค่า default avatar ไว้ในโฟลเดอร์ uploads
const DEFAULT_AVATAR = '/uploads/ab9fcf32-a849-4d94-aafa-f06f33a63692.jpg';
// ตั้งค่า multer สำหรับ upload avatar
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, "../uploads");
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = Date.now() + Math.random().toString(36).substring(2) + ext;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({ storage });
// Register User
exports.router.post("/register", upload.single("avatar"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, role } = req.body;
    const avatarFile = req.file;
    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    // email และ password validations...
    try {
        const [rows] = yield dbconnect_1.pool.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: "Email นี้ถูกใช้แล้ว" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // ถ้าไม่ได้อัปโหลดรูป → ใช้ default ในโฟลเดอร์ uploads
        const avatar_url = avatarFile ? `/uploads/${avatarFile.filename}` : DEFAULT_AVATAR;
        const [result] = yield dbconnect_1.pool.execute("INSERT INTO users (username,email,password_hash,role,avatar_url,wallet_balance) VALUES (?,?,?,?,?,0.00)", [username, email, hashedPassword, role, avatar_url]);
        const token = jsonwebtoken_1.default.sign({ id: result.insertId, role }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.json({
            id: result.insertId,
            username,
            email,
            role,
            avatar_url,
            token
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}));
// Login User
exports.router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier, password } = req.body; // identifier = username หรือ email
    if (!identifier || !password)
        return res.status(400).json({ error: "Missing identifier or password" });
    try {
        const [rows] = yield dbconnect_1.pool.execute("SELECT * FROM users WHERE email = ? OR username = ?", [identifier, identifier]);
        const row = rows[0];
        if (!row)
            return res.status(401).json({ error: "Invalid credentials" });
        const match = yield bcrypt_1.default.compare(password, row.password_hash);
        if (!match)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: row.id, role: row.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.json({
            message: "Login success",
            token,
            user: {
                id: row.id,
                username: row.username,
                role: row.role,
                avatar_url: row.avatar_url || null
            },
            balance: row.wallet_balance || 0
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// GET /user
exports.router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield dbconnect_1.pool.query("SELECT id, username, email, role, avatar_url, wallet_balance, created_at FROM users");
        res.json(rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
