import React from "react";
import { Link } from "react-router";
import type { ResumeAnalysis } from "../../types";
import { formatDate } from "../lib/utils";

interface ResumeCardProps {
  analysis: ResumeAnalysis;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ analysis, onDelete }) => {
  const smallRadius = 16;
  const smallCircumference = 2 * Math.PI * smallRadius; // ~100.5
  const score = typeof analysis.atsScore === "number" ? analysis.atsScore : 0;
  const smallOffset = smallCircumference - (score / 100) * smallCircumference;

  // Determine indicator color based on score range
  let scoreColor = "#ef4444"; // red
  if (score >= 90) scoreColor = "#10b981"; // emerald
  else if (score >= 75) scoreColor = "#3b82f6"; // blue
  else if (score >= 60) scoreColor = "#eab308"; // yellow
  else if (score >= 40) scoreColor = "#f59e0b"; // orange

  return (
    <div className="group bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 transition-all duration-300 flex flex-col justify-between h-full">
      <Link to={`/resume/${analysis.id}`} className="block flex-1">
        {/* Card Header: Title/Company + Tiny Progress Circle */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-tight capitalize truncate">
              {analysis.companyName || "Not Specified"}
            </h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider truncate">
              {analysis.jobTitle}
            </p>
          </div>

          {/* Tiny Circular Progress Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={smallRadius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="2.5"
              />
              <circle
                cx="24"
                cy="24"
                r={smallRadius}
                fill="transparent"
                stroke={scoreColor}
                strokeWidth="2.5"
                strokeDasharray={smallCircumference}
                strokeDashoffset={smallOffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute text-[9px] font-extrabold text-slate-700 flex items-baseline">
              <span>{typeof analysis.atsScore === "number" ? analysis.atsScore : "-"}</span>
              <span className="text-[7px] text-slate-400">/100</span>
            </div>
          </div>
        </div>

        {/* Card Body: Resume Image Preview or Skeleton Document */}
        {analysis.resumeBase64Image ? (
          <div className="mt-5 bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden aspect-[4/5] flex items-start justify-center p-1.5 relative group-hover:border-indigo-500/10 transition">
            <img
              src={`data:image/png;base64,${analysis.resumeBase64Image}`}
              alt="Resume Page Preview"
              className="w-full h-full object-cover object-top rounded-xl shadow-sm"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden aspect-[4/5] p-5 flex flex-col gap-3 relative group-hover:bg-slate-100/50 transition">
            {/* Skeleton document illustration */}
            <div className="w-1/3 h-3 bg-slate-200 rounded" />
            <div className="w-1/2 h-2 bg-slate-250 bg-slate-100 rounded" />
            <div className="space-y-2 mt-4">
              <div className="w-full h-2 bg-slate-200/60 rounded" />
              <div className="w-full h-2 bg-slate-200/60 rounded" />
              <div className="w-4/5 h-2 bg-slate-200/60 rounded" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="w-5/6 h-2 bg-slate-200/60 rounded" />
              <div className="w-2/3 h-2 bg-slate-200/60 rounded" />
            </div>
          </div>
        )}
      </Link>

      {/* Card Footer: Metadata Date + Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-5 text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono">
        <span>{formatDate(analysis.createdAt)}</span>
        <button
          type="button"
          onClick={(e) => onDelete(analysis.id, e)}
          className="text-red-500 hover:text-red-700 hover:underline font-bold transition cursor-pointer"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;
