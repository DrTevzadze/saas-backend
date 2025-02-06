import { PrismaClient } from "@prisma/client";
import { subscriptionConfig } from "../config/subscription";
import formatDate from "../utils/formatDate";

const prisma = new PrismaClient();

export const updateInvoice = async (userId: string) => {
  const today = new Date();

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
    select: { plan: true, subscriptionStartDate: true },
  });

  if (!company) throw new Error("Company not found!");
  if (!company.subscriptionStartDate)
    throw new Error("Subscription start date not found!");

  const plan = company.plan;
  const { baseCost, extraSubscriptionCost, fileUploadLimit, employeeLimits } =
    subscriptionConfig[plan];

  const startDate = new Date(company.subscriptionStartDate);
  const billingDay = startDate.getDate();
  const billingMonth =
    today.getMonth() + (today.getDate() >= billingDay ? 0 : -1);
  const billingYear = today.getFullYear();

  // Check if an invoice already exists for this billing cycle
  let invoice = await prisma.invoice.findFirst({
    where: { companyId, month: billingMonth + 1, year: billingYear },
  });

  const totalEmployees = await prisma.user.count({
    where: { companyId },
  });

  const extraUsers = Math.max(totalEmployees - employeeLimits, 0);
  const extraUserCost = extraUsers * extraSubscriptionCost;

  // If no invoice exists, create a new one
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        companyId,
        month: billingMonth + 1,
        year: billingYear,
        baseCost: baseCost,
        totalEmployees,
        totalCost: baseCost + extraUserCost,
        extraCost: extraUserCost,
        createdAt: formatDate(new Date()),
      },
    });
  }

  // Count uploaded files this billing month
  const uploadedFilesCount = await prisma.file.count({
    where: {
      uploadedById: userId,
      createdAt: {
        gte: formatDate(new Date(billingYear, billingMonth, billingDay)), // Start from the last billing date
      },
    },
  });

  let extraFiles = Math.max(uploadedFilesCount - fileUploadLimit, 0);
  let extraFileCost = extraFiles * extraSubscriptionCost;

  // Update invoice with extra file costs
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
