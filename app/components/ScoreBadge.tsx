import React from "react";
import { SCORE_LEVELS } from "../../constants";

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  const level = SCORE_LEVELS.find((l) => score >= l.min && score <= l.max) || SCORE_LEVELS[0];
  const textClass = level.text.replace("-400", "-600");

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${level.bg} ${textClass} border border-current/10`}
    >
      {level.label}
    </span>
  );
};
export default ScoreBadge;
