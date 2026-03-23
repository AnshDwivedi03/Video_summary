// backend/routes/uploadConvert.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const VideoCache = require("../models/VideoCache");

// ffmpeg-static can return null on some Linux/production environments.
const ffmpegPath = ffmpegStatic || "ffmpeg";
console.log("[uploadConvert] ffmpeg path:", ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Ensure required directories exist
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const OUTPUT_DIR = path.join(__dirname, "..", "output");
[UPLOADS_DIR, OUTPUT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: save uploaded MP4 locally
const upload = multer({
  dest: UPLOADS_DIR,
});

// Compute SHA-256 hash of a file
function computeFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

// MP4 → MP3
function convertMp4ToMp3(inputPath, startTime, duration) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      OUTPUT_DIR,
      `audio-${Date.now()}-${path.basename(inputPath, path.extname(inputPath))}.mp3`
    );

    let command = ffmpeg(inputPath).noVideo().audioCodec("libmp3lame").format("mp3");

    if (startTime !== null && startTime !== undefined) {
      command = command.setStartTime(startTime);
    }
    if (duration > 0) {
      command = command.setDuration(duration);
    }

    command
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg error:", err);
        if (stderr && stderr.includes("Output file does not contain any stream")) {
          reject(new Error("NO_AUDIO_STREAM"));
        } else {
          reject(err);
        }
      })
      .on("end", () => resolve(outputPath))
      .save(outputPath);
  });
}

// Helper: Get exact duration of audio file
function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      if (metadata.format && metadata.format.duration) {
        resolve(parseFloat(metadata.format.duration));
      } else {
        resolve(0);
      }
    });
  });
}

// Helper: Split audio into overlapping chunks
function splitAudio(inputPath, duration, chunkDur = 180, overlap = 15) {
  const chunks = [];
  let start = 0;
  let index = 0;
  while (start < duration) {
    const end = Math.min(start + chunkDur, Math.ceil(duration));
    chunks.push({ index, start, end });
    if (end >= duration) break;
    start += (chunkDur - overlap);
    index++;
  }

  const promises = chunks.map(chunk => new Promise((resolve, reject) => {
    const outputPath = path.join(OUTPUT_DIR, `chunk-${Date.now()}-${chunk.index}.mp3`);
    ffmpeg(inputPath)
      .setStartTime(chunk.start)
      .setDuration(chunk.end - chunk.start)
      .audioCodec("libmp3lame")
      .on("error", (err) => {
        console.error("FFmpeg split error:", err);
        reject(err);
      })
      .on("end", () => resolve({ ...chunk, path: outputPath }))
      .save(outputPath);
  }));

  return Promise.all(promises);
}

// Upload MP3 to Cloudinary
async function uploadToCloudinary(localMp3Path) {
  const res = await cloudinary.uploader.upload(localMp3Path, {
    resource_type: "video",
    folder: "video_summary_audio",
  });
  return res.secure_url;
}

// POST /api/upload-convert
router.post("/", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No video file uploaded" });
  }

  const localVideoPath = req.file.path;
  const originalFileName = req.file.originalname || "unknown";

  try {
    // 1) Compute file hash for caching
    const fileHash = await computeFileHash(localVideoPath);

    // 2) Check cache
    const cached = await VideoCache.findOne({ fileHash });
    if (cached) {
      // Clean up uploaded file
      fs.unlink(localVideoPath, () => {});
      console.log("[uploadConvert] Cache hit for:", originalFileName);
      return res.json({
        cached: true,
        transcript: cached.transcript,
        summary: cached.summary,
        quiz: cached.quiz,
        cloudinaryUrl: cached.audioUrl,
        videoUrl: cached.videoUrl || cached.audioUrl,
        file: null,
        chunks: [],
        status: "cached",
      });
    }

    // 3) Cache miss — proceed with normal pipeline
    const fullLength = req.body.fullLength === "true";
    const startTime = parseInt(req.body.startTime) || 0;
    const endTime = parseInt(req.body.endTime) || 0;
    let duration = 0;

    if (!fullLength && endTime > startTime) {
      duration = endTime - startTime;
    }

    // Upload original video to Cloudinary for playback
    const videoCloudinaryUrl = await cloudinary.uploader.upload(localVideoPath, {
      resource_type: "video",
      folder: "video_summary_videos",
    }).then(r => r.secure_url);

    // MP4 → MP3
    const mp3LocalPath = await convertMp4ToMp3(localVideoPath, !fullLength ? startTime : null, duration);

    // Upload FULL MP3 to Cloudinary
    const fullCloudinaryUrl = await uploadToCloudinary(mp3LocalPath);

    // Split MP3 into chunks
    const mp3Duration = await getAudioDuration(mp3LocalPath);
    const localChunks = await splitAudio(mp3LocalPath, mp3Duration, 180, 15);

    const chunkResults = localChunks.map(chunk => ({
      chunkIndex: chunk.index,
      start: chunk.start,
      end: chunk.end,
      filename: path.basename(chunk.path),
    }));

    const fileName = path.basename(mp3LocalPath);
    const publicMp3Path = `/output/${fileName}`;

    fs.unlink(localVideoPath, () => {});

    res.json({
      cached: false,
      fileHash,
      file: publicMp3Path,
      cloudinaryUrl: fullCloudinaryUrl,
      videoUrl: videoCloudinaryUrl,
      chunks: chunkResults,
      status: "queued",
    });
  } catch (err) {
    const errorMsg = err.response?.data || err.message;
    console.error("[uploadConvert] CRITICAL ERROR:", errorMsg);
    
    fs.unlink(localVideoPath, () => {});
 
     if (err.message === "NO_AUDIO_STREAM") {
       return res.status(400).json({ 
         message: "The uploaded video does not contain an audio track.",
         details: "FFmpeg could not find a valid audio stream to convert to MP3."
       });
     }
 
     res.status(500).json({ 
       message: "Processing failed", 
       details: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
     });
   }
});

// POST /api/upload-convert/cache — save processed results to cache
router.post("/cache", async (req, res) => {
  try {
    const { fileHash, fileName, transcript, summary, quiz, audioUrl, videoUrl } = req.body;
    if (!fileHash) return res.status(400).json({ message: "fileHash required" });

    await VideoCache.findOneAndUpdate(
      { fileHash },
      { fileHash, fileName, transcript, summary, quiz, audioUrl, videoUrl },
      { upsert: true, new: true }
    );

    res.json({ message: "Cached successfully" });
  } catch (err) {
    console.error("Cache save error:", err);
    res.status(500).json({ message: "Failed to cache results" });
  }
});

module.exports = router;
