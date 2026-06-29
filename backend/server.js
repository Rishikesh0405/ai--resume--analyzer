import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import analyzeRoute from "./routes/analyze.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Debug Route
app.get("/test", async (req, res) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Reply with only OK",
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Resume Analyzer Route
app.use("/api/analyze", analyzeRoute);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ResumeIQ Backend Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(process.env.GEMINI_API_KEY ? "✅ Gemini Key Loaded" : "❌ Gemini Key Missing");
  console.log(`✅ Server running on http://localhost:${PORT}`);
});