// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const uploadConvertRoutes = require("./routes/uploadConvert");
const groqTranscriptRoutes = require("./routes/groqTranscript");

const quizGenerateRoutes = require("./routes/quizGenerate");
const quizFromTranscriptRoutes = require("./routes/quizFromTranscript");
const streamTranscriptRoutes = require("./routes/streamTranscript");
const chunkSummaryRoutes = require("./routes/chunkSummary");
const recordsRoutes = require("./routes/records");

const app = express();

// middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://video-summary-six.vercel.app",
  "https://video-summary-t6dc.onrender.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// health check
app.get("/", (req, res) => {
  res.send("API running");
});

// quiz routes
app.use("/api/quiz", quizGenerateRoutes);       // /api/quiz/generate
app.use("/api/quiz", quizFromTranscriptRoutes); // /api/quiz/from-transcript
app.use("/api/records", recordsRoutes);

// streaming + chunk summary
app.use("/api/stream-transcript", streamTranscriptRoutes);
app.use("/api/groq-transcript", groqTranscriptRoutes);
app.use("/api/chunk-summary", chunkSummaryRoutes);

// auth + core pipeline
app.use("/api/auth", authRoutes);
app.use("/api/upload-convert", uploadConvertRoutes);

// static MP3 output
app.use("/output", express.static(path.join(__dirname, "output")));

// (optional) if you serve uploaded originals somewhere
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

