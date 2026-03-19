// backend/utils/groqSummaryAndQuiz.js
const Groq = require("groq-sdk");
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateSummaryAndQuiz(transcriptText) {
  const prompt = `
You are an expert educational content analyst and instructional designer. You are given the FULL transcript of a training video.

Your job is to produce TWO things:

1. A DETAILED SUMMARY written as 4-6 well-developed paragraphs. Each paragraph should be 3-4 sentences long, covering a distinct aspect or theme of the video content. Write in a natural, flowing narrative style — not as bullet points or lists. Explain what was discussed, why it matters, and any specific details, examples, or data points mentioned. Each paragraph should read like a section of a well-written article. Use clear, professional language suitable for corporate training documentation.

2. A 5-question multiple-choice QUIZ that tests deep understanding (not just surface-level recall). Each question should have exactly 4 options with only one correct answer.

Return ONLY valid JSON in this exact format, with no additional text or markdown formatting:
{
  "summary": [
    "First paragraph: A well-written 3-4 sentence paragraph covering one aspect of the content. It should flow naturally and provide context and significance.",
    "Second paragraph: Another thorough paragraph exploring a different theme or topic from the video."
  ],
  "quiz": [
    {
      "question": "A thoughtful question testing understanding?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0
    }
  ]
}

The 'answer' field must be the integer index (0-3) of the correct option.

TRANSCRIPT:
${transcriptText}
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0].message.content;
  const jsonStr = content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1);
  return JSON.parse(jsonStr);
}

module.exports = { generateSummaryAndQuiz };
