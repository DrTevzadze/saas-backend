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
import { isAdmin } from "../middleware/role";

const router = Router();

router.get("/activate", activateCompany);
router.get("/details", authenticateJWT, getCompanyDetails);
router.get("/invite/verify", verifyInviteToken);

router.post("/signup", companySignup);
router.post("/invite", authenticateJWT, isAdmin, inviteEmployee);
router.post("/join", acceptInvite);
router.post("/upgrade", authenticateJWT, isAdmin, upgradeSubscription);

router.delete("/delete/:userId", authenticateJWT, isAdmin, removeEmployee);
router.put("/user/update", authenticateJWT, updateUserProfile);

export default router;
