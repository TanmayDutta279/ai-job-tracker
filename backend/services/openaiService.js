const { GoogleGenerativeAI } = require("@google/generative-ai");

// console.log("API KEY:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

const analyzeResume = async (resumeText) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
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
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseJSON(text);
};


module.exports = { analyzeResume };
// 🎯 Job Match
const compareJob = async (resumeText, jobDescription) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });

  const prompt = `
You are a strict ATS system.

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
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed = parseJSON(text);

  // penalty logic
  let score = parsed.matchScore;

  if (parsed.missingSkills?.length >= 5) score -= 20;
  else if (parsed.missingSkills?.length >= 3) score -= 10;

  parsed.matchScore = Math.max(20, Math.min(100, score));

  return parsed;
};

module.exports = {
  analyzeResume,
  compareJob,
};