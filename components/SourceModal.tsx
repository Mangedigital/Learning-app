
import React from 'react';
import { GOLDEN_RULES } from '../constants';

export const SourceModal: React.FC<{ isOpen: boolean; onClose: () => void; clue?: string }> = ({ isOpen, onClose, clue }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#004b89] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-book-bookmark text-xl"></i>
            <h3 className="font-bold text-lg">Regel från policyn</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {clue && (
            <div className="bg-blue-50 border-l-4 border-[#004b89] p-6 rounded-r-xl mb-8">
               <p className="text-lg text-[#004b89] font-medium leading-relaxed italic">
                 "{clue}"
               </p>
            </div>
          )}
          
          <div className="space-y-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Våra gyllene regler (Sammanfattning)</p>
            {GOLDEN_RULES.map((rule) => (
              <div key={rule.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-[#004b89] mb-1">{rule.id}. {rule.title}</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{rule.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <button onClick={onClose} className="w-full bg-[#004b89] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#003d70] transition-all">
            Jag har läst och förstått
          </button>
        </div>
      </div>
    </div>
  );
};
