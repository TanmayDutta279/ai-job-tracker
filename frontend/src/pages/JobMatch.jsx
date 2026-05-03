import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Target, AlertTriangle, CheckCircle, Search, Briefcase, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const JobMatch = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);

  const handleMatch = async () => {
    const resumeText = localStorage.getItem('jobflow_resume_text');
    if (!resumeText) {
      alert('No resume found. Please upload a resume first.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/job-match', { resumeText }, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
      setResult(response.data);

      const jobsResponse = await axios.post('http://localhost:5000/api/jobs', { resumeText }, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error('Match failed', error);
      alert('Failed to analyze job match.');
    } finally {
      setLoading(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] overflow-hidden mb-8 shadow-lg"
        >
          <div className="p-8 border-b border-slate-100/50 bg-white/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Automatic Job Matcher</h1>
              <p className="text-slate-500 mt-2 font-medium">We'll instantly evaluate your resume against targeted roles using AI.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMatch}
              disabled={loading}
              className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 disabled:opacity-50 transition-all w-full sm:w-auto justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Find Best Match
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>

        {result && (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={fadeUp} className="glass-card rounded-[2rem] overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center mb-3">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Matched Job Profile
                  </h3>
                  <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{result.matchedJobTitle}</h4>
                  <p className="text-slate-700 mt-2 font-medium max-w-xl">{result.matchedJobDescription}</p>
                </div>
                
                {result.matchedJobLink && (
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    href={result.matchedJobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-bold bg-white border border-indigo-100 px-5 py-3 rounded-xl shadow-md transition-all"
                  >
                    Apply Link <ExternalLink className="w-4 h-4 ml-2" />
                  </motion.a>
                )}
              </div>

              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center p-8 bg-white/50 rounded-2xl border border-slate-100 min-w-[240px]">
                    <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-6">Match Score</h3>
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <motion.circle 
                          initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                          animate={{ strokeDashoffset: (2 * Math.PI * 56) * (1 - result.matchScore / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 56} 
                          className={`${result.matchScore > 75 ? 'text-green-500' : result.matchScore > 50 ? 'text-yellow-500' : 'text-red-500'}`} 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-extrabold text-slate-900">{result.matchScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow space-y-8">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center mb-4 tracking-tight">
                        <Target className="w-5 h-5 mr-2 text-red-500" />
                        Missing Skills to Target
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.length > 0 ? (
                          result.missingSkills.map((skill, idx) => (
                            <span key={idx} className="px-4 py-2 bg-red-50/80 text-red-700 border border-red-100 rounded-lg text-sm font-bold shadow-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-green-600 font-bold flex items-center bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            You have all the required key skills!
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center mb-4 tracking-tight">
                        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                        How to improve your chances
                      </h3>
                      <ul className="space-y-3">
                        {result.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-700 font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            <span className="mr-3 text-indigo-500 font-bold text-lg leading-none">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-card rounded-[2rem] overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended Jobs For You</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Based on your resume, you might also be interested in these roles.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-8 py-4">Company</th>
                      <th className="px-8 py-4">Job Title</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {jobs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-8 text-center text-slate-500">
                          <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold shadow-sm">
                                {job.company.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900">{job.company}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-slate-600">{job.title}</td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold shadow-sm border border-blue-100">
                              Suggested
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <motion.a 
                              whileHover={{ scale: 1.05 }}
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-bold bg-white border border-indigo-100 px-4 py-2 rounded-xl shadow-sm transition-colors"
                            >
                              Apply Link <ExternalLink className="w-4 h-4 ml-2" />
                            </motion.a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobMatch;
