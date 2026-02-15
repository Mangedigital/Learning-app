
import React from 'react';
import { UserRole } from '../types';

export const RoleSelector: React.FC<{ onSelect: (role: UserRole) => void }> = ({ onSelect }) => (
  <div className="min-h-[80vh] flex items-center justify-center px-4 py-6 md:p-6">
    <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-[#004b89] p-5 md:p-8 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Välkommen!</h2>
        <p className="opacity-90 text-sm md:text-base">Välj din roll för att anpassa utbildningen efter ditt uppdrag i Förskoleförvaltningen.</p>
        <div className="mt-3 md:mt-4 inline-block bg-blue-400/20 px-3 py-1 rounded-full text-xs font-bold border border-blue-300/30">
          <i className="fa-solid fa-shield-halved mr-1"></i> Särskilt ansvar för etik & personuppgifter
        </div>
      </div>
      <div className="p-4 md:p-8 space-y-3 md:space-y-4">
        {Object.values(UserRole).map((role) => (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className="w-full flex items-center justify-between p-3 md:p-4 border-2 border-slate-100 rounded-xl hover:border-[#004b89] hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-full flex items-center justify-center text-[#004b89] group-hover:bg-[#004b89] group-hover:text-white transition-colors shrink-0">
                <i className={`fa-solid ${role === UserRole.HR ? 'fa-user-tie' : role === UserRole.DEV_LEAD ? 'fa-arrows-spin' : 'fa-briefcase'}`}></i>
              </div>
              <div className="text-left">
                <span className="font-semibold text-base md:text-lg block">{role}</span>
                <span className="text-xs text-slate-400 font-normal">
                  {role === UserRole.HR ? 'Fokus: Rekrytering av chefer & medarbetare' : role === UserRole.DEV_LEAD ? 'Fokus: Förändringsledning & Kompetensförsörjning' : 'Stöd & Utveckling'}
                </span>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-[#004b89]"></i>
          </button>
        ))}
      </div>
    </div>
  </div>
);
