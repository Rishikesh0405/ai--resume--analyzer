import React from "react";
import { SCORE_LEVELS } from "../../constants";

interface SummaryProps {
  overallFeedback: string;
  tips: string[];
  score: number;
}

export const Summary: React.FC<SummaryProps> = ({ overallFeedback = "No evaluation feedback summary available for this record.", tips = [], score }) => {
  const level = SCORE_LEVELS.find((l) => score >= l.min && score <= l.max) || SCORE_LEVELS[0];

  return (
    <div
      className="bg-white border-l-4 rounded-3xl p-6 space-y-6 shadow-sm transition-all duration-300 border-t border-r border-b border-slate-100"
      style={{ borderLeftColor: level.color }}
    >
      {/* Overall feedback */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🎯 Overall Evaluation
        </h3>
        <p className="text-base text-slate-650 text-slate-600 leading-relaxed font-semibold">
          {overallFeedback}
        </p>
      </div>

      {/* Quick Wins */}
      {tips && tips.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              💡 Top Quick Wins
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              High-priority changes that will immediately boost your resume scoring.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {tips.slice(0, 4).map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-500/20 transition duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-extrabold text-sm border border-indigo-500/20 select-none">
                  {index + 1}
                </div>
                <div className="text-sm text-slate-600 leading-relaxed font-medium pt-0.5">
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
