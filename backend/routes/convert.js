const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegStatic);

const router = express.Router();

router.post("/", async (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ message: "videoUrl is required" });
  }

  try {
    const tempDir = path.join(__dirname, "..", "temp");
    const outDir = path.join(__dirname, "..", "output");

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const inputPath = path.join(tempDir, `input-${Date.now()}.mp4`);
    const outputPath = path.join(outDir, `audio-${Date.now()}.mp3`);

    // Download video to temp file
const response = await axios({
  method: "get",
  url: videoUrl,
  responseType: "stream",
  headers: {
    "User-Agent": "Mozilla/5.0",
  },
});

console.log("Download status:", response.status);
console.log("Content-Type:", response.headers["content-type"]);

if (!response.headers["content-type"]?.startsWith("video/")) {
  return res
    .status(400)
    .json({ message: "URL is not a direct video file (video/mp4) URL" });
}

    const writer = fs.createWriteStream(inputPath);

    response.data.pipe(writer);

    writer.on("error", (err) => {
      console.error(err);
      return res.status(500).json({ message: "Error saving video file" });
    });

    writer.on("finish", () => {
      // Run ffmpeg to convert MP4 -> MP3
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .format("mp3")
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          return res.status(500).json({ message: "FFmpeg conversion failed" });
        })
        .on("end", () => {
          // Optionally delete temp video
          fs.unlink(inputPath, () => {});

          // Return a URL to download MP3 (we will serve /output as static)
          const fileName = path.basename(outputPath);
          res.json({
            message: "Conversion successful",
            file: `/output/${fileName}`,
          });
        })
        .save(outputPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
