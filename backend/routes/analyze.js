import express from "express";
import { analyzeResume } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
  resumeText,
  jobTitle,
  companyName,
} = req.body;

    const result = await analyzeResume(
  resumeText,
  jobTitle,
  companyName
);

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;