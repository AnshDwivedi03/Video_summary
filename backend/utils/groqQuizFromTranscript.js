// backend/utils/groqQuizFromTranscript.js
const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateQuizFromTranscript(transcript) {
  const prompt = `
You see the FULL DETAILED TRANSCRIPT of a video.

Create 5 DETAIL-ORIENTED multiple-choice questions.
Use specific facts: numbers, exact terms, examples, step order, etc.
Avoid vague or high-level questions.

Return ONLY valid JSON:
[
  { "question": "string",
    "options": ["A","B","C","D"],
    "answer": "A" }
]

TRANSCRIPT:
${transcript}
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0].message.content;
  const json = content.slice(content.indexOf("["), content.lastIndexOf("]") + 1);
  return JSON.parse(json);
}

module.exports = { generateQuizFromTranscript };
