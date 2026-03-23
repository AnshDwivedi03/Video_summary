const express = require("express");
const router = express.Router();
const Record = require("../models/Record");

// Create a new record
router.post("/", async (req, res) => {
    try {
        const { userId, moduleId, score, totalQuestions, videoTitle, status } = req.body;
        
        if (!userId || !moduleId || score === undefined || !totalQuestions || !videoTitle || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newRecord = new Record({
            userId,
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

// Fetch records by user ID
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const records = await Record.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(records);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ error: "Failed to fetch records" });
    }
});

module.exports = router;
