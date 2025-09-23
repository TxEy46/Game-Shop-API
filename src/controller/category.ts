// src/controller/category.ts
import express from "express";
import { pool } from "../dbconnect";

export const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
