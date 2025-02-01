import { Router } from "express";
import {
  companySignup,
  activateCompany,
  inviteEmployee
} from "../controllers/companyController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.post("/signup", companySignup);
router.get("/activate", activateCompany);
router.post("/invite", authenticateJWT, inviteEmployee);

export default router;