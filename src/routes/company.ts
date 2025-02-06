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
import { updateInvoiceMiddleware } from "../middleware/invoice";

const router = Router();

router.get("/activate", authenticateJWT, updateInvoiceMiddleware, activateCompany);
router.get("/details", authenticateJWT, getCompanyDetails);
router.get("/invite/verify", verifyInviteToken);

router.post("/signup", companySignup);
router.post("/invite", authenticateJWT, isAdmin, updateInvoiceMiddleware, inviteEmployee);
router.post("/join", acceptInvite);
router.post("/upgrade", authenticateJWT, isAdmin, upgradeSubscription);

router.delete("/delete/:userId", authenticateJWT, isAdmin, removeEmployee);
router.put("/user/update", authenticateJWT, updateUserProfile);

export default router;
