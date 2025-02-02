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
  role: Role
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, password: hashedPassword, role },
  });
};

export const generateJWT = (userId: string, email: string, role: Role) => {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET as string, {
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
