import React from "react";
import type { AnalysisCategory } from "../../types";
import { ScoreGauge } from "./ScoreGauge";

interface ATSProps {
  categories: AnalysisCategory[];
  tips: string[];
}

export const ATS: React.FC<ATSProps> = ({ categories = [], tips = [] }) => {
  const atsCategory = categories.find((c) => c.name === "ATS Compatibility") || 
                      categories.find((c) => c.name.toLowerCase().includes("ats"));

  const allImprovements = categories.flatMap((c) => c.improvements.map(i => i.toLowerCase()));

  const auditItems = [
    {
      name: "Standard Section Headings",
      desc: "Uses recognized headers like 'Experience' and 'Education' for clean parsing.",
      checkKey: ["heading", "header", "section name", "standard"]
    },
    {
      name: "Layout & Formatting Compliance",
      desc: "Avoids complex tables, columns, text boxes, or graphics that confuse parsers.",
      checkKey: ["table", "column", "graphics", "text box", "layout", "format"]
    },
    {
      name: "Quantified Metrics",
      desc: "Includes percentages, numbers, or dollar values to measure performance.",
      checkKey: ["quantify", "metric", "number", "percentage", "statistics"]
    },
    {
      name: "Action-Oriented Verbs",
      desc: "Starts descriptions with strong active verbs instead of passive phrases.",
      checkKey: ["action verb", "passive", "weak verb", "responsibilities included"]
    },
    {
      name: "Job-specific Technical Keywords",
      desc: "Contains technical skills and terminology extracted directly from the job description.",
      checkKey: ["keyword", "skill alignment", "missing skill", "technologies"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* ATS Score & Overview */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="space-y-2 flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-800">ATS Parsing Evaluation</h3>
          <p className="text-sm text-slate-650 text-slate-500 leading-relaxed">
            {atsCategory
              ? atsCategory.feedback
              : "Detailed analysis of formatting, layout structure, and keyword compatibility for standard parser systems."}
          </p>
        </div>
        {atsCategory && (
          <div className="flex-shrink-0 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-center">
            <ScoreGauge score={atsCategory.score} label="ATS Score" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parsing Audit Checklist */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-4">
          <h4 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            ATS Compatibility Audit
          </h4>
          <div className="space-y-4">
            {auditItems.map((item, index) => {
              const hasIssue = item.checkKey.some((key) =>
                allImprovements.some((imp) => imp.includes(key))
              );

              return (
                <div key={index} className="flex items-start gap-3">
                  <span className={`text-lg mt-0.5 select-none ${hasIssue ? "text-amber-500" : "text-emerald-500"}`}>
                    {hasIssue ? "⚠️" : "✓"}
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {item.name}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        hasIssue ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {hasIssue ? "Needs Work" : "Passed"}
                      </span>
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ATS-specific Quick Tips */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 space-y-4">
          <h4 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            ATS Optimization Advice
          </h4>
          <ul className="space-y-3">
            {tips.slice(0, 5).map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-650 text-slate-500 leading-relaxed">
                <span className="text-indigo-600 font-extrabold text-sm mt-0.5 flex-shrink-0">{idx + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ATS;
