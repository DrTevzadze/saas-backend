import { Router } from "express";
import {
  companySignup,
  activateCompany,
} from "../controllers/companyController";

const router = Router();

router.post("/signup", companySignup);
router.get("/activate", activateCompany);

export default router;