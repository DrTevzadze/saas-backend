import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.get("/dashboard", authenticateJWT, (req, res) => {
  res.json({ message: "Welcome to the dashboard!" });
});

export default router;
