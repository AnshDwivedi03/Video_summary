const express = require("express");
const router = express.Router();
const Record = require("../models/Record");
const authMiddleware = require("../utils/authMiddleware");

// Create a new record (protected)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { moduleId, score, totalQuestions, videoTitle, status } = req.body;
        
        if (!moduleId || score === undefined || !totalQuestions || !videoTitle || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newRecord = new Record({
            userId: req.user.id,
            moduleId,
            score,
            totalQuestions,
            videoTitle,
            status
        });

        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        console.error("Error saving record:", err);
        res.status(500).json({ error: "Failed to save record" });
    }
});

// Fetch records for authenticated user (protected)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const records = await Record.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(records);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ error: "Failed to fetch records" });
    }
});

module.exports = router;
