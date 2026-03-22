// backend/routes/uploadConvert.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

// ffmpeg-static can return null on some Linux/production environments.
// Fall back to the system-installed ffmpeg binary in that case.
const ffmpegPath = ffmpegStatic || "ffmpeg";
console.log("[uploadConvert] ffmpeg path:", ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Ensure required directories exist at startup (Render ephemeral FS)
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

// MP4 → MP3
function convertMp4ToMp3(inputPath, startTime, duration) {
  return new Promise((resolve, reject) => {
    const outDir = OUTPUT_DIR;

    const outputPath = path.join(
      outDir,
      `audio-${Date.now()}-${path.basename(
        inputPath,
        path.extname(inputPath)
      )}.mp3`
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
      .on("end", () => {
        resolve(outputPath);
      })
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
  const outDir = OUTPUT_DIR;

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
    const outputPath = path.join(outDir, `chunk-${Date.now()}-${chunk.index}.mp3`);
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

// Upload MP3 to Cloudinary → public https URL
async function uploadToCloudinary(localMp3Path) {
  const res = await cloudinary.uploader.upload(localMp3Path, {
    resource_type: "video",
    folder: "video_summary_audio",
  });
  return res.secure_url;
}

// Call your AssemblyAI wrapper route
async function createAssemblyJob(audioUrl) {
  const res = await axios.post(
    "http://localhost:5000/api/assembly-transcript",
    { audioUrl }
  );
  return res.data.id;
}

// POST /api/upload-convert
router.post("/", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No video file uploaded" });
  }

  const localVideoPath = req.file.path;

  const fullLength = req.body.fullLength === "true";
  const startTime = parseInt(req.body.startTime) || 0;
  const endTime = parseInt(req.body.endTime) || 0;
  let duration = 0;

  if (!fullLength && endTime > startTime) {
    duration = endTime - startTime;
  }

  let mp4_to_mp3_done = false;
  let uploaded_to_cloudinary = false;
  let assembly_job_created = false;

  try {
    // 1) MP4 → MP3
    const mp3LocalPath = await convertMp4ToMp3(localVideoPath, !fullLength ? startTime : null, duration);
    mp4_to_mp3_done = true;

    // 2) Upload FULL MP3 to Cloudinary for frontend playback
    const fullCloudinaryUrl = await uploadToCloudinary(mp3LocalPath);
    uploaded_to_cloudinary = true;

    // 3) Split MP3 into optimized overlapping chunks (3 min chunk, 15 sec overlap)
    const mp3Duration = await getAudioDuration(mp3LocalPath);
    const localChunks = await splitAudio(mp3LocalPath, mp3Duration, 180, 15);

    // 4) Return local chunks for Groq processing
    const chunkResults = localChunks.map(chunk => ({
      chunkIndex: chunk.index,
      start: chunk.start,
      end: chunk.end,
      filename: path.basename(chunk.path),
    }));
    
    // assembly_job_created is no longer strictly AssemblyAI, but we'll leave it as true for compatibility, or just true since transcript jobs exist.
    assembly_job_created = true;

    // optional: still expose local MP3 for download
    const fileName = path.basename(mp3LocalPath);
    const publicMp3Path = `/output/${fileName}`;

    fs.unlink(localVideoPath, () => { });

    res.json({
      file: publicMp3Path,
      cloudinaryUrl: fullCloudinaryUrl, // Pass FULL to frontend for playback
      chunks: chunkResults,             // Array of chunk metadata and IDs
      status: "queued",
      mp4_to_mp3_done,
      uploaded_to_cloudinary,
      assembly_job_created,
    });
  } catch (err) {
    console.error("upload-convert error:", err.response?.data || err.message);

    // Clean up local temp file on error as well
    fs.unlink(localVideoPath, () => { });

    if (err.message === "NO_AUDIO_STREAM") {
      return res.status(400).json({ message: "The uploaded video does not contain an audio track. Please upload a video with audio." });
    }

    res.status(500).json({ message: "Processing failed" });
  }
});

module.exports = router;
