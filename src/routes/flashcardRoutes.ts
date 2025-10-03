import express from "express";
import { getFlashcards } from "../controllers/flashcardController";

const router = express.Router();

router.get("/", getFlashcards);

export default router;
