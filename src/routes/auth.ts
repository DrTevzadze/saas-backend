import { Router } from "express";
import signupRoute from "./auth/signup";
import loginRoute from "./auth/login";
import requestPasswordRoute from "./auth/request-password";
import resetPasswordRoute from "./auth/reset-password";

const router = Router();

router.use("/signup", signupRoute);
router.use("/login", loginRoute);
router.use("/request-password", requestPasswordRoute);
router.use("/reset-password", resetPasswordRoute);

export default router;
