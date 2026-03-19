// backend/routes/streamTranscript.js
const express = require("express");
const axios = require("axios");
const { startStreamingTranscription } = require("../assemblyaiStreaming");

const router = express.Router();

// GET /api/stream-transcript?audioUrl=...
router.get("/", async (req, res) => {
  const { audioUrl } = req.query;
  if (!audioUrl) {
    return res.status(400).json({ message: "audioUrl is required" });
  }

  try {
    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });
    const audioBuffer = Buffer.from(response.data);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const ws = startStreamingTranscription(
      audioBuffer,
      (chunk) => {
        // live chunk
        sendEvent("chunk", chunk);
      },
      () => {
        sendEvent("done", { done: true });
        res.end();
      },
      (err) => {
        sendEvent("error", { error: err.message });
        res.end();
      }
    );

    req.on("close", () => {
      ws.close();
    });
  } catch (err) {
    console.error("streamTranscript error", err.message);
    res.status(500).end();
  }
});

module.exports = router;
