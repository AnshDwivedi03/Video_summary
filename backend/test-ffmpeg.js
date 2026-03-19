const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

const inputPath = process.argv[2] || "C:\\Users\\PRASOON\\Downloads\\Video_Summary\\backend\\uploads\\0f90bf04451393e20b70cb1601a79378";

const outDir = path.join(__dirname, "output");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const outputPath = path.join(outDir, `test-audio-${Date.now()}.mp3`);

let command = ffmpeg(inputPath)
    .noVideo()
    .audioCodec("libmp3lame")
    .format("mp3")
    .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg error:", err);
        console.error("FFmpeg stdout:", stdout);
        console.error("FFmpeg stderr:", stderr);
    })
    .on("end", () => {
        console.log("Success! File saved at:", outputPath);
    })
    .on("start", (cmd) => {
        console.log("Started ffmpeg with command:", cmd);
    });

command.save(outputPath);
