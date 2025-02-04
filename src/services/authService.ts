import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (
  email: string,
  password: string,
  role: Role,
  companyId?: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, password: hashedPassword, role, companyId },
  });
};

export const generateJWT = (
  userId: string,
  email: string,
  role: Role,
  companyId?: string | null
) => {
  const payload: any = { userId, email, role };

  if (companyId) {
    payload.companyId = companyId;
  }

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
};

export const verifyJWT = (token: string) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as jwt.JwtPayload & { userId: string };
};

export const updatePassword = async (userId: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};
