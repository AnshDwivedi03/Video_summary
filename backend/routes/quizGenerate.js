// backend/routes/quizGenerate.js
const express = require("express");
const router = express.Router();
const {
  generateQuizFromSummary,
} = require("../utils/groqQuiz");
const {
  generateSummaryAndQuiz,
} = require("../utils/groqSummaryAndQuiz");

router.post("/generate", async (req, res) => {
  const { summary } = req.body;
  if (!summary) {
    return res.status(400).json({ message: "summary is required" });
  }

  try {
    const questions = await generateQuizFromSummary(summary);
    res.json({ questions });
  } catch (err) {
    console.error("Quiz from summary error:", err);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
});

router.post("/summary-and-quiz", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ message: "transcript is required" });
  }

  try {
    const data = await generateSummaryAndQuiz(transcript);
    res.json(data);
  } catch (err) {
    console.error("Summary and quiz generation error:", err);
    res.status(500).json({ message: "Failed to generate summary and quiz" });
  }
});

module.exports = router;
