import express from "express";
import authRoutes from "./routes/auth";
import protectedRoutes from "./routes/protected";
import companyRoutes from "./routes/company";
import filesRoutes from "./routes/files";
import invoiceRoutes from "./routes/invoice";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/company", companyRoutes);
app.use("/files", filesRoutes);
app.use("/invoice", invoiceRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Sever is running on port ${PORT}`)
);
