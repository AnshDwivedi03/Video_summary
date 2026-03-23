const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    moduleId: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    videoTitle: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Record", recordSchema);
