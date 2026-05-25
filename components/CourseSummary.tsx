
import React from 'react';
import { CourseRole } from '../types';

export const CourseSummary: React.FC<{ role: CourseRole; reflection: string; onFinish: () => void }> = ({ role, reflection, onFinish }) => (
  <div className="max-w-2xl mx-auto p-4 md:p-6 animate-in zoom-in duration-700">
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 text-center border-t-8 border-green-500 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-50 rounded-full opacity-50"></div>
      <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6 shadow-sm border-4 border-white">
        <i className="fa-solid fa-award text-4xl md:text-5xl"></i>
      </div>
      <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">Snyggt jobbat!</h2>
      <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 font-medium">Du har nu genomfört Nivå 1 för {role.title}.</p>
      
      <div className="text-left bg-slate-50 p-4 md:p-6 rounded-2xl mb-6 md:mb-8 border border-slate-100 shadow-inner">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dina insikter kring AI-etik</h4>
        <div className="italic text-slate-700 border-l-4 border-[#004b89] pl-4 py-2 bg-white rounded-r-lg text-sm md:text-base">
          "{reflection || 'Ingen reflektion sparad.'}"
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <button 
          onClick={onFinish}
          className="w-full bg-[#004b89] text-white py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl hover:bg-[#003d70] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <i className="fa-solid fa-file-arrow-down"></i>
          Ladda ner kursintyg
        </button>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ditt resultat är arkiverat hos Förskoleförvaltningen</p>
      </div>
    </div>
  </div>
);
