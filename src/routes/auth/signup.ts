import { Router } from "express";
import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res): Promise<void> => {
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

    const hashedPassword = await bcrypt.hash(password, 10);

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

export default router;
