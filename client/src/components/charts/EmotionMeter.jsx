import React from 'react';

export const EmotionMeter = ({ primaryEmotion, secondaryEmotion }) => {
  return (
    <div className="p-4 bg-white rounded-2xl polo-border polo-shadow space-y-3">
      <h5 className="text-xs font-black uppercase tracking-wider text-black">Emotional State Breakdown</h5>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-red-50 rounded-xl border-2 border-[#9F1239]">
          <span className="text-[10px] font-extrabold uppercase text-[#9F1239] tracking-wider">Primary Emotion</span>
          <p className="text-base font-black text-black mt-1 capitalize">{primaryEmotion || 'Neutral'}</p>
        </div>

        <div className="p-3 bg-neutral-100 rounded-xl border-2 border-neutral-400">
          <span className="text-[10px] font-extrabold uppercase text-neutral-600 tracking-wider">Secondary Emotion</span>
          <p className="text-base font-black text-black mt-1 capitalize">{secondaryEmotion || 'Calm'}</p>
        </div>
      </div>
    </div>
  );
};
