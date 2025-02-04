import { PrismaClient } from "@prisma/client";
import { subscriptionConfig } from "../config/subscription";

const prisma = new PrismaClient();

export const updateInvoice = async (companyId: string, userId: string) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error("Company not found!");

  const plan = company.plan;
  const { baseCost, extraFilesCost, fileUploadLimit } =
    subscriptionConfig[plan];

  // Find invoice
  let invoice = await prisma.invoice.findFirst({
    where: { companyId, month: currentMonth, year: currentYear },
  });

  // If there's no invoice, create one
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        companyId,
        month: currentMonth,
        year: currentYear,
        baseCost: baseCost,
        totalCost: baseCost,
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

  let extraFiles = uploadedFilesCount - fileUploadLimit;
  let extraCost = extraFiles > 0 ? extraFiles * extraFilesCost : 0;

  // Update invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      totalFiles: uploadedFilesCount,
      extraFiles: extraFiles > 0 ? extraFiles : 0,
      extraCost: extraCost,
      totalCost: baseCost + extraCost,
    },
  });

  return invoice;
};
