const express = require("express");
const router = express.Router();
const Module = require("../models/Module");

// Fetch all modules
router.get("/", async (req, res) => {
    try {
        const modules = await Module.find().sort({ createdAt: -1 });
        res.json({ modules });
    } catch (err) {
        console.error("GET /api/modules error:", err);
        res.status(500).json({ error: "Failed to fetch modules." });
    }
});

// Save a new module
router.post("/", async (req, res) => {
    try {
        const newModule = new Module(req.body);
        await newModule.save();
        res.json({ success: true, module: newModule });
    } catch (err) {
        console.error("POST /api/modules error:", err);
        res.status(500).json({ error: "Failed to save module." });
    }
});

module.exports = router;
