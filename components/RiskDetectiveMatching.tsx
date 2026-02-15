
import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import { GOLDEN_RULES, MATCHING_SCENARIOS } from '../constants';
import { SourceModal } from './SourceModal';

export const RiskDetectiveMatching: React.FC<{ role: UserRole; onComplete: () => void }> = ({ role, onComplete }) => {
  const roleScenarios = useMemo(() => {
    return MATCHING_SCENARIOS.filter(s => s.role === role);
  }, [role]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isClueOpen, setIsClueOpen] = useState(false);
  const [clueViewed, setClueViewed] = useState(false);
  const [nudgeExpanded, setNudgeExpanded] = useState(false);

  const scenario = roleScenarios[currentIdx];
  const isCorrect = selectedRuleId === scenario?.correctRuleId;

  const handleMatch = (ruleId: number) => {
    if (!clueViewed) {
      alert("Du måste kolla ledtråden i policyn innan du väljer en regel!");
      setIsClueOpen(true);
      return;
    }
    if (showFeedback) return;
    setSelectedRuleId(ruleId);
    setShowFeedback(true);
  };

  const nextScenario = () => {
    if (currentIdx < roleScenarios.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedRuleId(null);
      setShowFeedback(false);
      setClueViewed(false);
      setNudgeExpanded(false);
    } else {
      onComplete();
    }
  };

  const getSocraticHint = (ruleId: number) => {
    if (ruleId === scenario?.correctRuleId) return null;
    const rule = GOLDEN_RULES.find(r => r.id === ruleId);
    if (!rule) return "Försök igen!";
    
    return `Regel ${ruleId} (${rule.title}) är relevant, men det finns en annan regel som är det primära svaret för detta case. Kolla "Läs regeln" igen!`;
  };

  if (!scenario) return (
    <div className="p-12 text-center bg-white rounded-2xl shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Inga scenarier tillgängliga</h3>
      <p className="text-slate-500">Det finns inga specifika case för rollen {role} i denna modul ännu.</p>
      <button onClick={onComplete} className="mt-6 bg-[#004b89] text-white px-8 py-3 rounded-xl font-bold">Hoppa över</button>
    </div>
  );

  const availableRules = scenario.options 
    ? GOLDEN_RULES.filter(r => scenario.options?.includes(r.id))
    : GOLDEN_RULES;

  return (
    <div className="space-y-5 md:space-y-8">
      <SourceModal 
        isOpen={isClueOpen} 
        onClose={() => { setIsClueOpen(false); setClueViewed(true); }} 
        clue={scenario.clue} 
      />
      
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case {currentIdx + 1} / {roleScenarios.length}</span>
      </div>

      <div className="bg-slate-50 p-4 md:p-8 rounded-2xl border-2 border-slate-100 shadow-inner relative group">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#004b89] text-white rounded-full flex items-center justify-center font-bold shrink-0">
            <i className={`fa-solid text-sm md:text-base ${role === UserRole.HR ? 'fa-user-tie' : role === UserRole.DEV_LEAD ? 'fa-arrows-spin' : 'fa-briefcase'}`}></i>
          </div>
          <h3 className="font-bold text-base md:text-lg text-[#004b89]">{role === UserRole.HR ? 'Rekryterings-Case' : role + '-Case'}</h3>
        </div>
        <p className="text-base md:text-xl text-slate-800 font-medium leading-relaxed mb-4 md:mb-6 whitespace-pre-line">
          {scenario.text}
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => { setIsClueOpen(true); setClueViewed(true); }}
            className={`flex items-center gap-2 md:gap-3 font-bold text-xs md:text-sm px-4 md:px-8 py-3 md:py-4 rounded-xl transition-all border-2 shadow-sm active:scale-95 ${
              clueViewed
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse hover:bg-amber-100'
            }`}
          >
            <i className={`fa-solid ${clueViewed ? 'fa-check-circle' : 'fa-book-open'} text-base md:text-lg`}></i>
            {clueViewed ? 'REGEL LÄST - KLAR ATT VÄLJA' : 'LÄS REGELN (OBLIGATORISKT)'}
          </button>
        </div>
      </div>

      {!showFeedback && clueViewed && (
        <div className="bg-blue-50/50 p-3 md:p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs md:text-sm text-[#004b89] font-medium italic text-center">
            <i className="fa-solid fa-info-circle mr-1 md:mr-2"></i>
            Vilken regel hanterar risken i caset bäst?
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        {availableRules.map((rule) => (
          <button
            key={rule.id}
            onClick={() => handleMatch(rule.id)}
            disabled={showFeedback}
            className={`p-3 md:p-4 rounded-xl border-2 text-xs md:text-sm text-left transition-all ${
              showFeedback
                ? rule.id === scenario.correctRuleId
                  ? 'bg-green-500 border-green-500 text-white shadow-md'
                  : selectedRuleId === rule.id ? 'bg-red-500 border-red-500 text-white opacity-50 scale-95' : 'bg-white border-slate-100 opacity-50'
                : !clueViewed ? 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed' : 'border-slate-100 hover:border-[#004b89] hover:bg-blue-50 hover:-translate-y-0.5'
            }`}
          >
            <div className="font-bold mb-0.5 md:mb-1">Regel {rule.id}</div>
            <div className="opacity-90 leading-tight">{rule.title}</div>
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 md:p-8 rounded-2xl border-2 shadow-sm ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-2 mb-3 md:mb-4 border-b border-black/5 pb-2">
              <i className={`fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'} text-xl md:text-2xl`}></i>
              <h4 className="font-black text-lg md:text-xl">{isCorrect ? 'Rätt identifierat!' : 'Inte riktigt.'}</h4>
            </div>

            <div className="mb-4 md:mb-6">
              <p className="text-base md:text-lg leading-relaxed font-medium mb-2">
                {isCorrect ? scenario.explanation : getSocraticHint(selectedRuleId!)}
              </p>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                Källa: Att använda AI i Göteborgs Stad
              </div>
            </div>

            {isCorrect && (
              <div className="space-y-4">
                <div className="bg-white/70 p-3 md:p-5 rounded-xl border border-green-100 shadow-sm">
                   <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-1 md:mb-2">Reflektionsfråga (Sokratisk)</p>
                   <p className="text-base md:text-xl font-bold text-green-900 leading-snug italic">
                     "{scenario.socraticQuestion}"
                   </p>
                </div>
              </div>
            )}

            {scenario.nudge && (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-black/5">
                <button
                  onClick={() => setNudgeExpanded(!nudgeExpanded)}
                  className={`flex items-center gap-2 font-bold text-xs md:text-sm px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition-all border shadow-sm ${
                    nudgeExpanded
                      ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-900'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <i className={`fa-solid ${nudgeExpanded ? 'fa-chevron-up' : 'fa-lightbulb'} ${!nudgeExpanded && 'text-amber-500'}`}></i>
                  {nudgeExpanded ? 'Stäng fördjupning' : scenario.nudge.title}
                </button>

                {nudgeExpanded && (
                  <div className="mt-3 md:mt-4 p-4 md:p-6 bg-white rounded-2xl border-2 border-indigo-100 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg ring-1 ring-indigo-50">
                    <div className="prose prose-sm max-w-none">
                      {scenario.nudge.content.split('\n\n').map((paragraph, pIdx) => (
                        <div key={pIdx} className="mb-3 md:mb-4 last:mb-0">
                          {paragraph.startsWith('Fördjupning:') ? (
                            <p className="text-xs md:text-sm leading-relaxed">
                              <span className="font-bold text-indigo-800 block mb-1 uppercase tracking-tighter text-xs">Fördjupning & Juridisk bakgrund:</span>
                              {paragraph.split(':').slice(1).join(':').trim()}
                            </p>
                          ) : paragraph.startsWith('Kärna:') ? (
                            <div className="mt-3 md:mt-4 bg-indigo-50 p-3 md:p-4 rounded-xl border border-indigo-100 shadow-inner italic text-indigo-900 font-bold flex items-center gap-2 md:gap-3 text-sm md:text-base">
                              <i className="fa-solid fa-star text-amber-400 shrink-0"></i>
                              <span>{paragraph.split(':').slice(1).join(':').trim()}</span>
                            </div>
                          ) : (
                            <p className="text-xs md:text-sm leading-relaxed">{paragraph}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isCorrect ? (
            <button
              onClick={nextScenario}
              className="w-full mt-6 md:mt-8 bg-[#004b89] text-white py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl hover:bg-[#003d70] transition-all shadow-xl hover:-translate-y-1"
            >
              {currentIdx === roleScenarios.length - 1 ? 'Lås upp nästa modul' : 'Nästa utmaning'}
            </button>
          ) : (
            <button
              onClick={() => setShowFeedback(false)}
              className="w-full mt-4 bg-slate-800 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-md"
            >
              Försök igen
            </button>
          )}
        </div>
      )}
    </div>
  );
};
