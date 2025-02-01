import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth";

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

// Admin Invites Employee
export const inviteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const adminId = req.user?.userId;

    if (!email) {
      res.status(400).json({ message: "Email is required!" });
      return;
    }

    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
        role: "ADMIN",
      },
      include: { company: true },
    });

    if (!admin || !admin.company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    if (admin.role !== "ADMIN") {
      res.status(401).json({ message: "Only admins can invite" });
      return;
    }

    // Check if employee already exists
    const existingEmployee = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmployee) {
      res.status(400).json({ message: "Employee already exists" });
      return;
    }

    // Invite token
    const inviteToken = jwt.sign(
      { email, companyId: admin.companyId },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    // Store invite token
    await prisma.user.create({
      data: {
        email,
        inviteToken,
        companyId: admin.company.id,
      },
    });

    res.json({ message: "Employee invited successfully!" });
  } catch (err) {
    console.log("Invite Employee Error:", err);
    res.status(500).json({ message: "Something went wrong:", err });
    return;
  }
};

// Verify Invite Token
export const verifyInviteToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string; companyId: string };

    const invitedUser = await prisma.user.findUnique({
      where: {
        email: decoded.email,
        inviteToken: token as string,
      },
    });

    if (!invitedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "Token verified successfully!" });
  } catch (err) {
    console.log("Verify Invite Token Error:", err);
    res.status(500).json({ message: "Something went wrong:", err });
    return;
  }
};

// Accept invite
export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ message: "Token and Password are required!" });
      return;
    }

    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string; companyId: string };

    const invitedUser = await prisma.user.findUnique({
      where: {
        email: decoded.email,
        companyId: decoded.companyId,
      },
    });

    if (!invitedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: decoded.email },
      data: {
        password: hashedPassword,
        inviteToken: null,
        isActivated: true,
      },
    });

    res.status(200).json({ message: "User created successfully!" });
  } catch (err) {
    console.log("Accept Invite Error:", err);
    res.status(500).json({ message: "Something went wrong:", err });
    return;
  }
};
