
import React from 'react';
import { GOLDEN_RULES } from '../constants';

export const SourceModal: React.FC<{ isOpen: boolean; onClose: () => void; clue?: string }> = ({ isOpen, onClose, clue }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-t-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-[90vh]">
        <div className="bg-[#004b89] p-4 md:p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <i className="fa-solid fa-book-bookmark text-lg md:text-xl"></i>
            <h3 className="font-bold text-base md:text-lg">Regel från policyn</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <i className="fa-solid fa-xmark text-lg md:text-xl"></i>
          </button>
        </div>
        <div className="p-4 md:p-8 overflow-y-auto flex-1 -webkit-overflow-scrolling-touch">
          {clue && (
            <div className="bg-blue-50 border-l-4 border-[#004b89] p-4 md:p-6 rounded-r-xl mb-5 md:mb-8">
               <p className="text-base md:text-lg text-[#004b89] font-medium leading-relaxed italic">
                 "{clue}"
               </p>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Våra gyllene regler (Sammanfattning)</p>
            {GOLDEN_RULES.map((rule) => (
              <div key={rule.id} className="p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-[#004b89] mb-0.5 md:mb-1 text-sm md:text-base">{rule.id}. {rule.title}</h4>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed">{rule.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 text-center">
          <button onClick={onClose} className="w-full bg-[#004b89] text-white py-3 md:py-4 rounded-xl font-bold shadow-lg hover:bg-[#003d70] transition-all">
            Jag har läst och förstått
          </button>
        </div>
      </div>
    </div>
  );
};
