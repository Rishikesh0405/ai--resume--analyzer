import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getGeminiApiKey } from "../lib/gemini";
import { analyzeTextResumeWithGemini } from "../lib/gemini";
import { saveAnalysis } from "../lib/puter";
import type { ResumeAnalysis } from "../../types";

export const ResumeBuilderPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    name: "Prince Singh",
    title: "Data Analyst",
    email: "prince.singh@example.com",
    phone: "+1 (234) 567-890",
    location: "New York, NY",
    website: "www.princesingh.dev",
    linkedin: "linkedin.com/in/princesingh",
    github: "github.com/princesingh",
    summary: "Detail-oriented Data Analyst with 3+ years of experience extracting business insights, automating analytics pipelines, and constructing interactive dashboards. Proven track record of leveraging SQL and Python to improve operational efficiencies and support strategic decision-making."
  });

  const [experiences, setExperiences] = useState([
    {
      id: "1",
      jobTitle: "Data Analyst",
      company: "Deloitte",
      location: "New York, NY",
      dateRange: "2023 - Present",
      description: "Extracted and manipulated structured data from enterprise SQL databases to model user metrics. Constructed interactive Tableau and Power BI dashboards to track KPI trends, saving analysts 10+ hours per week. Programmed ETL scripts in Python to automate daily reports."
    },
    {
      id: "2",
      jobTitle: "Junior Analyst",
      company: "Acme Analytics",
      location: "Boston, MA",
      dateRange: "2021 - 2023",
      description: "Performed linear regressions and statistical validations on customer segmentation datasets. Audited database accuracy and performed cleansing routines using Pandas. Drafted weekly executive summaries."
    }
  ]);

  const [educations, setEducations] = useState([
    {
      id: "1",
      degree: "B.S. in Computer Science",
      institution: "Stanford University",
      dateRange: "2017 - 2021",
      description: "Specialized in Data Science and Database Systems. Graduated with honors."
    }
  ]);

  const [skills, setSkills] = useState("Python, SQL, R, Tableau, Power BI, Excel, Pandas, Numpy, ETL Pipelines, Data Modeling, Statistical Analysis");

  // ATS Analysis State
  const [jobTitle, setJobTitle] = useState("Senior Data Analyst");
  const [companyName, setCompanyName] = useState("Google");
  const [jobDescription, setJobDescription] = useState("Looking for a Senior Data Analyst to transform raw numbers into actionable directions. Experience with SQL queries, database indexing, Tableau dashboards, and Python automation libraries is required. Must be able to quantifiably present performance metrics.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Authenticate user
  useEffect(() => {
    const checkAuth = () => {
      if (window.puter?.auth) {
        if (!window.puter.auth.isSignedIn()) {
          navigate("/sign-in", { replace: true });
        }
      }
    };

    if (window.puter) {
      checkAuth();
    } else {
      const interval = setInterval(() => {
        if (window.puter) {
          checkAuth();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  // Handle personal info change
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle experience changes
  const handleExperienceChange = (id: string, field: string, value: string) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        jobTitle: "New Job Title",
        company: "Company Name",
        location: "Location",
        dateRange: "Dates",
        description: "Responsibilities and achievements..."
      }
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Handle education changes
  const handleEducationChange = (id: string, field: string, value: string) => {
    setEducations((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        degree: "Degree Name",
        institution: "School Name",
        dateRange: "Dates",
        description: "Notes or honors..."
      }
    ]);
  };

  const removeEducation = (id: string) => {
    setEducations((prev) => prev.filter((edu) => edu.id !== id));
  };

  // Trigger Print PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Format CV text for analysis
  const compileResumeText = (): string => {
    let text = `NAME: ${personalInfo.name}\nTITLE: ${personalInfo.title}\n`;
    text += `CONTACT: ${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}\n`;
    text += `LINKS: ${personalInfo.website} | ${personalInfo.linkedin} | ${personalInfo.github}\n\n`;
    text += `SUMMARY:\n${personalInfo.summary}\n\n`;
    text += `SKILLS: ${skills}\n\n`;
    
    text += `WORK EXPERIENCE:\n`;
    experiences.forEach((exp) => {
      text += `- ${exp.jobTitle} at ${exp.company} (${exp.dateRange})\n  Location: ${exp.location}\n  Description: ${exp.description}\n\n`;
    });
    
    text += `EDUCATION:\n`;
    educations.forEach((edu) => {
      text += `- ${edu.degree} from ${edu.institution} (${edu.dateRange})\n  Description: ${edu.description}\n\n`;
    });
    
    return text;
  };

  // Handle direct scan submission
  const handleDirectScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      setError("Google Gemini API Key is missing. Please create a .env file in the project root containing VITE_GEMINI_API_KEY=your_api_key and restart the development server.");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Please specify the Target Job Title.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please specify the Job Description.");
      return;
    }
    if (jobDescription.trim().length < 100) {
      setError("Job description should be at least 100 characters.");
      return;
    }

    setIsAnalyzing(true);
    try {
      setAnalysisStep("Compiling structured resume text data...");
      const resumeText = compileResumeText();

      setAnalysisStep("Evaluating against job constraints using Gemini 2.0 Flash...");
      const aiResponse = await analyzeTextResumeWithGemini(
        resumeText,
        jobTitle,
        companyName,
        jobDescription
      );

      setAnalysisStep("Saving analysis to Puter cloud database...");
      const user = await window.puter.auth.getUser();
      const analysisId = crypto.randomUUID();
      const newAnalysis: ResumeAnalysis = {
        id: analysisId,
        userId: user.uuid,
        resumeFileName: "Created_in_Builder.pdf",
        resumeFilePath: "/Created_in_Builder.pdf",
        jobTitle,
        companyName,
        jobDescription,
        createdAt: new Date().toISOString(),
        atsScore: aiResponse.atsScore,
        overallFeedback: aiResponse.overallFeedback,
        categories: aiResponse.categories,
        tips: aiResponse.tips,
      };

      await saveAnalysis(newAnalysis);
      navigate(`/resume/${analysisId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred during direct analysis.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Dynamic Printing Style rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview-sheet, #resume-preview-sheet * {
            visibility: visible;
          }
          #resume-preview-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {isAnalyzing ? (
        /* Premium Scan Loader */
        <div className="bg-white border border-slate-100 rounded-3xl p-16 shadow-lg max-w-lg mx-auto text-center space-y-8 mt-12">
          <div className="space-y-3">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Analyzing Builder Draft
            </h3>
            <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider animate-pulse">
              {analysisStep}
            </p>
          </div>
          
          <div className="relative w-48 h-64 bg-white border border-slate-200/60 rounded-2xl shadow-xl p-5 flex flex-col gap-3 scanner-container mx-auto">
            <div className="scanner-laser" />
            <div className="scanner-overlay" />
            
            <div className="w-1/3 h-3 bg-slate-100 rounded-md" />
            <div className="w-2/3 h-2 bg-slate-100 rounded-md" />
            <div className="space-y-2 mt-4">
              <div className="w-full h-2 bg-slate-100 rounded-md" />
              <div className="w-full h-2 bg-slate-100 rounded-md" />
              <div className="w-4/5 h-2 bg-slate-100 rounded-md" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="w-5/6 h-2 bg-slate-100 rounded-md" />
              <div className="w-3/4 h-2 bg-slate-100 rounded-md" />
            </div>
          </div>
          
          <p className="text-[10px] text-slate-405 text-slate-400 max-w-xs mx-auto leading-relaxed uppercase tracking-wider font-bold">
            Gemini is auditing keywords, formatting layout standards, and section metrics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editor */}
          <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-8 select-none">
            <div className="border-b border-slate-100 pb-4">
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span>📄</span> Enhanced CV Builder
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                Construct and style a professional industry CV, and evaluate it in real time.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-650 text-xs font-semibold px-4 py-3.5 rounded-xl text-red-600">
                ⚠️ {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                1. Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={personalInfo.name}
                  onChange={handlePersonalChange}
                  placeholder="Full Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input
                  type="text"
                  name="title"
                  value={personalInfo.title}
                  onChange={handlePersonalChange}
                  placeholder="Professional Title"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalChange}
                  placeholder="Email Address"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input
                  type="text"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalChange}
                  placeholder="Phone Number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input
                  type="text"
                  name="location"
                  value={personalInfo.location}
                  onChange={handlePersonalChange}
                  placeholder="Location"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input
                  type="text"
                  name="website"
                  value={personalInfo.website}
                  onChange={handlePersonalChange}
                  placeholder="Website"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input
                  type="text"
                  name="linkedin"
                  value={personalInfo.linkedin}
                  onChange={handlePersonalChange}
                  placeholder="LinkedIn Profile"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input
                  type="text"
                  name="github"
                  value={personalInfo.github}
                  onChange={handlePersonalChange}
                  placeholder="GitHub Profile"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
              <textarea
                name="summary"
                value={personalInfo.summary}
                onChange={handlePersonalChange}
                placeholder="Professional Summary"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none"
              />
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  2. Work Experience
                </h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  + Add Job
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {experiences.map((exp) => (
                  <div key={exp.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:text-red-700 transition"
                      title="Remove experience"
                    >
                      ✕
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => handleExperienceChange(exp.id, "jobTitle", e.target.value)}
                        placeholder="Job Title"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                        placeholder="Company"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                        placeholder="Location"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={exp.dateRange}
                        onChange={(e) => handleExperienceChange(exp.id, "dateRange", e.target.value)}
                        placeholder="Date Range (e.g. 2021 - Present)"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                      placeholder="Key achievements or responsibilities..."
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  3. Education
                </h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  + Add Degree
                </button>
              </div>

              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:text-red-700 transition"
                      title="Remove education"
                    >
                      ✕
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                        placeholder="Degree (e.g. M.S. in Analytics)"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                        placeholder="School/University"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={edu.dateRange}
                        onChange={(e) => handleEducationChange(edu.id, "dateRange", e.target.value)}
                        placeholder="Graduation Date"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={edu.description}
                        onChange={(e) => handleEducationChange(edu.id, "description", e.target.value)}
                        placeholder="Honors or major fields of study..."
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                4. Professional Skills
              </h3>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Comma separated technical skills (e.g. SQL, Python, Excel)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {/* Target Job Post for Direct Evaluation */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                5. Evaluate Template Fit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 text-slate-400">TARGET JOB TITLE *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Data Analyst"
                    className="w-full bg-slate-550 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-455 text-slate-400">COMPANY NAME</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full bg-slate-550 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-455 text-slate-400">JOB DESCRIPTION *</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job post details..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10 resize-y"
                />
              </div>
              
              <button
                type="button"
                onClick={handleDirectScan}
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Analyze Template in ResumeIQ 🚀
              </button>
            </div>
          </div>

          {/* Right Column: Visual Resume Preview Sheet */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Template Preview
              </span>
              
              <button
                type="button"
                onClick={handleExportPDF}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl px-4 py-2 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🖨️</span> Export PDF
              </button>
            </div>

            {/* Document sheet template frame */}
            <div
              id="resume-preview-sheet"
              className="bg-white border border-slate-150 rounded-3xl p-10 md:p-12 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] text-slate-800 font-sans space-y-6 flex flex-col justify-between aspect-[8.5/11] border-slate-200"
            >
              {/* Header */}
              <div className="text-center space-y-3 pb-5 border-b border-slate-150 border-slate-200">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
                  {personalInfo.name || "YOUR NAME"}
                </h2>
                <h4 className="text-sm font-bold text-indigo-600 tracking-wider uppercase">
                  {personalInfo.title || "Target Career Title"}
                </h4>
                
                {/* Contact info metadata row */}
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                  {personalInfo.email && <span>📧 {personalInfo.email}</span>}
                  {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                  {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                  {personalInfo.website && <span>🌐 {personalInfo.website}</span>}
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-semibold font-mono">
                  {personalInfo.linkedin && <span>LinkedIn: {personalInfo.linkedin}</span>}
                  {personalInfo.github && <span>GitHub: {personalInfo.github}</span>}
                </div>
              </div>

              {/* Summary Section */}
              {personalInfo.summary && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
                    Professional Summary
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal text-justify">
                    {personalInfo.summary}
                  </p>
                </div>
              )}

              {/* Technical Skills */}
              {skills && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
                    Technical Core Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.split(",").map((sk, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-[10px] text-slate-650 text-slate-600 font-semibold shadow-sm"
                      >
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experiences.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
                    Professional Work Experience
                  </h3>
                  
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="font-bold text-slate-800">
                            {exp.jobTitle} <span className="font-medium text-slate-400">at</span> {exp.company}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">{exp.dateRange}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-indigo-600 font-semibold">
                          <span>{exp.location}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-normal text-justify whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {educations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
                    Education & Credentials
                  </h3>
                  
                  <div className="space-y-3">
                    {educations.map((edu) => (
                      <div key={edu.id} className="space-y-0.5">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="font-bold text-slate-800">{edu.degree}</span>
                          <span className="text-[10px] font-bold text-slate-450 text-slate-400 font-mono">{edu.dateRange}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-405 text-slate-400 font-semibold">
                          <span>{edu.institution}</span>
                          <span>{edu.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilderPage;
