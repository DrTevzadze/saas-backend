import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload & { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const matchPassword = await bcrypt.compare(newPassword, user.password);
    if (matchPassword) {
      res.status(400).json({ message: "New password can't be the same!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated", updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong:", err });
  }
});

export default router;
