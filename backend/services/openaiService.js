const analyzeResumeMock = async (resumeText) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const text = (resumeText || '').toLowerCase();
  
  // Basic heuristic skill extraction
  const knownSkills = [
    "javascript", "react", "node.js", "python", "java", "c++", "c#", "ruby", "go",
    "sql", "nosql", "mongodb", "postgresql", "mysql", "aws", "azure", "gcp",
    "docker", "kubernetes", "html", "css", "typescript", "graphql", "rest api",
    "machine learning", "data science", "angular", "vue", "express", "django"
  ];
  
  const foundSkills = knownSkills.filter(skill => text.includes(skill));
  if (foundSkills.length === 0) {
    foundSkills.push("Communication", "Problem Solving", "Adaptability");
  }

  // Dynamic ATS Score based on text length and skills found
  const baseScore = Math.min(50, text.length / 50); // up to 50 points for length
  const skillScore = Math.min(50, foundSkills.length * 5); // up to 50 points for skills
  const atsScore = Math.floor(baseScore + skillScore) || 45;

  // Dynamic job roles
  const jobRoles = [];
  if (foundSkills.includes("react") || foundSkills.includes("vue") || foundSkills.includes("angular")) {
    jobRoles.push("Frontend Developer");
  }
  if (foundSkills.includes("node.js") || foundSkills.includes("python") || foundSkills.includes("java")) {
    jobRoles.push("Backend Developer");
  }
  if (jobRoles.length === 2 || foundSkills.includes("sql") || foundSkills.includes("docker")) {
    jobRoles.push("Full Stack Engineer");
  }
  if (foundSkills.includes("machine learning") || foundSkills.includes("data science")) {
    jobRoles.push("Data Scientist");
  }
  
  if (jobRoles.length === 0) {
    jobRoles.push("Software Engineer", "Technical Analyst", "IT Support");
  }

  // Dynamic suggestions
  const suggestions = [];
  if (atsScore < 60) {
    suggestions.push("Your resume is quite short. Add more detailed descriptions of your past roles.");
  }
  if (foundSkills.length < 4) {
    suggestions.push("We couldn't detect many technical keywords. Ensure you explicitly list all your core skills.");
  }
  suggestions.push("Make sure all bullet points start with strong action verbs (e.g., 'Developed', 'Managed').");
  suggestions.push("Include quantifiable metrics (e.g., 'Increased performance by 20%') where possible.");

  return {
    atsScore: Math.min(100, atsScore),
    skills: foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    jobRoles,
    suggestions,
    resumeText 
  };
};

const compareJobMock = async (resumeText, jobDescription) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const text = (resumeText || '').toLowerCase();
  const jobText = (jobDescription || '').toLowerCase();

  const knownSkills = [
    "javascript", "react", "node.js", "python", "java", "c++", "c#", "ruby", "go",
    "sql", "nosql", "mongodb", "postgresql", "mysql", "aws", "azure", "gcp",
    "docker", "kubernetes", "html", "css", "typescript", "graphql", "rest api"
  ];

  const resumeSkills = knownSkills.filter(skill => text.includes(skill));
  const jobSkills = knownSkills.filter(skill => jobText.includes(skill));

  const missingSkills = jobSkills.filter(skill => !resumeSkills.includes(skill));
  
  // Calculate score
  let matchScore = 100;
  if (jobSkills.length > 0) {
    const matchRatio = (jobSkills.length - missingSkills.length) / jobSkills.length;
    matchScore = Math.floor(matchRatio * 100);
  } else {
    // If job description is vague
    matchScore = text.length > 200 ? 85 : 60;
  }
  
  // Ensure score looks realistic
  if (matchScore < 20) matchScore = 35 + Math.floor(Math.random() * 20);

  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Consider adding projects or experience related to: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  if (matchScore < 70) {
    suggestions.push("Tailor your resume specifically to the keywords found in this job description.");
  } else {
    suggestions.push("Your profile is a strong match! Ensure your cover letter highlights these exact overlaps.");
  }

  return {
    matchScore,
    missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    suggestions
  };
};

module.exports = {
  analyzeResumeMock,
  compareJobMock
};
