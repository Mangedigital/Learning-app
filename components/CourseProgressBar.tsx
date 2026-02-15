
import React from 'react';

export const CourseProgressBar: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const percentage = Math.round((completed / total) * 100);
  return (
    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6 relative border border-slate-200 shadow-inner">
      <div 
        className="bg-gradient-to-r from-[#004b89] to-blue-500 h-full transition-all duration-700 ease-out flex items-center justify-end px-2"
        style={{ width: `${percentage}%` }}
      >
        {percentage > 10 && <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Klart</span>}
      </div>
    </div>
  );
};
