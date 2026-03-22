const express = require("express");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const ytdl = require("@distube/ytdl-core");

// ffmpeg-static can return null on some Linux/production environments.
// Fall back to the system-installed ffmpeg binary in that case.
const ffmpegPath = ffmpegStatic || "ffmpeg";
console.log("[youtubeConvert] ffmpeg path:", ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegPath);

// Ensure output directory exists (Render ephemeral FS)
const OUTPUT_DIR = path.join(__dirname, "..", "output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function convertYoutubeToMp3(youtubeUrl, startTime, duration) {
    return new Promise((resolve, reject) => {
        const videoId = ytdl.getURLVideoID(youtubeUrl) || "video";
        const outputPath = path.join(OUTPUT_DIR, `audio-${Date.now()}-${videoId}.mp3`);

        const stream = ytdl(youtubeUrl, { filter: "audioonly", quality: "highestaudio" });

        let command = ffmpeg(stream).audioCodec("libmp3lame").format("mp3");

        if (startTime !== null && startTime !== undefined) {
            command = command.setStartTime(startTime);
        }
        if (duration > 0) {
            command = command.setDuration(duration);
        }

        command
            .on("error", (err) => {
                console.error("FFmpeg YouTube error:", err);
                reject(err);
            })
            .on("end", () => {
                resolve(outputPath);
            })
            .save(outputPath);
    });
}

async function uploadToCloudinary(localMp3Path) {
    const res = await cloudinary.uploader.upload(localMp3Path, {
        resource_type: "video",
        folder: "video_summary_audio",
    });
    return res.secure_url;
}

async function createAssemblyJob(audioUrl) {
    // Use the AssemblyAI SDK directly instead of a self-HTTP call (localhost
    // is unreachable in production on Render and similar platforms).
    const { AssemblyAI } = require("assemblyai");
    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
    const transcript = await client.transcripts.submit({ audio_url: audioUrl });
    return transcript.id;
}

router.post("/", async (req, res) => {
    const { url, fullLength: fullLengthRaw, startTime: startRaw, endTime: endRaw } = req.body;

    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({ message: "Invalid YouTube URL provided" });
    }

    const fullLength = String(fullLengthRaw) === "true";
    const startTime = parseInt(startRaw) || 0;
    const endTime = parseInt(endRaw) || 0;
    let duration = 0;
    if (!fullLength && endTime > startTime) {
        duration = endTime - startTime;
    }

    let mp4_to_mp3_done = false;
    let uploaded_to_cloudinary = false;
    let assembly_job_created = false;

    try {
        const mp3LocalPath = await convertYoutubeToMp3(url, !fullLength ? startTime : null, duration);
        mp4_to_mp3_done = true;

        const cloudinaryUrl = await uploadToCloudinary(mp3LocalPath);
        uploaded_to_cloudinary = true;

        const transcriptId = await createAssemblyJob(cloudinaryUrl);
        assembly_job_created = true;

        const fileName = path.basename(mp3LocalPath);
        const publicMp3Path = `/output/${fileName}`;

        res.json({
            file: publicMp3Path,
            cloudinaryUrl: cloudinaryUrl,
            transcript_id: transcriptId,
            status: "queued",
            mp4_to_mp3_done,
            uploaded_to_cloudinary,
            assembly_job_created,
        });
    } catch (err) {
        console.error("youtube-convert error:", err);
        res.status(500).json({ message: "Processing failed" });
    }
});

module.exports = router;
