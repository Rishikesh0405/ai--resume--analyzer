import React from "react";
import { SCORE_LEVELS } from "../../constants";

interface ScoreGaugeProps {
  score: number;
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label }) => {
  const level = SCORE_LEVELS.find((l) => score >= l.min && score <= l.max) || SCORE_LEVELS[0];

  const radius = 30;
  const strokeWidth = 5;
  const cx = 40;
  const cy = 40;
  const circumference = 2 * Math.PI * radius; // ~188.5
  const halfCircumference = Math.PI * radius; // ~94.25

  const strokeLength = (score / 100) * halfCircumference;
  const gapLength = circumference - strokeLength;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-12 overflow-hidden flex items-end justify-center">
        <svg className="w-20 h-20 absolute -top-4">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          
          {/* Background Arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke="#e2e8f0" // Light slate gray background track
            strokeWidth={strokeWidth}
            strokeDasharray={`${halfCircumference} ${circumference - halfCircumference}`}
            transform={`rotate(180, ${cx}, ${cy})`}
            strokeLinecap="round"
          />
          {/* Active Arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke="url(#gaugeGradient)" // Modern gradient stroke
            strokeWidth={strokeWidth}
            strokeDasharray={`${strokeLength} ${gapLength}`}
            transform={`rotate(180, ${cx}, ${cy})`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Value Display */}
        <div className="absolute bottom-0 text-center">
          <span className="text-lg font-extrabold text-slate-800 leading-none">
            {score}
          </span>
          <span className="text-[10px] text-slate-400 block leading-none">
            %
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 mt-1.5 text-slate-400">
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreGauge;
