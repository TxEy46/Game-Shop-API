import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../dbconnect";

const router = express.Router();

// โฟลเดอร์ uploads
const uploadsDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// config multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ========== ROUTES ==========

// 📌 อัปโหลดทั่วไป
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 📌 อัปโหลดรูปเกม → อัปเดต DB
router.post("/game/:id", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const gameId = req.params.id;

  try {
    await pool.execute("UPDATE games SET image_url = ? WHERE id = ?", [
      fileUrl,
      gameId,
    ]);
    res.json({ url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database update failed" });
  }
});

// 📌 อัปโหลด Avatar ผู้ใช้ → อัปเดต DB
router.post("/user/:id", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const userId = req.params.id;

  try {
    await pool.execute("UPDATE users SET avatar_url = ? WHERE id = ?", [
      fileUrl,
      userId,
    ]);
    res.json({ url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database update failed" });
  }
});

export default router;
