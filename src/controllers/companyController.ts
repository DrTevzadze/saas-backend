import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { subscriptionConfig } from "../config/subscription";

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
      },
      include: {
        company: {
          include: { employees: true },
        },
      },
    });

    if (!admin || !admin.company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Check if employee already exists
    const existingEmployee = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const plan = admin.company.plan;
    const currentEmployeeCount = admin.company.employees.length;
    const maxEmployees = subscriptionConfig[plan].employeeLimits;

    if (existingEmployee) {
      res.status(400).json({ message: "Employee already exists" });
      return;
    }

    if (plan === "FREE" && currentEmployeeCount >= maxEmployees) {
      res.status(400).json({
        message: `You have reached the maximum number of employees for your plan (${maxEmployees})`,
      });
      return;
    }

    let extraChargeMessage = null;

    if (plan === "BASIC" && currentEmployeeCount >= maxEmployees) {
      extraChargeMessage = `You have been charged with extra ${subscriptionConfig[plan].extraSubscriptionCost}$, because of BASIC subscription plan employee limit.`;
      req.extraEmployeeCost = 5;
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

    res.status(200).json({
      message: "Employee has been invited successfully!",
      ...(extraChargeMessage && { extraChargeMessage }),
    });
  } catch (err) {
    console.log("Invite Employee Error:", err);
    res.status(500).json({ message: "Something went wrong:", err });
    return;
  }
};

// Remove Employee from the company (admin only)
export const removeEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = req.user?.userId;

    console.log("User Id", userId);

    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
      include: {
        company: {
          include: { employees: true },
        },
      },
    });

    if (!admin?.company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    const employeeToRemove = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!employeeToRemove) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.json({ message: `Employee with id: ${userId} removed successfully!` });
  } catch (err) {
    console.log("Remove Employee Error:", err);
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

// Upgrade Subscription Plan
export const upgradeSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { newPlan } = req.body;
    const adminId = req.user?.userId;

    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
      include: {
        company: {
          include: { employees: true },
        },
      },
    });

    if (!admin?.company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    if (!["FREE", "BASIC", "PREMIUM"].includes(newPlan)) {
      res.status(400).json({
        message:
          "Invalid subscription plan. The plan has to be FREE, BASIC or PREMIUM (case sensitive)",
      });
      return;
    }

    if (newPlan === admin.company.plan) {
      res.status(400).json({ message: "You are already on this plan" });
      return;
    }

    // Prevent from downgrading if employee count exceeds the limit
    const employeeCount = admin.company.employees.length;

    if (
      (newPlan === "FREE" && employeeCount > 3) ||
      (newPlan === "BASIC" && employeeCount > 10)
    ) {
      res.status(400).json({
        message: `Your current subscription plan is ${admin.company.plan} .You need to remove employees before downgrading to the ${newPlan} plan`,
      });
      return;
    }

    await prisma.company.update({
      where: { id: admin.company.id },
      data: { plan: newPlan },
    });

    res.json({
      message: `Subscription plan succesfully upgraded to ${newPlan}!`,
    });
  } catch (err) {
    console.error("Upgrade Subscription Error:", err);
    res.status(500).json({ message: "Something went wrong:", err });
    return;
  }
};

// View Company Details
export const getCompanyDetails = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: { company: true },
    });

    if (!user?.company) {
      res.status(404).json({ message: "Company not found!" });
      return;
    }

    res.json({
      companyName: user.company.name,
      plan: user.company.plan,
      role: user.role,
    });
  } catch (err) {
    console.log("Get Company Details Error:", err);
    res.status(500).json({ message: "Something went wrong!", err });
  }
};

// Update userProfile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { email, password } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updateData: any = {};

    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({ message: "User profile updated successfully!", updateUser });
  } catch (err) {
    console.error("Update User Profile Error:", err);
    res.status(500).json({ message: "Something went wrong:", err });
    return;
  }
};
