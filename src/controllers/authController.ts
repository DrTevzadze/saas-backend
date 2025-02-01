import { Request, Response } from "express";
import { Role } from "@prisma/client";
import {
  findUserByEmail,
  createUser,
  generateJWT,
  verifyJWT,
  updatePassword,
} from "../services/authService";
import bcrypt from "bcrypt";
import { AuthRequest } from "../middleware/auth";

// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (role && !Object.values(Role).includes(role as Role)) {
      res.status(400).json({ message: "Invalid role!" });
      return;
    }

    const existUser = await findUserByEmail(email);
    if (existUser) {
      res.status(400).json({ message: "User already exists!" });
      return;
    }

    const user = await createUser(email, password, (role as Role) || Role.USER);
    res.status(201).json({ message: "User registered!", user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!", err });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      res.status(401).json({ message: "Invalid credentials!" });
      return;
    }

    const token = generateJWT(user.id, user.email, user.role);
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!", err });
  }
};

// Request Password Reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    const token = generateJWT(user.id, user.email, user.role);
    console.log(
      `Password reset link: http://localhost:3000/auth/reset-password?token=${token}`
    );

    res.json({ message: "Token generated", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!", err });
  }
};

// Reset Password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    const decoded = verifyJWT(token);
    const user = await findUserByEmail(decoded.userId);

    if (!user) {
      res.status(401).json({ message: "User not found!" });
      return;
    }

    if (!user.password || (await bcrypt.compare(newPassword, user.password))) {
      res
        .status(400)
        .json({ message: "New password can't be the same as the old one!" });
      return;
    }

    const updatedUser = await updatePassword(user.id, newPassword);
    res.json({ message: "Password updated", updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!", err });
  }
};
