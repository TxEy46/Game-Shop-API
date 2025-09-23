import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ error: "Invalid token" });
    }
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}
