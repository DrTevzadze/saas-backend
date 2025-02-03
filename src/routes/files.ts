import { Router } from "express";
import {
  deleteFile,
  getAllFiles,
  getFile,
  updateFileVisibility,
  uploadFile,
} from "../controllers/fileController";
import { authenticateJWT } from "../middleware/auth";
import upload from "../middleware/upload";
import { isAdmin } from "../middleware/role";

const router = Router();

router.get("/all", authenticateJWT, isAdmin, getAllFiles);
router.get("/:fileId", authenticateJWT, getFile);
router.post("/upload", authenticateJWT, upload.single("file"), uploadFile);
router.put("/:fileId", authenticateJWT, updateFileVisibility);
router.delete("/:fileId", authenticateJWT, deleteFile);

export default router;
