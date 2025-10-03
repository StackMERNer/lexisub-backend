import express from "express";
import { getProgress, updateProgress } from "../controllers/progressController";

const router = express.Router();

router.post("/update", updateProgress);
router.get("/", getProgress);

export default router;
