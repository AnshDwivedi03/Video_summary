// backend/routes/assemblyTranscriptStatus.js
const express = require("express");
const { createTranscript, getTranscript } = require("../utils/assemblyApi");

const router = express.Router();

// POST /api/assembly-transcript  (create job)
router.post("/", async (req, res) => {
  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ message: "audioUrl is required" });
  }

  try {
    const transcript = await createTranscript(audioUrl);
    res.json({
      id: transcript.id,
      status: transcript.status,
    });
  } catch (err) {
    console.error(
      "AssemblyAI create transcript error:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to create transcript job" });
  }
});

// GET /api/assembly-transcript/:id  (status + text + summary)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const transcript = await getTranscript(id);

    res.json({
      id: transcript.id,
      status: transcript.status,
      text: transcript.text || "",
      summary: transcript.summary || "",
      error: transcript.error || null,
    });
  } catch (err) {
    console.error(
      "AssemblyAI get transcript error:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to fetch transcript status" });
  }
});

module.exports = router;
