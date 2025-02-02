import { Router } from "express";
import {
  companySignup,
  activateCompany,
  inviteEmployee,
  acceptInvite,
  verifyInviteToken,
  upgradeSubscription,
  removeEmployee,
  getCompanyDetails,
  updateUserProfile,
} from "../controllers/companyController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.post("/signup", companySignup);
router.get("/activate", activateCompany);
router.post("/invite", authenticateJWT, inviteEmployee);
router.get("/invite/verify", verifyInviteToken);
router.post("/join", acceptInvite);
router.post("/upgrade", authenticateJWT, upgradeSubscription);
router.delete("/delete/:userId", authenticateJWT, removeEmployee);
router.get("/details", authenticateJWT, getCompanyDetails);
router.put("/user/update", authenticateJWT, updateUserProfile);

export default router;
