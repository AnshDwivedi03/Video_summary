// backend/utils/groqQuiz.js
const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateQuizFromSummary(summary) {
  const prompt = `
You only see a SHORT SUMMARY of a video.

Create 5 HIGH-LEVEL conceptual multiple-choice questions.
Ask about main ideas and overall concepts, not small details.
Do NOT use exact numbers, timestamps, or long quotes.

Return ONLY valid JSON:
[
  { "question": "string",
    "options": ["A","B","C","D"],
    "answer": "A" }
]

SUMMARY:
${summary}
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

module.exports = { generateQuizFromSummary };
