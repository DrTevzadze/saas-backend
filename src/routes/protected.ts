import { Response, Router } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { isAdmin } from "../middleware/role";

const router = Router();

router.get("/dashboard", authenticateJWT, (req, res) => {
  res.json({ message: "Welcome to the dashboard!" });
});

router.get(
  "/admin",
  authenticateJWT,
  isAdmin,
  (req: AuthRequest, res: Response) => {
    res.json({ message: "Welcome, Admin!", user: req.user });
  }
);

export default router;
