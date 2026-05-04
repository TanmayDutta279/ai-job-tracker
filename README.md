#AI Job Tracker

AI-powered web app that analyzes resumes, calculates ATS scores, and suggests job roles using Google Gemini.

---

## Features

* Resume upload (PDF)
* AI-based ATS scoring
* Skill extraction
* Job role suggestions
* Improvement tips

---

## Tech Stack

* React (Vite)
* Node.js + Express
* Google Gemini API

---

## Setup

```bash
git clone https://github.com/TanmayDutta279/ai-job-tracker.git
cd ai-job-tracker
cd backend
npm install
```

Create `.env` in `backend/`:

```
GEMINI_API_KEY=your_key_here
```

Run backend:

```bash
node server.js
```

Run frontend:

```bash
cd ../frontend
npm install
npm run dev
```

---

## Author

Tanmay Dutta
https://github.com/TanmayDutta279
