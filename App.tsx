
import React, { useState, useEffect } from 'react';
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
import { Footer } from './components/Footer';

const STORAGE_KEY = 'ai_i_vardagen_progress';

export default function App() {
  // Initialize state from localStorage if available
  const [role, setRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_role`);
    return saved ? (saved as UserRole) : null;
  });
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_activeModuleId`);
  });
  
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_completed`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [userReflection, setUserReflection] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY}_reflection`) || '';
  });
  
  const [isFinished, setIsFinished] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY}_isFinished`) === 'true';
  });
  
  const [debugMode, setDebugMode] = useState(false);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (role) localStorage.setItem(`${STORAGE_KEY}_role`, role);
    else localStorage.removeItem(`${STORAGE_KEY}_role`);
  }, [role]);

  useEffect(() => {
    if (activeModuleId) localStorage.setItem(`${STORAGE_KEY}_activeModuleId`, activeModuleId);
    else localStorage.removeItem(`${STORAGE_KEY}_activeModuleId`);
  }, [activeModuleId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_completed`, JSON.stringify(completedModules));
  }, [completedModules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reflection`, userReflection);
  }, [userReflection]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_isFinished`, String(isFinished));
  }, [isFinished]);

  const activeModule = MODULES.find(m => m.id === activeModuleId);

  const reset = () => {
    setRole(null);
    setActiveModuleId(null);
    setCompletedModules([]);
    setUserReflection('');
    setIsFinished(false);
    // Clear localStorage
    localStorage.removeItem(`${STORAGE_KEY}_role`);
    localStorage.removeItem(`${STORAGE_KEY}_activeModuleId`);
    localStorage.removeItem(`${STORAGE_KEY}_completed`);
    localStorage.removeItem(`${STORAGE_KEY}_reflection`);
    localStorage.removeItem(`${STORAGE_KEY}_isFinished`);
  };

  const handleModuleComplete = (reflectionData?: string) => {
    if (activeModuleId) {
      const newCompleted = completedModules.includes(activeModuleId) 
        ? completedModules 
        : [...completedModules, activeModuleId];
      
      setCompletedModules(newCompleted);
      
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

  const toggleDebug = () => setDebugMode(!debugMode);

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onReset={reset} />
        <RoleSelector onSelect={setRole} />
        <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header role={role} onReset={reset} />
        <CourseSummary role={role} reflection={userReflection} onFinish={reset} />
        <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
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

      <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
    </div>
  );
}
