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

    const { visibility, allowUsers } = req.body;
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
        allowUsers: allowUsers
          ? {
              create: allowUsers.map((userId: string) => ({
                user: { connect: { id: userId } },
              })),
            }
          : undefined,
      },
    });

    res.status(201).json({ message: "File uploaded successfully!", file });
  } catch (err) {
    console.log("Upload file Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.userId;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { allowUsers: true },
    });

    if (!file) {
      res.status(404).json({ message: "You're trying to get the file. File not found!" });
      return;
    }

    // Allow access if:
    const isOwner = file.uploadedById === userId;
    const isPublic = file.visibility === "PUBLIC";
    const isAllowed = file.allowUsers.some(
      (access) => access.userId === userId
    );

    if (!isOwner && !isPublic && !isAllowed) {
      res.status(403).json({ message: "Access denied!" });
      return;
    }

    res.status(200).json({ message: "File access granted!", file });
  } catch (err) {
    console.log("Get file error:", err);
    res.status(500).json({ message: "Something went wrong." });
    return;
  }
};

export const getAllFiles = async (req: AuthRequest, res: Response) => {
  try {

    console.log("User Role:", req.user?.role); // ✅ Debug: Check user role
    console.log("Fetching files...");

    const files = await prisma.file.findMany({
      include: {
        uploadedBy: {
          select: { email: true}
        }
      }
    });

    console.log("Files Found:", files.length);

    res
      .status(200)
      .json({ message: "All files retrieved successfully!", files });
  } catch (err) {
    console.log("Get all files error:", err);
    res.status(500).json({ message: "Something went wrong." });
    return;
  }
};

export const updateFileVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const { visibility, allowUsers } = req.body;
    const userId = req.user?.userId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) {
      res.status(404).json({ message: "You're trying to update the file. File not found!" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // If the user isn't the file owner or an admin
    if (!user || (user.role !== "ADMIN" && file.uploadedById !== userId)) {
      res.status(403).json({ message: "Access Denied!" });
      return;
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: {
        visibility:
          visibility === "PUBLIC" ? Visibility.PUBLIC : Visibility.PRIVATE,
        allowUsers: allowUsers
          ? {
              create: allowUsers.map((userId: string) => ({
                user: { connect: { id: userId } },
              })),
            }
          : undefined,
      },
    });

    res.status(200).json({ message: "File visibility updated!", updatedFile });
  } catch (err) {
    console.log("Update File Visibility:", err);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.userId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });

    if (!file) {
      res.status(404).json({ message: "You're trying to delete file. File not found!" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || (user.role !== "ADMIN" && file.uploadedById !== userId)) {
      res.status(403).json({ message: "Access denied!" });
      return;
    }

    await prisma.file.delete({ where: { id: fileId } });

    res.status(200).json({ message: "File has been successfully removed!" });
  } catch (err) {
    console.log("Delete File Error:", err);
    res.status(500).json({ message: "Something went wrong." });
    return;
  }
};
