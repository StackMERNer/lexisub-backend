import express from "express";
import multer from "multer";
import {
  uploadSRT,
  getMediaSources,
  fetchMissingDefinitions,
} from "../controllers/mediaController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("srtFile"), uploadSRT);
router.get("/", getMediaSources);
router.post("/fetch-definitions", fetchMissingDefinitions);

export default router;
