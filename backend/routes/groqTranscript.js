// backend/routes/groqTranscript.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();

// Retry helper with exponential backoff
async function transcribeWithRetry(filePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
        response_format: "json",
        temperature: 0.0,
      });
      return transcription.text;
    } catch (err) {
      console.error(`Groq Whisper attempt ${attempt}/${maxRetries} failed:`, err.message || err);
      if (attempt === maxRetries) throw err;
      // Exponential backoff: 2s, 4s, 8s ...
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

router.post("/", async (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({ message: "Filename is required" });
  }

  const filePath = path.join(__dirname, "..", "output", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: `Audio chunk not found: ${filename}` });
  }

  try {
    const text = await transcribeWithRetry(filePath);
    res.json({ text });
  } catch (err) {
    console.error("Groq Whisper error (all retries exhausted):", err.message || err);
    res.status(500).json({ message: "Transcription failed via Groq after retries" });
  }
});

module.exports = router;
