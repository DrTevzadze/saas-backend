import { Router, Request, Response } from "express";
import { PrismaClient, SubscriptionPlan } from "@prisma/client";
import { authenticateJWT, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.post(
  "/subscribe",
  authenticateJWT,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { plan } = req.body;

      const authReq = req as AuthRequest;
      if (!authReq.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Validate Subscription Plan
      if (!Object.values(SubscriptionPlan).includes(plan as SubscriptionPlan)) {
        res.status(400).json({ message: "Invalid subscription plan" });
        return;
      }

      // Find User's Company
      const company = await prisma.company.findFirst({
        where: { employees: { some: { id: authReq.user.userId } } },
      });

      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }

      // Update Subscription Plan
      const updatedCompany = await prisma.company.update({
        where: { id: company.id },
        data: { plan: plan as SubscriptionPlan },
      });

      res.json({
        message: `Subscription updated to ${plan}`,
        company: updatedCompany,
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", error });
    }
  }
);

export default router;
