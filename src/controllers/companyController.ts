import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

// Company Signup
export const companySignup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, country, industry } = req.body;

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: {
        email,
      },
    });
    if (existingCompany) {
      res.status(400).json({ message: "Company already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        industry,
        isActivated: false,
      },
    });

    // Generate token
    const activateToken = jwt.sign(
      { companyId: company.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res
      .status(201)
      .json({ message: "Company created successfully:", activateToken });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong:", err });
  }
};

// Activate Company
export const activateCompany = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { companyId: string };

    console.log("Decoded Token:", decoded);

    if (!decoded.companyId) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    const company = await prisma.company.findUnique({
      where: {
        id: decoded.companyId,
      },
    });

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    if (company.isActivated) {
      res.status(400).json({ message: "Company is already activated!" });
      return;
    }

    // Activate Company
    await prisma.company.update({
      where: { id: company.id },
      data: { isActivated: true },
    });

    res.json({ message: "Company activated! You can now log in." });
  } catch (err) {
    console.error("Activation error:", err);
    res.status(500).json({ message: "Something went wrong!", error: err });
    return;
  }
};
