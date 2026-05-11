
import React, { useState } from 'react';
import { UserRole } from '../types';
import { getReflectionFeedback } from '../services/geminiService';

export const ReflectionModule: React.FC<{
  role: UserRole;
  roleScenarios: Record<UserRole, string>;
  onComplete: (text: string) => void;
}> = ({ role, roleScenarios, onComplete }) => {
  const [reflection, setReflection] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scenario = roleScenarios[role] || roleScenarios[UserRole.MANAGER];

  const handleSubmit = async () => {
    if (!reflection.trim()) return;
    setLoading(true);
    const fb = await getReflectionFeedback(reflection, role);
    setFeedback(fb);
    setLoading(false);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 md:p-6 rounded-r-xl">
        <h3 className="font-bold text-blue-800 mb-1.5 md:mb-2 flex items-center gap-2 text-sm md:text-base">
          <i className="fa-solid fa-comments"></i>
          Ditt coachande scenario
        </h3>
        <p className="text-blue-900 leading-relaxed italic text-sm md:text-lg">"{scenario}"</p>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-semibold text-slate-700 mb-2">Dina tankar utifrån AI-strategin</label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Reflektera kring transparens, ansvar och mänsklig insyn..."
          className="w-full h-32 md:h-40 p-4 border-2 border-slate-100 rounded-xl focus:border-[#004b89] focus:outline-none transition-all resize-none shadow-inner text-sm md:text-base"
        ></textarea>
      </div>

      {!feedback ? (
        <button
          onClick={handleSubmit}
          disabled={loading || !reflection.trim()}
          className="w-full bg-[#004b89] text-white py-3.5 md:py-4 rounded-xl font-bold hover:bg-[#003d70] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 text-sm md:text-base"
        >
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Coachar din reflektion...</>
          ) : (
            'Skicka in för coachning'
          )}
        </button>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#004b89] text-white p-5 md:p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden border border-blue-400">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fa-solid fa-user-tie text-5xl md:text-6xl"></i>
            </div>
            <h4 className="text-[10px] md:text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">AI-mentorns coachning</h4>
            <p className="text-base md:text-lg leading-relaxed relative z-10 font-medium">{feedback}</p>
          </div>
          <button
            onClick={() => onComplete(reflection)}
            className="w-full bg-green-600 text-white py-3.5 md:py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95 text-sm md:text-base"
          >
            Gå vidare till nästa steg
          </button>
        </div>
      )}
    </div>
  );
};
