import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FileUploader } from "../components/FileUploader";
import { ResumeCard } from "../components/ResumeCard";
import { extractTextFromPDF } from "../lib/pdfText";
import { saveAnalysis, getAllAnalyses, deleteAnalysis } from "../lib/puter";
import { analyzeResumeWithBackend } from "../lib/gemini";
import type { ResumeAnalysis } from "../../types";

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");



  // UI Flow State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<ResumeAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Protect route
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

  // Load history list on mount
  const loadHistory = async () => {
    try {
      const list = await getAllAnalyses();
      setHistory(list);
    } catch (err) {
      console.error("Failed to load resume analysis history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (window.puter) {
      loadHistory();
    } else {
      const interval = setInterval(() => {
        if (window.puter) {
          loadHistory();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);


  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this resume analysis?")) {
      try {
        await deleteAnalysis(id);
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Failed to delete analysis:", err);
        setError("Failed to delete history item. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please select a resume PDF file to upload.");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Please specify the Target Job Title.");
      return;
    }
    

   setIsAnalyzing(true);
    try {
      // Step 1: Upload resume to Puter FS
      setAnalysisStep("Uploading resume to Puter cloud...");
      const uploaded = await window.puter.fs.upload([file]);
      if (!uploaded) {
        throw new Error("Resume upload failed.");
      }

      let uploadedFile;
      if (Array.isArray(uploaded)) {
        if (uploaded.length === 0) {
          throw new Error("Resume upload failed.");
        }
        uploadedFile = uploaded[0];
      } else {
        uploadedFile = uploaded;
      }

      const resumeFileName = uploadedFile.name;
      const resumeFilePath = uploadedFile.path;

      // Step 2: Convert first page of PDF to image locally
      setAnalysisStep("Converting PDF page to canvas image...");
      let resumeText = "";

      try {
        resumeText = await extractTextFromPDF(file);
      } catch (err: any) {
        console.error(err);
        throw new Error("Failed to extract text from PDF.");
      }
      // Step 3: Run Gemini 2.0 Flash Vision REST Analysis
      setAnalysisStep("Analyzing your resume with AI...");
      const aiResponse = await analyzeResumeWithBackend(
        resumeText,
        jobTitle,
        companyName,
        
      );
      // Step 4: Save analysis package to Puter KV
      setAnalysisStep("Saving analysis metrics to cloud storage...");
      const user = await window.puter.auth.getUser();
      const analysisId = crypto.randomUUID();
      const newAnalysis: ResumeAnalysis = {
        id: analysisId,
        userId: user.uuid,
        resumeFileName,
        resumeFilePath,
        jobTitle,
        companyName,
        jobDescription: "",
        createdAt: new Date().toISOString(),
        atsScore: aiResponse.atsScore,
        overallFeedback: aiResponse.overallFeedback,
        categories: aiResponse.categories,
        tips: aiResponse.tips,
        resumeBase64Image: "",
      };

      await saveAnalysis(newAnalysis);

      // Navigate to results screen
      navigate(`/resume/${analysisId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred during resume analysis. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Form Container */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {isAnalyzing ? (
          /* Premium Scan Animation Visualizer */
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
            <div className="space-y-3">
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Smart feedback for your dream job
              </h3>
              <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider animate-pulse">
                {analysisStep}
              </p>
            </div>

            {/* The Document Visual Container */}
            <div className="relative w-48 h-64 bg-white border border-slate-200/60 rounded-2xl shadow-xl p-5 flex flex-col gap-3 scanner-container">
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
              <div className="space-y-2 mt-4">
                <div className="w-full h-2 bg-slate-100 rounded-md" />
                <div className="w-1/2 h-2 bg-slate-100 rounded-md" />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed uppercase tracking-wider font-bold">
              Gemini is evaluating formatting structures, action verbs, and keyword alignment scales.
            </p>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Analyze New Resume
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Compare your resume qualifications directly against the target job posting filters.
              </p>
            </div>



            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-650 text-xs font-semibold px-4 py-3.5 rounded-xl text-red-600">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Drag/Drop PDF Uploader */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Resume Document
                  </label>
                  <a
                    href="/sample_resume.pdf"
                    download="sample_resume.pdf"
                    className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline font-bold transition cursor-pointer"
                  >
                    Download Sample Resume
                  </a>
                </div>
                <FileUploader onFileSelect={setFile} selectedFile={file} />
              </div>

              {/* Right: Job Details inputs */}
              <div className="space-y-6">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                  Target Job Specification
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="jobTitle" className="text-xs font-bold text-slate-650 text-slate-500">
                      Job Title <span className="text-indigo-500">*</span>
                    </label>
                    <input
                      id="jobTitle"
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="text-xs font-bold text-slate-650 text-slate-500">
                      Company <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      placeholder="e.g. Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

                
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-5 border-t border-slate-100">
              <button
                type="submit"
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-8 py-3.5 shadow-md shadow-indigo-600/10 hover:shadow-lg transition cursor-pointer"
              >
                Analyze Resume 🚀
              </button>
            </div>
          </form>
        )}
      </div>

      {/* History Dashboard Section */}
      <section className="space-y-8 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Track Your Applications & Resume Ratings
          </h2>
          <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto">
            Review your submissions and check AI-powered feedback.
          </p>
        </div>

        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-16 text-center space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <span className="text-4xl block">🗂️</span>
            <h4 className="text-base font-bold text-slate-700">No Rated Resumes Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Upload your resume and a target job post above to begin tracking applications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.map((analysis) => (
              <ResumeCard
                key={analysis.id}
                analysis={analysis}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UploadPage;

