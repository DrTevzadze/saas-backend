import { Router } from "express";
import { uploadFile } from "../controllers/fileController";
import { authenticateJWT } from "../middleware/auth";
import upload from "../middleware/upload";

const router = Router();

router.post("/upload", authenticateJWT, upload.single("file"), uploadFile);

export default router;
