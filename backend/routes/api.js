const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfLib = require('pdf-parse');
const pdfParse = typeof pdfLib === 'function' ? pdfLib : (pdfLib.default || pdfLib.PDFParse);
const { analyzeResumeMock, compareJobMock } = require('../services/openaiService');

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
    const analysis = await analyzeResumeMock(textContent);

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
    
    // Dynamically pick a job to match against
    let autoFetchedJobDescription = "General Software Engineering position requiring strong problem solving, communication, and basic programming knowledge.";
    let matchedJobTitle = "Software Engineer";

    if (text.includes('react') || text.includes('javascript') || text.includes('html')) {
      autoFetchedJobDescription = "Looking for a Frontend developer with experience in modern web development, React, JavaScript, HTML, and CSS.";
      matchedJobTitle = "Frontend Developer";
    } else if (text.includes('node') || text.includes('python') || text.includes('java')) {
      autoFetchedJobDescription = "Backend Developer role focusing on building scalable APIs, databases, Node.js, Python, or Java applications.";
      matchedJobTitle = "Backend Engineer";
    } else if (text.includes('data') || text.includes('machine learning')) {
      autoFetchedJobDescription = "Data Scientist position involving machine learning, data analysis, Python, and SQL.";
      matchedJobTitle = "Data Scientist";
    } else if (text.includes('sales') || text.includes('marketing') || text.includes('manager')) {
      autoFetchedJobDescription = "Seeking an experienced professional for a management role focusing on sales, marketing, and leadership.";
      matchedJobTitle = "Business Manager";
    }

    // Call AI Service (Mocked)
    const matchAnalysis = await compareJobMock(resumeText, autoFetchedJobDescription);
    
    // Attach the auto-fetched job so the frontend can display what it matched against
    matchAnalysis.matchedJobTitle = matchedJobTitle;
    matchAnalysis.matchedJobDescription = autoFetchedJobDescription;
    matchAnalysis.matchedJobLink = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(matchedJobTitle)}`;

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
