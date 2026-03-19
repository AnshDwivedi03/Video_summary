// backend/utils/assemblyApi.js
const axios = require("axios");

const AAI_BASE = "https://api.assemblyai.com/v2";

async function createTranscript(audioUrl) {
  console.log("AAI payload:", {
    audio_url: audioUrl,
    speech_models: ["universal-3-pro"],
    summarization: true,
    summary_type: "bullets",
    summary_model: "informative",
  });

  const res = await axios.post(
    `${AAI_BASE}/transcript`,
    {
      audio_url: audioUrl,
      speech_models: ["universal-3-pro"], // or ["universal-2"]
      summarization: true,
      summary_type: "bullets",
      summary_model: "informative",
    },
    {
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    id: res.data.id,
    status: res.data.status,
  };
}

async function getTranscript(id) {
  const res = await axios.get(`${AAI_BASE}/transcript/${id}`, {
    headers: {
      Authorization: process.env.ASSEMBLYAI_API_KEY,
    },
  });

  if (res.data.status === "error") {
    console.error("AAI transcript error details:", res.data.error);
  }

  return {
    id: res.data.id,
    status: res.data.status,
    text: res.data.text || "",
    summary: res.data.summary || "",
    error: res.data.error || null,
  };
}

module.exports = { createTranscript, getTranscript };
