import { Router } from "express";
import {
  signup,
  login,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/request-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
