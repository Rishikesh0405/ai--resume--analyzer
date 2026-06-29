import React, { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ score }) => {
  const safeScore = typeof score === "number" && !isNaN(score) ? score : 0;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress);
      setDisplayScore(Math.floor(easeProgress * safeScore));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [safeScore]);

  const radius = 70;
  const strokeWidth = 8; // Thinner stroke for elegant look
  const cx = 96;
  const cy = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Background Soft Glow */}
      <div 
        className="absolute inset-4 rounded-full blur-2xl opacity-10 bg-gradient-to-r from-purple-500 to-indigo-500 pointer-events-none"
      />
      
      {/* SVG Circle */}
      <svg className="w-full h-full transform -rotate-90 select-none">
        <defs>
          <linearGradient id="circleScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" /> {/* Purple-400 */}
            <stop offset="100%" stopColor="#6366f1" /> {/* Indigo-500 */}
          </linearGradient>
        </defs>
        
        {/* Track circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9" // Soft slate gray track
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke="url(#circleScoreGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Score Text Overlay */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900 select-none">
            {displayScore}
          </span>
          <span className="text-lg font-bold text-slate-400 select-none">/100</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
          ATS Rating
        </span>
      </div>
    </div>
  );
};

export default ScoreCircle;
