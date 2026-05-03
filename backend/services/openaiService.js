const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Resume Analysis (unchanged or improved if you want) ---
const analyzeResume = async (resumeText) => {
  const prompt = `
Analyze this resume and return ONLY valid JSON:

{
  "atsScore": number (0-100),
  "skills": ["skill1", "skill2"],
  "jobRoles": ["at least 6 relevant roles"],
  "suggestions": ["improvement1", "improvement2"],
  "resumeText": "short summary"
}

Rules:
- Give MINIMUM 6 job roles
- Include beginner + advanced roles
- Be realistic

Resume:
${resumeText}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Resume JSON error:", text);
    throw new Error("AI response parsing failed");
  }
};

// --- 🔥 NEW STRICT JOB MATCH FUNCTION ---
const compareJob = async (resumeText, jobDescription) => {
  const prompt = `
You are a STRICT ATS system.

Compare resume with job description and return ONLY JSON:

{
  "matchScore": number (0-100),
  "missingSkills": [],
  "strengths": [],
  "suggestions": []
}

STRICT RULES:
- Be harsh in scoring
- Many missing skills → score below 60
- Average resume → 50-75
- Only excellent match → above 85
- Penalize missing required skills heavily
- DO NOT inflate scores

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("Match JSON error:", text);
    throw new Error("AI response parsing failed");
  }

  // 🔥 EXTRA PENALTY LOGIC (makes it realistic)
  let score = parsed.matchScore;

  if (parsed.missingSkills?.length >= 5) {
    score -= 20;
  } else if (parsed.missingSkills?.length >= 3) {
    score -= 10;
  }

  // clamp score between 20–100
  score = Math.max(20, Math.min(100, score));

  parsed.matchScore = score;

  return parsed;
};

module.exports = {
  analyzeResume,
  compareJob,
};