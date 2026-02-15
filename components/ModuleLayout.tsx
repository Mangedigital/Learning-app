
import React from 'react';
import { CourseModule } from '../types';
import { CourseProgressBar } from './CourseProgressBar';
import { MODULES } from '../constants';

export const ModuleLayout: React.FC<{ 
  module: CourseModule; 
  completedCount: number; 
  onBack: () => void; 
  children: React.ReactNode 
}> = ({ module, completedCount, onBack, children }) => (
  <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#004b89] transition-colors font-medium text-sm md:text-base">
        <i className="fa-solid fa-arrow-left"></i>
        Tillbaka till lärstigen
      </button>
      <div className="text-left md:text-right flex items-center md:block gap-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Kursframsteg</span>
        <div className="w-32 md:w-48">
          <CourseProgressBar completed={completedCount} total={MODULES.length} />
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Nivå {module.metadata.level}</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{module.metadata.category}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{module.title}</h2>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
          <i className="fa-regular fa-clock"></i>
          <span>{module.metadata.durationMinutes} min</span>
        </div>
      </div>
      <div className="p-5 md:p-8">
        {children}
      </div>
    </div>
  </div>
);
