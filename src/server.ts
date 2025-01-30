import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Sever is running on port ${PORT}`));
