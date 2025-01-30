import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Sever is running on port ${PORT}`));
