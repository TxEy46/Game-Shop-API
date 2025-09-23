import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

// import routers
import uploadRouter from "./controller/upload";
import { router as userRouter } from "./controller/user";
import { router as gameRouter } from "./controller/game";
import { router as purchaseRouter } from "./controller/purchase";
import { router as walletRouter } from "./controller/wallet";
import { router as cartRouter } from "./controller/cart";
import { router as rankingRouter } from "./controller/ranking";
import { router as categoryRouter } from "./controller/category";
import { router as discountRouter } from "./controller/discount";
import { authenticateJWT, isAdmin } from "./middleware/auth";
import { adminRouter } from "./controller/admin";
export const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// เสิร์ฟไฟล์ static (สำหรับรูปที่อัปโหลด)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/upload", uploadRouter);
app.use("/user", userRouter);
app.use("/game", gameRouter);
app.use("/purchase", purchaseRouter);
app.use("/wallet", walletRouter);
app.use("/cart", cartRouter);
app.use("/discount_codes", discountRouter);
app.use("/ranking", rankingRouter);
app.use("/categories", categoryRouter);
app.use("/admin", authenticateJWT, isAdmin, adminRouter);
