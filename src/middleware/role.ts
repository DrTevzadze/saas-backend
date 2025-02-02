import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied. Admins only" });
    return;
  }
  next();
};
