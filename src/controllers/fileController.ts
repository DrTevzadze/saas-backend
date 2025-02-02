import { Response } from "express";
import { PrismaClient, Visibility } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const { visibility } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(400).json({ message: "Unauthorized" });
      return;
    }

    const file = await prisma.file.create({
      data: {
        filename: req.file.fieldname,
        filepath: req.file.path,
        uploadedById: userId,
        visibility:
          visibility === "PUBLIC" ? Visibility.PUBLIC : Visibility.PRIVATE,
      },
    });

    res.status(201).json({ message: "File uploaded successfully!", file });
  } catch (err) {
    console.log("Upload file Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
