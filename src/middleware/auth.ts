import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface UserPayload {
  userId: string;
  email: string;
}

// Extend Request type to include `user`
export interface AuthRequest extends Request {
  user?: UserPayload;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
    req.user = decoded;
    next(); // ✅ Move to the next middleware/route
  } catch (error) {
    res.status(403).json({ message: "Invalid token." });
  }
};
