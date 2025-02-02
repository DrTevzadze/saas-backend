import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import subscriptionRoutes from "./routes/subscription";
import companyRoutes from "./routes/company";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/company", companyRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Sever is running on port ${PORT}`));
