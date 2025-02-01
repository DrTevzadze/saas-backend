import { Router } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    console.log(
      `Password reset link: http://localhost:3000/auth/reset-password?token=${token}`
    );

    res.json({ message: "Token generated", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong:", err });
  }
});

export default router;
