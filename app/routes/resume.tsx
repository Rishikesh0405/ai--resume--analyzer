import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getAnalysis } from "../lib/puter";
import type { ResumeAnalysis } from "../../types";
import { ScoreCircle } from "../components/ScoreCircle";
import { ScoreBadge } from "../components/ScoreBadge";
import { Summary } from "../components/Summary";
import { Details } from "../components/Details";
import { ATS } from "../components/ATS";
import { formatDate } from "../lib/utils";

export const ResumePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "details" | "ats">("summary");
  const [downloadingResume, setDownloadingResume] = useState(false);

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

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!id) {
        setError("Invalid analysis ID.");
        setLoading(false);
        return;
      }

      try {
        const data = await getAnalysis(id);
        if (data) {
          setAnalysis(data);
        } else {
          setError("Resume analysis report not found.");
        }
      } catch (err) {
        console.error("Error retrieving analysis:", err);
        setError("Could not load resume analysis data.");
      } finally {
        setLoading(false);
      }
    };

    if (window.puter) {
      loadAnalysis();
    } else {
      const interval = setInterval(() => {
        if (window.puter) {
          loadAnalysis();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [id]);

  const handleOpenResume = async () => {
    if (!analysis || !window.puter?.fs) return;
    setDownloadingResume(true);
    try {
      const blob = await window.puter.fs.read(analysis.resumeFilePath);
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, "_blank");
    } catch (err) {
      console.error("Failed to read resume file:", err);
      alert("Failed to retrieve resume PDF copy from Puter storage.");
    } finally {
      setDownloadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Retrieving scan metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-lg">
          <div className="text-5xl">🛑</div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">Report Not Found</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {error || "We could not find the requested resume analysis report."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/upload"
              className="inline-block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-6 py-3 transition text-sm shadow-sm"
            >
              Return to Upload Form
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-6 border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-405 text-slate-400 font-bold uppercase tracking-widest">
            <Link to="/upload" className="hover:text-indigo-600 transition">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-300">Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight capitalize">
            {analysis.companyName || "Target Fit Evaluation"}
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">
            Job Role: <span className="text-indigo-600">{analysis.jobTitle}</span>
          </p>
        </div>
        
        {/* Actions header buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenResume}
            disabled={downloadingResume}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {downloadingResume ? (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 border-t-slate-800 animate-spin" />
            ) : (
              <span>📄</span>
            )}
            View Original PDF
          </button>
          
          <Link
            to="/upload"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            New Analysis
          </Link>
        </div>
      </div>

      {analysis.isDemoMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <span className="font-bold">Demo Mode Active:</span> The Gemini API key in your `.env` file returned an authentication or rate limit error. This evaluation score and feedback have been generated locally as a simulation. Please verify your API key configuration inside `.env`.
          </div>
        </div>
      )}

      {/* Main Grid: Score sidebar + detailed tab breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Score display & badges */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center text-center space-y-6 shadow-sm">
          <ScoreCircle score={analysis.atsScore} />
          
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              <ScoreBadge score={analysis.atsScore} />
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">
              Scored on formatting compliance, active language style, standard structuring, and key term densities.
            </p>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 space-y-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Scanned Date</span>
              <span className="text-slate-700 font-semibold font-mono">{formatDate(analysis.createdAt || new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Filename</span>
              <span className="text-slate-700 font-semibold truncate max-w-[160px]" title={analysis.resumeFileName || "Untitled Document"}>
                {analysis.resumeFileName || "Untitled Document"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Tab navigation & content details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Selector Nav */}
          <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("summary")}
              className={`pb-3 px-5 text-sm font-bold transition border-b-2 -mb-px flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "summary"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-450 text-slate-400 hover:text-slate-700"
              }`}
            >
              <span>🎯</span> Summary
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 px-5 text-sm font-bold transition border-b-2 -mb-px flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "details"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-450 text-slate-400 hover:text-slate-700"
              }`}
            >
              <span>📊</span> Category Breakdown
            </button>
            <button
              onClick={() => setActiveTab("ats")}
              className={`pb-3 px-5 text-sm font-bold transition border-b-2 -mb-px flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "ats"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-450 text-slate-400 hover:text-slate-700"
              }`}
            >
              <span>🤖</span> ATS Parsing Audit
            </button>
          </div>

          {/* Active Tab rendering */}
          <div className="transition-all duration-300">
            {activeTab === "summary" && (
              <Summary
                overallFeedback={analysis.overallFeedback}
                tips={analysis.tips}
                score={analysis.atsScore}
              />
            )}
            {activeTab === "details" && <Details categories={analysis.categories} />}
            {activeTab === "ats" && <ATS categories={analysis.categories} tips={analysis.tips} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
