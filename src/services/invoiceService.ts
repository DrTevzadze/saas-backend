import { PrismaClient } from "@prisma/client";
import { subscriptionConfig } from "../config/subscription";

const prisma = new PrismaClient();

export const updateInvoice = async ( userId: string) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  if (!admin || !admin.companyId) {
    throw new Error("Admin user does not belong to a company!");
  }

  const companyId = admin.companyId;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { employees: true },
  });
  if (!company) throw new Error("Company not found!");

  const plan = company.plan;
  const { baseCost, extraSubscriptionCost, fileUploadLimit, employeeLimits } =
    subscriptionConfig[plan];

  // Find invoice
  let invoice = await prisma.invoice.findFirst({
    where: { companyId, month: currentMonth, year: currentYear },
  });

  const totalEmployees = await prisma.user.count({
    where: { companyId },
  });

  const extraUsers = Math.max(totalEmployees - employeeLimits, 0);
  const extraUserCost = extraUsers * extraSubscriptionCost;

  // If there's no invoice, create one
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        companyId,
        month: currentMonth,
        year: currentYear,
        baseCost: baseCost,
        totalEmployees,
        totalCost: baseCost + extraUserCost,
        extraCost: extraUserCost,
      },
    });
  }

  // Count uploaded files this month
  const uploadedFilesCount = await prisma.file.count({
    where: {
      uploadedById: userId,
      createdAt: { gte: new Date(currentYear, currentMonth - 1, 1) }, // Calculates first day of the PREVIOUS month
    },
  });

  let extraFiles = Math.max(uploadedFilesCount - fileUploadLimit, 0);
  let extraFileCost = extraFiles * extraSubscriptionCost;

  // Update invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      totalFiles: uploadedFilesCount,
      extraFiles: extraFiles > 0 ? extraFiles : 0,
      extraCost: extraFileCost + extraUserCost,
      totalCost: baseCost + extraUserCost + extraFileCost,
      totalEmployees,
    },
  });

  return invoice;
};
