// backend/routes/quizFromTranscript.js
const express = require("express");
const router = express.Router();
const {
  generateQuizFromTranscript,
} = require("../utils/groqQuizFromTranscript");

router.post("/from-transcript", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ message: "transcript is required" });
  }

  try {
    const questions = await generateQuizFromTranscript(transcript);
    res.json({ questions });
  } catch (err) {
    console.error("Quiz from transcript error:", err);
    res.status(500).json({ message: "Failed to generate quiz from transcript" });
  }
});

module.exports = router;
