
import React, { useState } from 'react';
import { UserRole } from './types';
import { MODULES } from './constants';

import { Header } from './components/Header';
import { RoleSelector } from './components/RoleSelector';
import { LearningPath } from './components/LearningPath';
import { ModuleLayout } from './components/ModuleLayout';
import { RiskDetectiveMatching } from './components/RiskDetectiveMatching';
import { ReflectionModule } from './components/ReflectionModule';
import { QuizModule } from './components/QuizModule';
import { CourseSummary } from './components/CourseSummary';

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

  const footer = (
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
  );

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onReset={reset} />
        <RoleSelector onSelect={setRole} />
        {footer}
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header role={role} onReset={reset} />
        <CourseSummary role={role} reflection={userReflection} onFinish={reset} />
        {footer}
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

      {footer}
    </div>
  );
}
