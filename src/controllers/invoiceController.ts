import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";
import { Response } from "express";

const prisma = new PrismaClient();

export const getAllInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany();

    res
      .status(200)
      .json({ message: "Invoice has been retrieved successfully!", invoices });
  } catch (err) {
    console.log("Get All Invoice list:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
