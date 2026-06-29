import React from "react";
import type { AnalysisCategory } from "../../types";
import { ScoreGauge } from "./ScoreGauge";

interface DetailsProps {
  categories: AnalysisCategory[];
}

export const Details: React.FC<DetailsProps> = ({ categories = [] }) => {
  return (
    <div className="space-y-6">
      {categories.map((category, index) => (
        <div
          key={index}
          className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start transition hover:border-indigo-500/20 duration-300"
        >
          {/* Gauge Widget */}
          <div className="flex-shrink-0 mx-auto md:mx-0 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-center w-28 h-28">
            <ScoreGauge score={category.score} label={category.name.split(" ")[0]} />
          </div>

          {/* Feedback & Improvement Details */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">{category.name}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {category.feedback}
              </p>
            </div>

            {category.improvements && category.improvements.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Actionable Adjustments
                </h5>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.improvements.map((improvement, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50/50 border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition"
                    >
                      <span className="text-indigo-500 font-extrabold select-none">•</span>
                      <span className="leading-relaxed">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Details;
