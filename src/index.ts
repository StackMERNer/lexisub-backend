import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import mediaRoutes from "./routes/mediaRoutes";
import flashcardRoutes from "./routes/flashcardRoutes";
import progressRoutes from "./routes/progressRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/media", mediaRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/progress", progressRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
