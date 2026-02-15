
import React, { useState, useMemo } from 'react';
import { UserRole } from '../types';
import { QUIZ_QUESTIONS } from '../constants';

export const QuizModule: React.FC<{ role: UserRole; onComplete: () => void }> = ({ role, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

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
