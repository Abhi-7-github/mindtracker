import React from 'react';
import { cn } from '../../utils/cn';

export const ScoreGauge = ({ title, score = 0, max = 100, subtitle }) => {
  const normalized = Math.min(Math.max(score, 0), max);
  const percentage = (normalized / max) * 100;

  const getColor = (val) => {
    if (val >= 75) return 'bg-emerald-500 border-emerald-600 text-emerald-900';
    if (val >= 50) return 'bg-amber-400 border-amber-500 text-amber-900';
    return 'bg-[#9F1239] border-red-800 text-white';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl polo-border polo-shadow text-center">
      <h5 className="text-xs font-black uppercase tracking-wider text-neutral-700">{title}</h5>

      {/* Circle Gauge Container */}
      <div className="relative w-24 h-24 my-3 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-neutral-200"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-[#9F1239] transition-all duration-700 ease-out"
            strokeDasharray={`${percentage}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-xl font-black text-black">{normalized}</span>
      </div>

      {subtitle && <p className="text-[11px] font-bold text-neutral-500">{subtitle}</p>}
    </div>
  );
};
