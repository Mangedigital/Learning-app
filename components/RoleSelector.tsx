
import React from 'react';
import { CourseRole } from '../types';

export const RoleSelector: React.FC<{ roles: CourseRole[]; onSelect: (role: CourseRole) => void }> = ({ roles, onSelect }) => (
  <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-6">
    <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-[#004b89] p-6 md:p-8 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Välkommen!</h2>
        <p className="text-sm md:text-base opacity-90">Välj din roll för att anpassa utbildningen efter källmaterialet och ditt uppdrag.</p>
        <div className="mt-4 inline-block bg-blue-400/20 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border border-blue-300/30">
          <i className="fa-solid fa-shield-halved mr-1"></i> Tre källspecifika lärstigar
        </div>
      </div>
      <div className="p-5 md:p-8 space-y-3 md:space-y-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelect(role)}
            className="w-full flex items-center justify-between p-3 md:p-4 border-2 border-slate-100 rounded-xl hover:border-[#004b89] hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-full flex items-center justify-center text-[#004b89] group-hover:bg-[#004b89] group-hover:text-white transition-colors">
                <i className={`fa-solid ${role.icon || 'fa-user-circle'}`}></i>
              </div>
              <div className="text-left">
                <span className="font-semibold text-base md:text-lg block">{role.title}</span>
                <span className="text-[10px] md:text-xs text-slate-400 font-normal">
                  Fokus: {role.focus}
                </span>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-[#004b89] hidden xs:block"></i>
          </button>
        ))}
      </div>
    </div>
  </div>
);
