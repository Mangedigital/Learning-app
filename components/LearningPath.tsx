
import React from 'react';
import { UserRole } from '../types';
import { MODULES } from '../constants';
import { CourseProgressBar } from './CourseProgressBar';

export const LearningPath: React.FC<{ 
  role: UserRole; 
  completedModules: string[]; 
  debugMode: boolean; 
  onSelect: (id: string) => void 
}> = ({ role, completedModules, debugMode, onSelect }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:p-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Lärstig: {role}</h2>
            <p className="text-sm md:text-base text-slate-500">Nivå 1 - Etik, Ansvar & Juridik för Förskoleförvaltningen</p>
          </div>
          <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 w-full md:w-auto min-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Kursstatus</span>
              <span className="text-sm font-bold text-[#004b89]">{completedModules.length}/{MODULES.length} klara</span>
            </div>
            <CourseProgressBar completed={completedModules.length} total={MODULES.length} />
          </div>
        </div>

        <div className="relative space-y-8 md:space-y-16">
          <div className="absolute left-5 md:left-10 top-6 md:top-10 bottom-6 md:bottom-10 w-0.5 md:w-1 bg-slate-100"></div>
          <div
            className="absolute left-5 md:left-10 top-6 md:top-10 w-0.5 md:w-1 bg-[#004b89] transition-all duration-1000"
            style={{ height: `${(completedModules.length / (MODULES.length - 1)) * 100}%` }}
          ></div>

          {MODULES.map((mod, index) => {
            const isCompleted = completedModules.includes(mod.id);
            const isAvailable = debugMode || completedModules.length >= index;
            const isLocked = !isAvailable;
            const isCurrent = completedModules.length === index;

            return (
              <div
                key={mod.id}
                className={`relative flex items-start md:items-center gap-3 md:gap-8 group transition-all ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => isAvailable && onSelect(mod.id)}
              >
                <div className={`w-10 h-10 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 md:border-4 z-10 shadow-sm transition-all duration-500 shrink-0 mt-1 md:mt-0 ${
                  isCompleted ? 'bg-green-500 border-green-200 text-white md:scale-110' :
                  isLocked ? 'bg-slate-100 border-slate-50 text-slate-300' :
                  isCurrent ? 'bg-white border-[#004b89] text-[#004b89] ring-2 md:ring-4 ring-blue-50 md:scale-105' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? <i className="fa-solid fa-check text-sm md:text-2xl"></i> : <span className="text-sm md:text-2xl font-black">{mod.id}</span>}
                </div>

                <div className={`flex-1 min-w-0 p-3 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-50/30 border-green-100' :
                  isLocked ? 'bg-slate-50 border-transparent' :
                  isCurrent ? 'bg-white border-[#004b89] shadow-md' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}>
                  <div className="flex flex-wrap justify-between items-start mb-1 md:mb-2 gap-1 md:gap-2">
                    <h3 className="text-base md:text-xl font-bold text-slate-800">{mod.title}</h3>
                    <div className="flex gap-1 md:gap-2 flex-wrap">
                      <span className="text-[9px] md:text-[10px] bg-slate-100 px-1.5 md:px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-tighter">{mod.metadata.category}</span>
                      {isCompleted && <span className="text-[9px] md:text-[10px] bg-green-500 text-white px-1.5 md:px-2 py-0.5 rounded font-bold uppercase tracking-tighter">KLAR</span>}
                      {isCurrent && <span className="text-[9px] md:text-[10px] bg-blue-500 text-white px-1.5 md:px-2 py-0.5 rounded font-bold uppercase tracking-tighter animate-pulse">PÅGÅR</span>}
                      {debugMode && !isCompleted && !isCurrent && <span className="text-[9px] md:text-[10px] bg-amber-500 text-white px-1.5 md:px-2 py-0.5 rounded font-bold uppercase tracking-tighter">UPPLÅST</span>}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{mod.description}</p>
                  <div className="mt-2 md:mt-4 flex items-center gap-3 md:gap-4">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                      <i className="fa-regular fa-clock"></i> {mod.metadata.durationMinutes} MIN
                    </div>
                    {!isLocked && !isCompleted && <div className="text-[10px] text-[#004b89] font-black uppercase tracking-widest flex items-center gap-1">Starta <i className="fa-solid fa-arrow-right text-[8px]"></i></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 md:mt-12 bg-slate-800 text-white rounded-2xl p-5 md:p-8 overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
          <i className="fa-solid fa-folder-open text-9xl"></i>
        </div>
        <div className="relative z-10">
          <h3 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <i className="fa-solid fa-book-open text-blue-400"></i>
            Resursbank
          </h3>
          <p className="text-slate-300 mb-4 md:mb-6 max-w-lg leading-relaxed text-sm md:text-base">Här hittar du dokument för enheten för kompetens och arbetsmarknad samt förskolenämndens uppdrag.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {[
              { title: 'Policy för Digitalisering & IT', icon: 'fa-file-shield' },
              { title: 'Förskolenämndens riktlinjer', icon: 'fa-landmark' },
              { title: 'Offentlighetsprincipen i praktiken', icon: 'fa-scale-balanced' },
              { title: 'Etisk AI vid rekrytering', icon: 'fa-user-check' }
            ].map((res, i) => (
              <a key={i} href="#" className="flex items-center justify-between p-3 md:p-4 bg-white/10 hover:bg-white/15 rounded-xl transition-all border border-white/5 group">
                <div className="flex items-center gap-2 md:gap-3">
                  <i className={`fa-solid ${res.icon} text-blue-400 opacity-60`}></i>
                  <span className="text-xs md:text-sm font-medium">{res.title}</span>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px] opacity-0 group-hover:opacity-50 transition-all translate-x-2 group-hover:translate-x-0"></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
