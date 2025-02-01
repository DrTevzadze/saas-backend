import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }
  next();
};
