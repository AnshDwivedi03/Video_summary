const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    duration: { type: String, required: true },
    status: { type: String, default: "Completed" },
    progress: { type: Number, default: 100 },
    thumb: { type: String, required: true },
    transcript: { type: Array, default: [] }, // Array of { time, text }
    summary: { type: Array, default: [] }, // Array of strings
    quiz: { type: Array, default: [] }, // Array of quiz objects
    audioUrl: { type: String, default: "" }, // Cloudinary audio URL
    isOnboarding: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Module", moduleSchema);
