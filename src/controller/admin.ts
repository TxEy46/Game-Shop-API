  import express from "express";
  import { pool } from "../dbconnect";

  export const adminRouter = express.Router();

  // Middleware ตรวจสอบว่าเป็น admin
  adminRouter.use(async (req: any, res, next) => {
      const user = req.user; // สมมติว่ามี middleware ตรวจสอบ JWT หรือ session แล้วเก็บ user ไว้
      if (!user || user.role !== 'admin') {
          return res.status(403).json({ error: "Access denied" });
      }
      // req.user = { id: 1, role: "admin" };
      next();
  });

  /**
   * 1. ดูประวัติธุรกรรมผู้ใช้แต่ละคน
   * GET /admin/users/:user_id/transactions
   */
  adminRouter.get("/users/:user_id/transactions", async (req, res) => {
      const userId = Number(req.params.user_id);
      try {
          const [rows]: any = await pool.query(
              `SELECT id, type, amount, description, created_at
        FROM user_transactions
        WHERE user_id = ?
        ORDER BY created_at DESC`,
              [userId]
          );
          res.json(rows);
      } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Database error" });
      }
  });

  /**
   * 2. สร้างหรือแก้ไขโค้ดส่วนลด
   * POST /admin/discount-codes
   */
  adminRouter.put("/discount-codes/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { code, type, value, min_total, usage_limit, single_use_per_user, start_date, end_date, active } = req.body;

    try {
      // อัพเดทโค้ดส่วนลด
      await pool.query(
        `UPDATE discount_codes
        SET code = ?, type = ?, value = ?, min_total = ?, usage_limit = ?, single_use_per_user = ?, start_date = ?, end_date = ?, active = ?
        WHERE id = ?`,
        [code, type, value, min_total || 0, usage_limit || null, single_use_per_user ? 1 : 0, start_date || null, end_date || null, active ? 1 : 0, id]
      );

      // ✅ ถ้าเปิดใช้งานใหม่ active = 1 ให้รีเซ็ต record การใช้งานเก่า
      if (active) {
        await pool.query('DELETE FROM user_discount_codes WHERE discount_code_id = ?', [id]);
      }

      res.json({ message: "Discount code updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  /**
   * 3. ตรวจสอบโค้ดส่วนลดก่อนใช้ (สำหรับ admin หรือ frontend)
   * GET /admin/discount-codes/:code
   */
  adminRouter.get("/discount-codes/:code", async (req, res) => {
      const code = req.params.code;
      try {
          const [rows]: any = await pool.query(
              "SELECT * FROM discount_codes WHERE code = ? AND active = 1",
              [code]
          );
          if (!rows.length) return res.status(404).json({ error: "Discount code not found or inactive" });
          res.json(rows[0]);
      } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Database error" });
      }
  });

  /**
   * 4. ลบโค้ดส่วนลด พร้อมลบ record ของผู้ใช้ที่เคยใช้โค้ดนี้
   * DELETE /admin/discount-codes/:id
   */
  adminRouter.delete("/discount-codes/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Missing discount code ID" });

    try {
      // 1. ลบ record การซื้อที่ใช้ discount code นี้
      await pool.query('DELETE FROM purchases WHERE discount_code_id = ?', [id]);

      // 2. ลบ record ของผู้ใช้ที่เคยใช้โค้ดนี้
      await pool.query('DELETE FROM user_discount_codes WHERE discount_code_id = ?', [id]);

      // 3. ลบ record โค้ดส่วนลด
      const [result]: any = await pool.query('DELETE FROM discount_codes WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      res.json({ message: "Deleted successfully" });
    } catch (err: any) {
      console.error(err);
      // ถ้ามี foreign key constraint อื่น ๆ ยังล้มเหลว
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ error: "Cannot delete discount code, still referenced in another table" });
      }
      res.status(500).json({ error: "Database error" });
    }
  });

  /**
   * 5. ดูประวัติธุรกรรมทั้งหมด (สำหรับ admin)
   * GET /admin/transactions
   */
  adminRouter.get("/transactions", async (req, res) => {
    try {
      const [rows]: any = await pool.query(`
        SELECT ut.id, ut.user_id, u.username AS user_name, ut.type, ut.amount, ut.description, ut.created_at
        FROM user_transactions ut
        JOIN users u ON ut.user_id = u.id
        ORDER BY ut.created_at DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // GET /admin/discount-codes
  adminRouter.get("/discount-codes", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM discount_codes ORDER BY id DESC");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  adminRouter.put("/discount-codes/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { code, type, value, min_total, usage_limit, single_use_per_user, start_date, end_date, active } = req.body;

    try {
      await pool.query(
        `UPDATE discount_codes
        SET code = ?, type = ?, value = ?, min_total = ?, usage_limit = ?, single_use_per_user = ?, start_date = ?, end_date = ?, active = ?
        WHERE id = ?`,
        [code, type, value, min_total || 0, usage_limit || null, single_use_per_user ? 1 : 0, start_date || null, end_date || null, active ? 1 : 0, id]
      );
      res.json({ message: "Discount code updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // สร้างโค้ดส่วนลดใหม่
  adminRouter.post("/discount-codes", async (req, res) => {
    const { code, type, value, min_total, usage_limit, single_use_per_user, start_date, end_date, active } = req.body;

    try {
      const [result]: any = await pool.query(
        `INSERT INTO discount_codes
        (code, type, value, min_total, usage_limit, single_use_per_user, start_date, end_date, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          type,
          value,
          min_total || 0,
          usage_limit || null,
          single_use_per_user ? 1 : 0,
          start_date || null,
          end_date || null,
          active ? 1 : 0
        ]
      );

      // ✅ ถ้า active = 1 ไม่ต้องลบ record เพราะยังไม่มีใครใช้
      res.json({ message: "Discount code created", id: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

