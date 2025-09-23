// src/controller/user.ts
import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../dbconnect";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

export const router = express.Router();


// ตั้งค่า default avatar ไว้ในโฟลเดอร์ uploads
const DEFAULT_AVATAR = '/uploads/ab9fcf32-a849-4d94-aafa-f06f33a63692.jpg';

// ตั้งค่า multer สำหรับ upload avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + Math.random().toString(36).substring(2) + ext;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Register User
router.post("/register", upload.single("avatar"), async (req, res) => {
    const { username, email, password, role } = req.body;
    const avatarFile = req.file;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // email และ password validations...

    try {
        const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
        if ((rows as any).length > 0) {
            return res.status(400).json({ error: "Email นี้ถูกใช้แล้ว" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ถ้าไม่ได้อัปโหลดรูป → ใช้ default ในโฟลเดอร์ uploads
        const avatar_url = avatarFile ? `/uploads/${avatarFile.filename}` : DEFAULT_AVATAR;

        const [result] = await pool.execute(
            "INSERT INTO users (username,email,password_hash,role,avatar_url,wallet_balance) VALUES (?,?,?,?,?,0.00)",
            [username, email, hashedPassword, role, avatar_url]
        );

        const token = jwt.sign(
            { id: (result as any).insertId, role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        res.json({
            id: (result as any).insertId,
            username,
            email,
            role,
            avatar_url,
            token
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// Login User
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body; // identifier = username หรือ email
    if (!identifier || !password) return res.status(400).json({ error: "Missing identifier or password" });

    try {
        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [identifier, identifier]
        );
        const row = (rows as any[])[0];
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, row.password_hash);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: row.id, role: row.role },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

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
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /user
router.get("/", async (_req, res) => {
    try {
        const [rows]: any = await pool.query(
            "SELECT id, username, email, role, avatar_url, wallet_balance, created_at FROM users"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
