#!/usr/bin/env node

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8787;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mock: true,
    serverTime: new Date().toISOString(),
  });
});

// Log endpoint
app.post("/api/log", (req, res) => {
  console.log("📝 Log:", req.body);
  res.json({ ok: true });
});

// Transcribe endpoint (mock)
app.post("/api/transcribe", upload.single("file"), (req, res) => {
  console.log("🎤 Transcribe request:", req.file?.originalname);

  // Mock transcription response
  res.json({
    ok: true,
    mock: true,
    language: "en",
    text: "This is a mock transcription of your audio file. In a real implementation, this would be the actual transcribed text from your audio.",
  });
});

// Captions endpoint (mock)
app.post("/api/captions", (req, res) => {
  console.log("📝 Captions request:", req.body);

  const { transcript, tone = "professional", maxLen = 280 } = req.body;

  // Mock caption generation
  const mockCaptions = {
    tweet: `Mock Twitter caption: ${transcript.substring(0, maxLen)}...`,
    instagram: `Mock Instagram caption: ${transcript.substring(0, maxLen)}...`,
    youtube: `Mock YouTube caption: ${transcript.substring(0, maxLen)}...`,
  };

  res.json(mockCaptions);
});

// Export ZIP endpoint (mock)
app.post("/api/exportZip", (req, res) => {
  console.log("📦 Export ZIP request:", req.body);

  // Mock ZIP export response
  res.json({
    downloadUrl: "https://example.com/mock-export.zip",
  });
});

// Serve static files for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`🎯 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down mock server...");
  process.exit(0);
});
