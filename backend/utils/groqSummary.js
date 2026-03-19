// backend/utils/groqSummary.js
const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_ID = "llama-3.1-8b-instant";

async function summarizeChunk(text) {
  const res = await client.chat.completions.create({
    model: MODEL_ID,
    messages: [
      {
        role: "system",
        content:
          "You summarize transcript chunks in 1-3 bullet points. Keep them short and concrete.",
      },
      {
        role: "user",
        content: `Summarize this transcript chunk:\n"""${text}"""`,
      },
    ],
    temperature: 0.3,
  });

  return res.choices[0]?.message?.content?.trim() || "";
}

module.exports = { summarizeChunk };
