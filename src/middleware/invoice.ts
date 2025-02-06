import { Response, NextFunction } from "express";
import { updateInvoice } from "../services/invoiceService";
import { AuthRequest } from "./auth";

export const updateInvoiceMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
        console.error("❌ Unauthorized: Missing companyId or userId");
      res.status(401).json({ message: "Unauthorizedasda" });
      return;
    }

    await updateInvoice(userId);

    next();
  } catch (err) {
    console.error("Invoice Update Middleware Error:", err);
    res.status(500).json({ message: "Failed to update invoice", error: err });
    return;
  }
};
