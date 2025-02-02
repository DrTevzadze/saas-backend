import { Router } from "express";
import {
  companySignup,
  activateCompany,
  inviteEmployee,
  acceptInvite,
  verifyInviteToken,
  upgradeSubscription,
} from "../controllers/companyController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.post("/signup", companySignup);
router.get("/activate", activateCompany);
router.post("/invite", authenticateJWT, inviteEmployee);
router.get("/invite/verify", verifyInviteToken);
router.post("/join", acceptInvite);
router.post("/upgrade", authenticateJWT, upgradeSubscription);

export default router;
