
import React, { useState, useEffect } from 'react';
import { MicroCourse, UserRole } from './types';
import { courseRepository } from './services/courseRepository';

import { Header } from './components/Header';
import { CourseHome } from './components/CourseHome';
import { RoleSelector } from './components/RoleSelector';
import { LearningPath } from './components/LearningPath';
import { ModuleLayout } from './components/ModuleLayout';
import { RiskDetectiveMatching } from './components/RiskDetectiveMatching';
import { ReflectionModule } from './components/ReflectionModule';
import { QuizModule } from './components/QuizModule';
import { CourseSummary } from './components/CourseSummary';
import { Footer } from './components/Footer';

const STORAGE_KEY = 'ai_i_vardagen_progress';
const validRoles = new Set(Object.values(UserRole));

const readStorageItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const readSavedRole = (): UserRole | null => {
  const saved = readStorageItem(`${STORAGE_KEY}_role`);
  return saved && validRoles.has(saved as UserRole) ? (saved as UserRole) : null;
};

const readSavedActiveModuleId = (): string | null => {
  const saved = readStorageItem(`${STORAGE_KEY}_activeModuleId`);
  return saved;
};

const readSavedCompletedModules = (): string[] => {
  const saved = readStorageItem(`${STORAGE_KEY}_completed`);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
};

export default function App() {
  const [courses, setCourses] = useState<MicroCourse[]>(() => courseRepository.listCourses());
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    return readStorageItem(`${STORAGE_KEY}_courseId`);
  });
  // Initialize state from localStorage if available
  const [role, setRole] = useState<UserRole | null>(() => {
    return readSavedRole();
  });
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(() => {
    return readSavedActiveModuleId();
  });
  
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    return readSavedCompletedModules();
  });
  
  const [userReflection, setUserReflection] = useState(() => {
    return readStorageItem(`${STORAGE_KEY}_reflection`) || '';
  });
  
  const [isFinished, setIsFinished] = useState(() => {
    return readStorageItem(`${STORAGE_KEY}_isFinished`) === 'true';
  });
  
  const [debugMode, setDebugMode] = useState(false);
  const activeCourse = courses.find((course) => course.id === selectedCourseId) || null;

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (selectedCourseId) localStorage.setItem(`${STORAGE_KEY}_courseId`, selectedCourseId);
    else localStorage.removeItem(`${STORAGE_KEY}_courseId`);
  }, [selectedCourseId]);

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

  const activeModule = activeCourse?.modules.find(m => m.id === activeModuleId);

  const selectCourse = (course: MicroCourse) => {
    setSelectedCourseId(course.id);
    setRole(null);
    setActiveModuleId(null);
    setCompletedModules([]);
    setUserReflection('');
    setIsFinished(false);
  };

  const publishCourse = (course: MicroCourse) => {
    const saved = courseRepository.saveCourse(course);
    setCourses(courseRepository.listCourses());
    selectCourse(saved);
  };

  const reset = () => {
    setSelectedCourseId(null);
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
    localStorage.removeItem(`${STORAGE_KEY}_courseId`);
  };

  const handleModuleComplete = (reflectionData?: string) => {
    if (activeModuleId && activeCourse) {
      const newCompleted = completedModules.includes(activeModuleId) 
        ? completedModules 
        : [...completedModules, activeModuleId];
      
      setCompletedModules(newCompleted);
      
      if (reflectionData) {
        setUserReflection(reflectionData);
      }
      
      setActiveModuleId(null);

      // Check if this was the last module
      const isLastModule = activeCourse.modules.findIndex(m => m.id === activeModuleId) === activeCourse.modules.length - 1;
      if (isLastModule) {
        setIsFinished(true);
      }
    }
  };

  const toggleDebug = () => setDebugMode(!debugMode);

  if (!activeCourse) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onReset={reset} />
        <CourseHome courses={courses} onSelectCourse={selectCourse} onPublishCourse={publishCourse} />
        <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onReset={reset} />
        <RoleSelector roles={activeCourse.roles} onSelect={setRole} />
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
        {!activeModuleId || !activeModule ? (
          <LearningPath 
            courseTitle={activeCourse.title}
            role={role} 
            modules={activeCourse.modules}
            resources={activeCourse.resources}
            completedModules={completedModules} 
            debugMode={debugMode}
            onSelect={setActiveModuleId} 
          />
        ) : (
          <ModuleLayout 
            module={activeModule}
            completedCount={completedModules.length}
            totalModules={activeCourse.modules.length}
            onBack={() => setActiveModuleId(null)}
          >
            {activeModule?.type === 'matching' && (
              <RiskDetectiveMatching
                role={role}
                rules={activeCourse.rules}
                scenarios={activeCourse.matchingScenarios}
                onComplete={() => handleModuleComplete()}
              />
            )}
            {activeModule?.type === 'reflection' && (
              <ReflectionModule role={role} roleScenarios={activeCourse.roleScenarios} onComplete={handleModuleComplete} />
            )}
            {activeModule?.type === 'quiz' && (
              <QuizModule role={role} questions={activeCourse.quizQuestions} onComplete={() => handleModuleComplete()} />
            )}
          </ModuleLayout>
        )}
      </main>

      <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
    </div>
  );
}
