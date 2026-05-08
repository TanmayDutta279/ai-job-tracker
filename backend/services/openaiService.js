const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const axios = require("axios");

// 🔧 Clean JSON parser
function parseJSON(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("RAW AI:", text);
    throw new Error("Invalid AI response");
  }
}

// 📄 Resume Analysis
const analyzeResume = async (resumeText) => {
  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:free",

      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON."
        },
        {
          role: "user",
          content: `
Analyze this resume and return ONLY JSON:

{
  "atsScore": number,
  "skills": [],
  "jobRoles": [],
  "suggestions": [],
  "resumeText": ""
}

Resume:
${resumeText}
`
        }
      ],

      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;

    return parseJSON(text);

  } catch (error) {
    console.error("AI analyzeResume failed:", error.message);
    throw new Error("Failed to analyze resume with AI.");
  }
};

// 🎯 Job Match
const compareJob = async (resumeText, jobDescription) => {
  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:free",

      messages: [
        {
          role: "system",
          content: "You are a strict ATS system. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: `
Return ONLY JSON:

{
  "matchScore": number,
  "missingSkills": [],
  "strengths": [],
  "suggestions": []
}

Resume:
${resumeText}

Job:
${jobDescription}
`
        }
      ],

      temperature: 0.3,
    });

    const text = completion.choices[0].message.content;

    let parsed = parseJSON(text);

    // penalty logic
    let score = parsed.matchScore;

    if (parsed.missingSkills?.length >= 5) score -= 20;
    else if (parsed.missingSkills?.length >= 3) score -= 10;

    parsed.matchScore = Math.max(20, Math.min(100, score));

    return parsed;

  } catch (error) {
    console.error("AI compareJob failed:", error.message);
    throw new Error("Failed to match job with AI.");
  }
};

module.exports = {
  analyzeResume,
  compareJob,
};
