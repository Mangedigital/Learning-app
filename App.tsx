
import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, CourseModule, MatchingScenario } from './types';
import { MODULES, GOLDEN_RULES, QUIZ_QUESTIONS, ROLE_SCENARIOS, MATCHING_SCENARIOS } from './constants';
import { getReflectionFeedback } from './services/geminiService';

// --- Components ---

const CourseProgressBar: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const percentage = Math.round((completed / total) * 100);
  return (
    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6 relative border border-slate-200 shadow-inner">
      <div 
        className="bg-gradient-to-r from-[#004b89] to-blue-500 h-full transition-all duration-700 ease-out flex items-center justify-end px-2"
        style={{ width: `${percentage}%` }}
      >
        {percentage > 10 && <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Klart</span>}
      </div>
    </div>
  );
};

const Header: React.FC<{ role?: UserRole; onReset: () => void }> = ({ role, onReset }) => (
  <header className="bg-[#004b89] text-white p-4 shadow-md sticky top-0 z-50">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
        <div className="bg-white p-1 rounded">
          <img src="https://picsum.photos/32/32?random=1" alt="Gbg Stad" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none">AI i Vardagen</h1>
          <p className="text-xs opacity-80">Göteborgs Stad - Utbildning</p>
        </div>
      </div>
      {role && (
        <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full border border-white/20">
          <i className="fa-solid fa-user-circle"></i>
          <span>{role}</span>
        </div>
      )}
    </div>
  </header>
);

const RoleSelector: React.FC<{ onSelect: (role: UserRole) => void }> = ({ onSelect }) => (
  <div className="min-h-[80vh] flex items-center justify-center p-6">
    <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-[#004b89] p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">Välkommen!</h2>
        <p className="opacity-90">Välj din roll för att anpassa utbildningen efter ditt uppdrag i Förskoleförvaltningen.</p>
        <div className="mt-4 inline-block bg-blue-400/20 px-3 py-1 rounded-full text-xs font-bold border border-blue-300/30">
          <i className="fa-solid fa-shield-halved mr-1"></i> Särskilt ansvar för etik & personuppgifter
        </div>
      </div>
      <div className="p-8 space-y-4">
        {Object.values(UserRole).map((role) => (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-[#004b89] hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-[#004b89] group-hover:bg-[#004b89] group-hover:text-white transition-colors">
                <i className={`fa-solid ${role === UserRole.HR ? 'fa-user-tie' : role === UserRole.DEV_LEAD ? 'fa-arrows-spin' : 'fa-briefcase'}`}></i>
              </div>
              <div className="text-left">
                <span className="font-semibold text-lg block">{role}</span>
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

const ModuleLayout: React.FC<{ module: CourseModule; completedCount: number; onBack: () => void; children: React.ReactNode }> = ({ module, completedCount, onBack, children }) => (
  <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#004b89] transition-colors font-medium">
        <i className="fa-solid fa-arrow-left"></i>
        Tillbaka till lärstigen
      </button>
      <div className="text-right">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kursframsteg</span>
        <div className="w-48">
          <CourseProgressBar completed={completedCount} total={MODULES.length} />
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase">Nivå {module.metadata.level}</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{module.metadata.category}</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">{module.title}</h2>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <i className="fa-regular fa-clock"></i>
          <span>{module.metadata.durationMinutes} min</span>
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  </div>
);

const SourceModal: React.FC<{ isOpen: boolean; onClose: () => void; clue?: string }> = ({ isOpen, onClose, clue }) => {
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

const RiskDetectiveMatching: React.FC<{ role: UserRole; onComplete: () => void }> = ({ role, onComplete }) => {
  // Respect array order (chronological) by removing the shuffle
  const roleScenarios = useMemo(() => {
    return MATCHING_SCENARIOS
      .filter(s => s.role === role);
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
    <div className="space-y-8">
      <SourceModal 
        isOpen={isClueOpen} 
        onClose={() => { setIsClueOpen(false); setClueViewed(true); }} 
        clue={scenario.clue} 
      />
      
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case {currentIdx + 1} / {roleScenarios.length}</span>
      </div>

      <div className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-100 shadow-inner relative group">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#004b89] text-white rounded-full flex items-center justify-center font-bold">
            <i className={`fa-solid ${role === UserRole.HR ? 'fa-user-tie' : role === UserRole.DEV_LEAD ? 'fa-arrows-spin' : 'fa-briefcase'}`}></i>
          </div>
          <h3 className="font-bold text-lg text-[#004b89]">{role === UserRole.HR ? 'Rekryterings-Case' : role + '-Case'}</h3>
        </div>
        <p className="text-xl text-slate-800 font-medium leading-relaxed mb-6 whitespace-pre-line">
          {scenario.text}
        </p>

        <div className="flex justify-center">
          <button 
            onClick={() => { setIsClueOpen(true); setClueViewed(true); }}
            className={`flex items-center gap-3 font-bold text-sm px-8 py-4 rounded-xl transition-all border-2 shadow-sm active:scale-95 ${
              clueViewed 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse hover:bg-amber-100'
            }`}
          >
            <i className={`fa-solid ${clueViewed ? 'fa-check-circle' : 'fa-book-open'} text-lg`}></i>
            {clueViewed ? 'REGEL LÄST - KLAR ATT VÄLJA' : 'LÄS REGELN I POLICY (OBLIGATORISKT)'}
          </button>
        </div>
      </div>

      {!showFeedback && clueViewed && (
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm text-[#004b89] font-medium italic text-center">
            <i className="fa-solid fa-info-circle mr-2"></i>
            Nu att du har läst policyn: Vilken regel hanterar risken i caset bäst?
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableRules.map((rule) => (
          <button
            key={rule.id}
            onClick={() => handleMatch(rule.id)}
            disabled={showFeedback}
            className={`p-4 rounded-xl border-2 text-sm text-left transition-all ${
              showFeedback 
                ? rule.id === scenario.correctRuleId 
                  ? 'bg-green-500 border-green-500 text-white shadow-md' 
                  : selectedRuleId === rule.id ? 'bg-red-500 border-red-500 text-white opacity-50 scale-95' : 'bg-white border-slate-100 opacity-50'
                : !clueViewed ? 'bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed' : 'border-slate-100 hover:border-[#004b89] hover:bg-blue-50 hover:-translate-y-0.5'
            }`}
          >
            <div className="font-bold mb-1">Regel {rule.id}</div>
            <div className="opacity-90 leading-tight">{rule.title}</div>
          </button>
        ))}
      </div>

      {showFeedback && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <div className={`p-8 rounded-2xl border-2 shadow-sm ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-2 mb-4 border-b border-black/5 pb-2">
              <i className={`fa-solid ${isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'} text-2xl`}></i>
              <h4 className="font-black text-xl">{isCorrect ? 'Rätt identifierat!' : 'Inte riktigt.'}</h4>
            </div>
            
            <div className="mb-6">
              <p className="text-lg leading-relaxed font-medium mb-2">
                {isCorrect ? scenario.explanation : getSocraticHint(selectedRuleId!)}
              </p>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                Källa: Att använda AI i Göteborgs Stad
              </div>
            </div>

            {isCorrect && (
              <div className="space-y-4">
                <div className="bg-white/70 p-5 rounded-xl border border-green-100 shadow-sm">
                   <p className="text-xs font-black text-green-700 uppercase tracking-widest mb-2">Reflektionsfråga (Sokratisk)</p>
                   <p className="text-xl font-bold text-green-900 leading-snug italic">
                     "{scenario.socraticQuestion}"
                   </p>
                </div>
              </div>
            )}

            {scenario.nudge && (
              <div className="mt-4 pt-4 border-t border-black/5">
                <button 
                  onClick={() => setNudgeExpanded(!nudgeExpanded)}
                  className={`flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all border shadow-sm ${
                    nudgeExpanded 
                      ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-900' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <i className={`fa-solid ${nudgeExpanded ? 'fa-chevron-up' : 'fa-lightbulb'} ${!nudgeExpanded && 'text-amber-500'}`}></i>
                  {nudgeExpanded ? 'Stäng fördjupning' : scenario.nudge.title}
                </button>
                
                {nudgeExpanded && (
                  <div className="mt-4 p-6 bg-white rounded-2xl border-2 border-indigo-100 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg ring-1 ring-indigo-50">
                    <div className="prose prose-sm max-w-none">
                      {scenario.nudge.content.split('\n\n').map((paragraph, pIdx) => (
                        <div key={pIdx} className="mb-4 last:mb-0">
                          {paragraph.startsWith('Fördjupning:') ? (
                            <p className="text-sm leading-relaxed">
                              <span className="font-bold text-indigo-800 block mb-1 uppercase tracking-tighter text-xs">Fördjupning & Juridisk bakgrund:</span>
                              {paragraph.split(':').slice(1).join(':').trim()}
                            </p>
                          ) : paragraph.startsWith('Kärna:') ? (
                            <div className="mt-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-inner italic text-indigo-900 font-bold flex items-center gap-3">
                              <i className="fa-solid fa-star text-amber-400"></i>
                              <span>{paragraph.split(':').slice(1).join(':').trim()}</span>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">{paragraph}</p>
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
              className="w-full mt-8 bg-[#004b89] text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#003d70] transition-all shadow-xl hover:-translate-y-1"
            >
              {currentIdx === roleScenarios.length - 1 ? 'Lås upp nästa modul' : 'Nästa utmaning'}
            </button>
          ) : (
            <button
              onClick={() => setShowFeedback(false)}
              className="w-full mt-4 bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-md"
            >
              Försök igen
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ReflectionModule: React.FC<{ role: UserRole; onComplete: (text: string) => void }> = ({ role, onComplete }) => {
  const [reflection, setReflection] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scenario = ROLE_SCENARIOS[role] || ROLE_SCENARIOS[UserRole.MANAGER];

  const handleSubmit = async () => {
    if (!reflection.trim()) return;
    setLoading(true);
    const fb = await getReflectionFeedback(reflection, role);
    setFeedback(fb);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
        <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
          <i className="fa-solid fa-comments"></i>
          Ditt coachande scenario: {role}
        </h3>
        <p className="text-blue-900 leading-relaxed italic">"{scenario}"</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Dina tankar utifrån AI-strategin</label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Reflektera kring transparens, ansvar och mänsklig insyn..."
          className="w-full h-40 p-4 border-2 border-slate-100 rounded-xl focus:border-[#004b89] focus:outline-none transition-all resize-none shadow-inner"
        ></textarea>
      </div>

      {!feedback ? (
        <button
          onClick={handleSubmit}
          disabled={loading || !reflection.trim()}
          className="w-full bg-[#004b89] text-white py-4 rounded-xl font-bold hover:bg-[#003d70] transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5"
        >
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i> Coachar din reflektion...</>
          ) : (
            'Skicka in för coachning'
          )}
        </button>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#004b89] text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden border border-blue-400">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fa-solid fa-user-tie text-6xl"></i>
            </div>
            <h4 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">AI-mentorns coachning</h4>
            <p className="text-lg leading-relaxed relative z-10 font-medium">{feedback}</p>
          </div>
          <button
            onClick={() => onComplete(reflection)}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:-translate-y-0.5"
          >
            Gå vidare till nästa steg
          </button>
        </div>
      )}
    </div>
  );
};

const QuizModule: React.FC<{ role: UserRole; onComplete: () => void }> = ({ role, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  // Filter questions based on role or fallback to general ones
  const filteredQuestions = useMemo(() => {
    const roleSpecific = QUIZ_QUESTIONS.filter(q => q.role === role);
    if (roleSpecific.length > 0) return roleSpecific;
    return QUIZ_QUESTIONS.filter(q => !q.role);
  }, [role]);

  const question = filteredQuestions[currentIdx];

  const handleAnswer = (val: boolean) => {
    if (showExplanation) return;
    setSelected(val);
    setShowExplanation(true);
    if (val === question.answer) setScore(s => s + 1);
  };

  const next = () => {
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      onComplete();
    }
  };

  if (!question) return <div>Laddar...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Utmaning {currentIdx + 1} / {filteredQuestions.length}</span>
        <div className="flex gap-1.5">
          {filteredQuestions.map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full transition-all duration-300 ${i <= currentIdx ? 'bg-[#004b89]' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <div className="text-2xl font-semibold text-slate-800 text-center py-6 px-2 min-h-[120px] flex items-center justify-center">
        {question.question}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswer(true)}
          className={`py-8 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm ${
            showExplanation 
              ? question.answer === true ? 'bg-green-500 border-green-500 text-white scale-105' : selected === true ? 'bg-red-500 border-red-500 text-white opacity-50' : 'bg-white border-slate-100 opacity-50'
              : 'border-slate-100 hover:border-[#004b89] hover:bg-slate-50 hover:-translate-y-1'
          }`}
        >
          SANT
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className={`py-8 rounded-2xl border-2 font-bold text-xl transition-all shadow-sm ${
            showExplanation 
              ? question.answer === false ? 'bg-green-500 border-green-500 text-white scale-105' : selected === false ? 'bg-red-500 border-red-500 text-white opacity-50' : 'bg-white border-slate-100 opacity-50'
              : 'border-slate-100 hover:border-[#004b89] hover:bg-slate-50 hover:-translate-y-1'
          }`}
        >
          FALSKT
        </button>
      </div>

      {showExplanation && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-6 rounded-2xl border-2 shadow-md ${selected === question.answer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <i className={`fa-solid ${selected === question.answer ? 'fa-check-circle' : 'fa-circle-info'} text-xl`}></i>
              <h4 className="font-bold text-lg">{selected === question.answer ? 'Rätt svar!' : 'Tänk på detta:'}</h4>
            </div>
            <p className="leading-relaxed font-medium">{question.explanation}</p>
          </div>
          <button
            onClick={next}
            className="w-full mt-6 bg-[#004b89] text-white py-4 rounded-xl font-bold hover:bg-[#003d70] transition-all shadow-lg hover:-translate-y-0.5"
          >
            {currentIdx === filteredQuestions.length - 1 ? 'Se sammanfattning' : 'Nästa utmaning'}
          </button>
        </div>
      )}
    </div>
  );
};

const LearningPath: React.FC<{ role: UserRole; completedModules: string[]; debugMode: boolean; onSelect: (id: string) => void }> = ({ role, completedModules, debugMode, onSelect }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Lärstig: {role}</h2>
            <p className="text-slate-500">Nivå 1 - Etik, Ansvar & Juridik för Förskoleförvaltningen</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full md:w-auto min-w-[200px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Kursstatus</span>
              <span className="text-sm font-bold text-[#004b89]">{completedModules.length}/{MODULES.length} klara</span>
            </div>
            <CourseProgressBar completed={completedModules.length} total={MODULES.length} />
          </div>
        </div>

        <div className="relative space-y-16">
          <div className="absolute left-10 top-10 bottom-10 w-1 bg-slate-100"></div>
          <div 
            className="absolute left-10 top-10 w-1 bg-[#004b89] transition-all duration-1000"
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
                className={`relative flex items-center gap-8 group transition-all ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => isAvailable && onSelect(mod.id)}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 z-10 shadow-sm transition-all duration-500 ${
                  isCompleted ? 'bg-green-500 border-green-200 text-white scale-110' : 
                  isLocked ? 'bg-slate-100 border-slate-50 text-slate-300' : 
                  isCurrent ? 'bg-white border-[#004b89] text-[#004b89] ring-4 ring-blue-50 scale-105' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? <i className="fa-solid fa-check text-2xl"></i> : <span className="text-2xl font-black">{mod.id}</span>}
                </div>
                
                <div className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-50/30 border-green-100' : 
                  isLocked ? 'bg-slate-50 border-transparent' : 
                  isCurrent ? 'bg-white border-[#004b89] shadow-md -translate-x-1' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                }`}>
                  <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{mod.title}</h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-tighter">{mod.metadata.category}</span>
                      {isCompleted && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-tighter">KLAR</span>}
                      {isCurrent && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-tighter animate-pulse">PÅGÅR</span>}
                      {debugMode && !isCompleted && !isCurrent && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-tighter">UPPLÅST</span>}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{mod.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                      <i className="fa-regular fa-clock"></i> {mod.metadata.durationMinutes} MIN
                    </div>
                    {!isLocked && !isCompleted && <div className="text-[10px] text-[#004b89] font-black uppercase tracking-widest flex items-center gap-1">Starta nu <i className="fa-solid fa-arrow-right text-[8px]"></i></div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 bg-slate-800 text-white rounded-2xl p-8 overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fa-solid fa-folder-open text-9xl"></i>
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <i className="fa-solid fa-book-open text-blue-400"></i>
            Resursbank - Förskoleförvaltningen
          </h3>
          <p className="text-slate-300 mb-6 max-w-lg leading-relaxed">Här hittar du dokument för enheten för kompetens och arbetsmarknad samt förskolenämndens uppdrag.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Policy för Digitalisering & IT', icon: 'fa-file-shield' },
              { title: 'Förskolenämndens riktlinjer', icon: 'fa-landmark' },
              { title: 'Offentlighetsprincipen i praktiken', icon: 'fa-scale-balanced' },
              { title: 'Etisk AI vid rekrytering', icon: 'fa-user-check' }
            ].map((res, i) => (
              <a key={i} href="#" className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/15 rounded-xl transition-all border border-white/5 group">
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${res.icon} text-blue-400 opacity-60`}></i>
                  <span className="text-sm font-medium">{res.title}</span>
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

const CourseSummary: React.FC<{ role: UserRole; reflection: string; onFinish: () => void }> = ({ role, reflection, onFinish }) => (
  <div className="max-w-2xl mx-auto p-6 animate-in zoom-in duration-700">
    <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border-t-8 border-green-500 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-50 rounded-full opacity-50"></div>
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
        <i className="fa-solid fa-award text-5xl"></i>
      </div>
      <h2 className="text-4xl font-black text-slate-800 mb-2">Snyggt jobbat!</h2>
      <p className="text-slate-600 mb-8 font-medium">Du har nu genomfört Nivå 1 i "AI i Vardagen" för {role}.</p>
      
      <div className="text-left bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 shadow-inner">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Dina insikter kring förändring och rekrytering</h4>
        <div className="italic text-slate-700 border-l-4 border-[#004b89] pl-4 py-2 bg-white rounded-r-lg">
          "{reflection || 'Ingen reflektion sparad.'}"
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={onFinish}
          className="w-full bg-[#004b89] text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#003d70] shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <i className="fa-solid fa-file-arrow-down"></i>
          Ladda ner kursintyg
        </button>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Ditt resultat är arkiverat hos Förskoleförvaltningen</p>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [userReflection, setUserReflection] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const activeModule = MODULES.find(m => m.id === activeModuleId);

  const reset = () => {
    setRole(null);
    setActiveModuleId(null);
    setCompletedModules([]);
    setUserReflection('');
    setIsFinished(false);
  };

  const handleModuleComplete = (reflectionData?: string) => {
    if (activeModuleId) {
      if (!completedModules.includes(activeModuleId)) {
        setCompletedModules(prev => [...prev, activeModuleId]);
      }
      if (reflectionData) {
        setUserReflection(reflectionData);
      }
      setActiveModuleId(null);

      // Check if this was the last module
      const isLastModule = MODULES.findIndex(m => m.id === activeModuleId) === MODULES.length - 1;
      if (isLastModule) {
        setIsFinished(true);
      }
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onReset={reset} />
        <RoleSelector onSelect={setRole} />
        <footer className="p-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-12 bg-white">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
            <p className="font-medium">© {new Date().getFullYear()} Göteborgs Stad. Utbildningsprototyp för HR-avdelningen.</p>
            <button 
              onClick={() => setDebugMode(!debugMode)} 
              className={`text-[10px] transition-all px-2 py-0.5 rounded ${debugMode ? 'bg-amber-100 text-amber-600 font-bold' : 'opacity-20 hover:opacity-100'}`}
            >
              <i className="fa-solid fa-gear mr-1"></i> {debugMode ? 'Testläge AKTIVT' : 'Testläge'}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header role={role} onReset={reset} />
        <CourseSummary role={role} reflection={userReflection} onFinish={reset} />
        <footer className="p-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-12 bg-white">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
            <p className="font-medium">© {new Date().getFullYear()} Göteborgs Stad. Utbildningsprototyp för HR-avdelningen.</p>
            <button 
              onClick={() => setDebugMode(!debugMode)} 
              className={`text-[10px] transition-all px-2 py-0.5 rounded ${debugMode ? 'bg-amber-100 text-amber-600 font-bold' : 'opacity-20 hover:opacity-100'}`}
            >
              <i className="fa-solid fa-gear mr-1"></i> {debugMode ? 'Testläge AKTIVT' : 'Testläge'}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header role={role} onReset={reset} />
      
      <main className="flex-1">
        {!activeModuleId ? (
          <LearningPath 
            role={role} 
            completedModules={completedModules} 
            debugMode={debugMode}
            onSelect={setActiveModuleId} 
          />
        ) : (
          <ModuleLayout 
            module={activeModule!} 
            completedCount={completedModules.length}
            onBack={() => setActiveModuleId(null)}
          >
            {activeModule?.type === 'matching' && (
              <RiskDetectiveMatching role={role} onComplete={() => handleModuleComplete()} />
            )}
            {activeModule?.type === 'reflection' && (
              <ReflectionModule role={role} onComplete={handleModuleComplete} />
            )}
            {activeModule?.type === 'quiz' && (
              <QuizModule role={role} onComplete={() => handleModuleComplete()} />
            )}
          </ModuleLayout>
        )}
      </main>

      <footer className="p-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-12 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <p className="font-medium">© {new Date().getFullYear()} Göteborgs Stad. Utbildningsprototyp för HR-avdelningen.</p>
          <button 
            onClick={() => setDebugMode(!debugMode)} 
            className={`text-[10px] transition-all px-2 py-0.5 rounded ${debugMode ? 'bg-amber-100 text-amber-600 font-bold' : 'opacity-20 hover:opacity-100'}`}
          >
            <i className="fa-solid fa-gear mr-1"></i> {debugMode ? 'Testläge AKTIVT' : 'Testläge'}
          </button>
        </div>
      </footer>
    </div>
  );
}
