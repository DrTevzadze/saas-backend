import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient, Role } from "@prisma/client";

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

// Signup
router.post("/signup", async (req, res): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (role && !Object.values(Role).includes(role as Role)) {
      res.status(400).json({ message: "Invalid role!" });
      return;
    }

    const existUser = await prisma.user.findUnique({ where: { email } });
    if (existUser) {
      res.status(400).json({ message: "User already exists!" });
      return;
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: (role as Role) || Role.USER,
      },
    });

    res.status(201).json({ message: "User registered:", user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong:", err });
  }
});

// Login
router.post("/login", async (req, res) => {
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

    // Generate Token
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

// Request password reset

router.post("/request-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    // Mock reset link
    console.log(
      `Password reset link: http://localhost:3000/auth/reset-password?token=${token}`
    );

    res.json({ message: "Token generated", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong:", err });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify Token
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

    // Check if new password is the same as the old password
    const matchPassword = await bcrypt.compare(newPassword, user.password);
    if (matchPassword) {
      res.status(400).json({ message: "New password can't be the same!" });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password
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
