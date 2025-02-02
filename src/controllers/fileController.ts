import { Response } from "express";
import { PrismaClient, Visibility } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";
import { fileUploadLimits } from "../config/subscription";

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user?.company) {
      res.status(404).json({ message: "Company not found!" });
      return;
    }

    const { plan } = user.company;
    const maxFiles = fileUploadLimits[plan];

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const uploadedFilesCount = await prisma.file.count({
      where: {
        uploadedById: userId,
        createdAt: { gte: currentMonth },
      },
    });

    if (uploadedFilesCount >= maxFiles) {
      res.status(403).json({
        message: `Uploaded limit reached for ${plan} plan! (${maxFiles} files per month)`,
      });
      return;
    }

    const file = await prisma.file.create({
      data: {
        filename: req.file.originalname,
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
