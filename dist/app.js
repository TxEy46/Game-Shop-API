"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
// import routers
const upload_1 = __importDefault(require("./controller/upload"));
const user_1 = require("./controller/user");
const game_1 = require("./controller/game");
const purchase_1 = require("./controller/purchase");
const wallet_1 = require("./controller/wallet");
const cart_1 = require("./controller/cart");
const ranking_1 = require("./controller/ranking");
const category_1 = require("./controller/category");
const discount_1 = require("./controller/discount");
const auth_1 = require("./middleware/auth");
const admin_1 = require("./controller/admin");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(body_parser_1.default.json());
exports.app.use(body_parser_1.default.urlencoded({ extended: true }));
// เสิร์ฟไฟล์ static (สำหรับรูปที่อัปโหลด)
exports.app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
// Root route
exports.app.get("/", (req, res) => {
    res.send("Connected API Game Store");
});
// Routes
exports.app.use("/upload", upload_1.default);
exports.app.use("/user", user_1.router);
exports.app.use("/game", game_1.router);
exports.app.use("/purchase", purchase_1.router);
exports.app.use("/wallet", wallet_1.router);
exports.app.use("/cart", cart_1.router);
exports.app.use("/discount_codes", discount_1.router);
exports.app.use("/ranking", ranking_1.router);
exports.app.use("/categories", category_1.router);
exports.app.use("/admin", auth_1.authenticateJWT, auth_1.isAdmin, admin_1.adminRouter);
