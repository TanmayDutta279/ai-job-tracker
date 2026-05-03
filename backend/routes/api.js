const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfLib = require('pdf-parse');
const pdfParse = typeof pdfLib === 'function' ? pdfLib : (pdfLib.default || pdfLib.PDFParse);
const { analyzeResume, compareJob } = require('../services/openaiService');

// Multer setup for file uploads (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/upload-resume
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    // Parse PDF
    let textContent = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      textContent = pdfData.text;
    } catch (parseError) {
      console.warn('PDF parsing failed, but continuing with mock AI:', parseError.message);
      textContent = 'Mock resume text due to parsing error';
    }

    // Call AI Service (Mocked for now as per user request)
    const { analyzeResume } = require('../services/openaiService');

const analysis = await analyzeResume(textContent);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /upload-resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// POST /api/job-match
router.post('/job-match', async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'Missing resumeText' });
    }

    const text = (resumeText || '').toLowerCase();

    // 🎯 Dynamic Job Selection (Better than generic one)
    let jobDescription = "";
    let jobTitle = "";

    if (text.includes('react') || text.includes('javascript') || text.includes('html')) {
      jobTitle = "Frontend Developer";
      jobDescription = `
Looking for a Frontend Developer with strong skills in React, JavaScript, HTML, CSS, responsive design, API integration, and UI/UX best practices. Experience with performance optimization and state management is a plus.
`;
    } 
    else if (text.includes('node') || text.includes('python') || text.includes('java')) {
      jobTitle = "Backend Developer";
      jobDescription = `
Backend Developer role requiring Node.js or Python or Java, REST APIs, database management (SQL/NoSQL), authentication, server-side logic, scalability, and system design basics.
`;
    } 
    else if (text.includes('machine learning') || text.includes('data') || text.includes('analytics')) {
      jobTitle = "Data Scientist";
      jobDescription = `
Looking for a Data Scientist with knowledge of Python, machine learning, statistics, data analysis, SQL, and experience with model building and evaluation.
`;
    } 
    else {
      jobTitle = "Software Engineer";
      jobDescription = `
General Software Engineering role requiring programming knowledge, data structures and algorithms, problem solving, system design basics, and teamwork skills.
`;
    }

    // 🤖 Call your AI function
    const matchAnalysis = await compareJob(resumeText, jobDescription);

    // 🔥 Add job info for frontend display
    matchAnalysis.matchedJobTitle = jobTitle;
    matchAnalysis.matchedJobDescription = jobDescription;
    matchAnalysis.matchedJobLink = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}`;

    res.json(matchAnalysis);

  } catch (error) {
    console.error('Error in /job-match:', error);
    res.status(500).json({ error: 'Failed to analyze job match' });
  }
});

// POST /api/jobs
router.post('/jobs', async (req, res) => {
  try {
    const { resumeText } = req.body;
    const text = (resumeText || '').toLowerCase();

    // Dynamically decide the jobs based on resume text
    const jobs = [];
    
    let isFrontend = text.includes('react') || text.includes('vue') || text.includes('javascript') || text.includes('html');
    let isBackend = text.includes('node') || text.includes('python') || text.includes('java') || text.includes('sql');
    let isData = text.includes('machine learning') || text.includes('data') || text.includes('analytics');
    let isBusiness = text.includes('sales') || text.includes('marketing') || text.includes('management');

    if (isFrontend) {
      jobs.push({
        id: 1,
        title: 'Frontend Developer',
        company: 'TechCorp Inc.',
        description: 'Looking for a developer with experience in modern web interfaces.',
        link: 'https://www.linkedin.com/jobs/search/?keywords=Frontend%20Developer'
      });
    }

    if (isBackend) {
      jobs.push({
        id: 2,
        title: 'Backend Engineer',
        company: 'Cloud Systems Hub',
        description: 'Join our team to build scalable APIs and microservices.',
        link: 'https://www.linkedin.com/jobs/search/?keywords=Backend%20Engineer'
      });
    }

    if (isFrontend && isBackend) {
      jobs.push({
        id: 3,
        title: 'Full Stack Developer',
        company: 'Startup Innovations',
        description: 'End-to-end web application development for a fast-paced startup.',
        link: 'https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Developer'
      });
    } 
    
    if (isData) {
      jobs.push({
        id: 4,
        title: 'Data Scientist',
        company: 'AI Solutions',
        description: 'Looking for experts in data pipelines and machine learning models.',
        link: 'https://www.linkedin.com/jobs/search/?keywords=Data%20Scientist'
      });
    }

    if (isBusiness || jobs.length === 0) {
      jobs.push({
        id: 5,
        title: 'Business / Operations Manager',
        company: 'Global Enterprises',
        description: 'Looking for professionals to manage operations, sales, or business strategy.',
        link: 'https://www.linkedin.com/jobs/search/?keywords=Business%20Manager'
      });
      if (jobs.length === 1) {
        jobs.push({
          id: 6,
          title: 'Project Coordinator',
          company: 'Agile Teams Ltd.',
          description: 'Coordinate cross-functional teams and ensure project delivery.',
          link: 'https://www.linkedin.com/jobs/search/?keywords=Project%20Coordinator'
        });
      }
    }

    res.json(jobs);
  } catch (error) {
    console.error('Error in /jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router;
