const mongoose = require("mongoose");

const videoCacheSchema = new mongoose.Schema({
  fileHash: { type: String, required: true, unique: true, index: true },
  fileName: { type: String, required: true },
  transcript: { type: Array, default: [] },
  summary: { type: Array, default: [] },
  quiz: { type: Array, default: [] },
  audioUrl: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VideoCache", videoCacheSchema);
