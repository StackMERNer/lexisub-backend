import express from "express";
import multer from "multer";
import { uploadSRT, getMediaSources } from "../controllers/mediaController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("srtFile"), uploadSRT);
router.get("/", getMediaSources);

export default router;
