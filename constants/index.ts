export const SCORE_LEVELS = [
  { min: 0,  max: 39,  label: "Poor",      color: "#ef4444", bg: "bg-red-500/10",    text: "text-red-400" },
  { min: 40, max: 59,  label: "Average",   color: "#f59e0b", bg: "bg-amber-500/10",  text: "text-amber-400" },
  { min: 60, max: 74,  label: "Good",      color: "#eab308", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  { min: 75, max: 89,  label: "Great",     color: "#3b82f6", bg: "bg-blue-500/10",   text: "text-blue-400" },
  { min: 90, max: 100, label: "Excellent", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400" },
];

export const ANALYSIS_CATEGORIES = [
  "Content Quality",
  "ATS Compatibility",
  "Skills Alignment",
  "Structure & Formatting",
  "Tone & Language",
];

export const FEATURES = [
  { icon: "🎯", title: "Exact ATS Score", desc: "Get a precise 0–100 score showing how ATS software ranks your resume." },
  { icon: "🔍", title: "Keyword Analysis", desc: "See which job keywords are missing and which you've already covered." },
  { icon: "📊", title: "Category Breakdown", desc: "Detailed scores across 5 dimensions: content, structure, skills, tone, ATS." },
  { icon: "💡", title: "Actionable Tips", desc: "Specific, prioritized improvements — not generic advice." },
  { icon: "🗂️", title: "Resume History", desc: "Track all your resume analyses and improvements over time." },
];

export const HOW_IT_WORKS = [
  { step: 1, title: "Upload Your Resume", desc: "Drop your PDF resume into the analyzer." },
  { step: 2, title: "Enter Job Details", desc: "Paste the job description and company name." },
  { step: 3, title: "Get Your Score", desc: "AI analyzes your resume and returns a full ATS report in seconds." },
];
