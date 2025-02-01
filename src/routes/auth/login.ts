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
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      res.status(401).json({ message: "Password doesn't match!" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong:", err });
  }
});

export default router;
