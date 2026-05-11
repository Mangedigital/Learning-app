
import React from 'react';
import { CourseModule, ResourceLink, UserRole } from '../types';
import { CourseProgressBar } from './CourseProgressBar';

export const LearningPath: React.FC<{ 
  courseTitle: string;
  role: UserRole; 
  modules: CourseModule[];
  resources: ResourceLink[];
  completedModules: string[]; 
  debugMode: boolean; 
  onSelect: (id: string) => void 
}> = ({ courseTitle, role, modules, resources, completedModules, debugMode, onSelect }) => {
  const progressDenominator = Math.max(modules.length - 1, 1);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Lärstig: {role}</h2>
            <p className="text-sm text-slate-500">{courseTitle}</p>
          </div>
          <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 w-full md:w-auto min-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kursstatus</span>
              <span className="text-xs font-bold text-[#004b89]">{completedModules.length}/{modules.length} klara</span>
            </div>
            <CourseProgressBar completed={completedModules.length} total={modules.length} />
          </div>
        </div>

        <div className="relative space-y-8 md:space-y-16">
          {/* Responsive positioning for the vertical line */}
          <div className="absolute left-6 md:left-10 top-10 bottom-10 w-1 bg-slate-100"></div>
          <div 
            className="absolute left-6 md:left-10 top-10 w-1 bg-[#004b89] transition-all duration-1000"
            style={{ height: `${(completedModules.length / progressDenominator) * 100}%` }}
          ></div>

          {modules.map((mod, index) => {
            const isCompleted = completedModules.includes(mod.id);
            const isAvailable = debugMode || completedModules.length >= index;
            const isLocked = !isAvailable;
            const isCurrent = completedModules.length === index;

            return (
              <div 
                key={mod.id}
                className={`relative flex items-center gap-4 md:gap-8 group transition-all ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => isAvailable && onSelect(mod.id)}
              >
                {/* Responsive circle sizes */}
                <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 md:border-4 z-10 shadow-sm transition-all duration-500 flex-shrink-0 ${
                  isCompleted ? 'bg-green-500 border-green-200 text-white scale-110' : 
                  isLocked ? 'bg-slate-100 border-slate-50 text-slate-300' : 
                  isCurrent ? 'bg-white border-[#004b89] text-[#004b89] ring-2 md:ring-4 ring-blue-50 scale-105' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? <i className="fa-solid fa-check text-lg md:text-2xl"></i> : <span className="text-lg md:text-2xl font-black">{mod.id}</span>}
                </div>
                
                <div className={`flex-1 p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-50/30 border-green-100' : 
                  isLocked ? 'bg-slate-50 border-transparent' : 
                  isCurrent ? 'bg-white border-[#004b89] shadow-md -translate-x-1' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}>
                  <div className="flex flex-wrap justify-between items-start mb-1 gap-2">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">{mod.title}</h3>
                    <div className="flex gap-1.5">
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-tighter">{mod.metadata.category}</span>
                      {isCompleted && <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">KLAR</span>}
                      {isCurrent && <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter animate-pulse">PÅGÅR</span>}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{mod.description}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                      <i className="fa-regular fa-clock"></i> {mod.metadata.durationMinutes} MIN
                    </div>
                    {!isLocked && !isCompleted && <div className="text-[9px] text-[#004b89] font-black uppercase tracking-widest flex items-center gap-1">Starta nu <i className="fa-solid fa-arrow-right text-[8px]"></i></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 md:mt-12 bg-slate-800 text-white rounded-2xl p-6 md:p-8 overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fa-solid fa-folder-open text-7xl md:text-9xl"></i>
        </div>
        <div className="relative z-10">
          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-book-open text-blue-400"></i>
            Resursbank
          </h3>
          <div className="grid grid-cols-1 gap-2 md:gap-3">
            {resources.map((res) => (
              <a
                key={res.href}
                href={res.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 md:p-4 bg-white/10 hover:bg-white/15 rounded-xl transition-all border border-white/5 group"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file-pdf text-blue-400 opacity-80"></i>
                  <span className="text-xs md:text-sm font-medium">{res.title}</span>
                </div>
                <span className="flex items-center gap-2 text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                  {res.format}
                  <i className="fa-solid fa-arrow-up-right-from-square opacity-70"></i>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
