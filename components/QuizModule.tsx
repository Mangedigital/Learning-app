
import React, { useState, useMemo } from 'react';
import { CourseRole, QuizQuestion } from '../types';

export const QuizModule: React.FC<{ role: CourseRole; questions: QuizQuestion[]; onComplete: () => void }> = ({ role, questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => q.roleId === role.id);
  }, [role, questions]);

  const question = filteredQuestions[currentIdx];
  const ruleLabel = question ? `Regel ${question.ruleIds.join(' och ')}` : '';

  const handleAnswer = (val: boolean) => {
    if (showExplanation) return;
    setSelected(val);
    setShowExplanation(true);
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

  if (!question) {
    return (
      <div className="p-8 md:p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Inga quizfrågor tillgängliga</h3>
        <p className="text-sm text-slate-500">Det finns inga rollanpassade quizfrågor för {role.title} ännu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Utmaning {currentIdx + 1} / {filteredQuestions.length}</span>
        <div className="flex gap-1 md:gap-1.5">
          {filteredQuestions.map((_, i) => (
            <div key={i} className={`h-1.5 md:h-2 w-6 md:w-8 rounded-full transition-all duration-300 ${i <= currentIdx ? 'bg-[#004b89]' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <div className="text-xl md:text-2xl font-semibold text-slate-800 text-center py-4 md:py-6 px-2 min-h-[100px] md:min-h-[120px] flex items-center justify-center leading-snug">
        {question.question}
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <button
          onClick={() => handleAnswer(true)}
          className={`py-6 md:py-8 rounded-2xl border-2 font-bold text-lg md:text-xl transition-all shadow-sm active:scale-95 ${
            showExplanation 
              ? question.answer === true ? 'bg-green-500 border-green-500 text-white scale-105' : selected === true ? 'bg-red-500 border-red-500 text-white opacity-50' : 'bg-white border-slate-100 opacity-50'
              : 'border-slate-100 hover:border-[#004b89] hover:bg-slate-50'
          }`}
        >
          SANT
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className={`py-6 md:py-8 rounded-2xl border-2 font-bold text-lg md:text-xl transition-all shadow-sm active:scale-95 ${
            showExplanation 
              ? question.answer === false ? 'bg-green-500 border-green-500 text-white scale-105' : selected === false ? 'bg-red-500 border-red-500 text-white opacity-50' : 'bg-white border-slate-100 opacity-50'
              : 'border-slate-100 hover:border-[#004b89] hover:bg-slate-50'
          }`}
        >
          FALSKT
        </button>
      </div>

      {showExplanation && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 md:p-6 rounded-2xl border-2 shadow-md ${selected === question.answer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <i className={`fa-solid ${selected === question.answer ? 'fa-check-circle' : 'fa-circle-info'} text-lg md:text-xl`}></i>
              <h4 className="font-bold text-base md:text-lg">{selected === question.answer ? 'Rätt svar!' : 'Tänk på detta:'}</h4>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">
              Kopplat till {ruleLabel}
            </div>
            <p className="leading-relaxed font-medium text-sm md:text-base">{question.explanation}</p>
          </div>
          <button
            onClick={next}
            className="w-full mt-5 md:mt-6 bg-[#004b89] text-white py-3.5 md:py-4 rounded-xl font-bold hover:bg-[#003d70] transition-all shadow-lg active:scale-95 text-sm md:text-base"
          >
            {currentIdx === filteredQuestions.length - 1 ? 'Se sammanfattning' : 'Nästa utmaning'}
          </button>
        </div>
      )}
    </div>
  );
};
