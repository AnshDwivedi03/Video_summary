// backend/routes/chunkSummary.js
const express = require("express");
const { summarizeChunk } = require("../utils/groqSummary");

const router = express.Router();

// POST /api/chunk-summary { text: "..." }
router.post("/", async (req, res) => {
  const { text } = req.body;
  if (!text || text.length < 20) {
    return res.status(400).json({ message: "text too short" });
  }

  try {
    const summary = await summarizeChunk(text);
    res.json({ summary });
  } catch (err) {
    console.error("chunk summary error", err.message);
    res.status(500).json({ message: "failed to summarize" });
  }
});

module.exports = router;
