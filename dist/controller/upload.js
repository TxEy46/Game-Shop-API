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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const dbconnect_1 = require("../dbconnect");
const router = express_1.default.Router();
// โฟลเดอร์ uploads
const uploadsDir = path_1.default.resolve(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// config multer
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = (0, uuid_1.v4)() + ext;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
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
router.post("/game/:id", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const gameId = req.params.id;
    try {
        yield dbconnect_1.pool.execute("UPDATE games SET image_url = ? WHERE id = ?", [
            fileUrl,
            gameId,
        ]);
        res.json({ url: fileUrl });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database update failed" });
    }
}));
// 📌 อัปโหลด Avatar ผู้ใช้ → อัปเดต DB
router.post("/user/:id", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const userId = req.params.id;
    try {
        yield dbconnect_1.pool.execute("UPDATE users SET avatar_url = ? WHERE id = ?", [
            fileUrl,
            userId,
        ]);
        res.json({ url: fileUrl });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database update failed" });
    }
}));
exports.default = router;
