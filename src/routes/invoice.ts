import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import { isAdmin } from "../middleware/role";
import { getAllInvoice } from "../controllers/invoiceController";

const router = Router();

router.get("/all", authenticateJWT, isAdmin, getAllInvoice);

export default router;