
import React, { useState, useEffect } from 'react';
import { MicroCourse } from './types';
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
const getCourseStorageKey = (courseId: string, suffix: string) => `${STORAGE_KEY}_${courseId}_${suffix}`;

const readStorageItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const readSavedRoleId = (courseId: string | null, courses: MicroCourse[]): string | null => {
  if (!courseId) return null;
  const saved = readStorageItem(getCourseStorageKey(courseId, 'roleId'));
  const course = courses.find((item) => item.id === courseId);
  return saved && course?.roles.some((role) => role.id === saved) ? saved : null;
};

const readSavedActiveModuleId = (courseId: string | null): string | null => {
  if (!courseId) return null;
  const saved = readStorageItem(getCourseStorageKey(courseId, 'activeModuleId'));
  return saved;
};

const readSavedCompletedModules = (courseId: string | null): string[] => {
  if (!courseId) return [];
  const saved = readStorageItem(getCourseStorageKey(courseId, 'completed'));
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
  const [roleId, setRoleId] = useState<string | null>(() => {
    return readSavedRoleId(readStorageItem(`${STORAGE_KEY}_courseId`), courseRepository.listCourses());
  });
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(() => {
    return readSavedActiveModuleId(readStorageItem(`${STORAGE_KEY}_courseId`));
  });
  
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    return readSavedCompletedModules(readStorageItem(`${STORAGE_KEY}_courseId`));
  });
  
  const [userReflection, setUserReflection] = useState(() => {
    const courseId = readStorageItem(`${STORAGE_KEY}_courseId`);
    return courseId ? readStorageItem(getCourseStorageKey(courseId, 'reflection')) || '' : '';
  });
  
  const [isFinished, setIsFinished] = useState(() => {
    const courseId = readStorageItem(`${STORAGE_KEY}_courseId`);
    return courseId ? readStorageItem(getCourseStorageKey(courseId, 'isFinished')) === 'true' : false;
  });
  
  const [debugMode, setDebugMode] = useState(false);
  const activeCourse = courses.find((course) => course.id === selectedCourseId) || null;
  const activeRole = activeCourse?.roles.find((item) => item.id === roleId) || null;

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (selectedCourseId) localStorage.setItem(`${STORAGE_KEY}_courseId`, selectedCourseId);
    else localStorage.removeItem(`${STORAGE_KEY}_courseId`);
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return;
    if (roleId) localStorage.setItem(getCourseStorageKey(selectedCourseId, 'roleId'), roleId);
    else localStorage.removeItem(getCourseStorageKey(selectedCourseId, 'roleId'));
  }, [roleId, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return;
    if (activeModuleId) localStorage.setItem(getCourseStorageKey(selectedCourseId, 'activeModuleId'), activeModuleId);
    else localStorage.removeItem(getCourseStorageKey(selectedCourseId, 'activeModuleId'));
  }, [activeModuleId, selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId) localStorage.setItem(getCourseStorageKey(selectedCourseId, 'completed'), JSON.stringify(completedModules));
  }, [completedModules, selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId) localStorage.setItem(getCourseStorageKey(selectedCourseId, 'reflection'), userReflection);
  }, [userReflection, selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId) localStorage.setItem(getCourseStorageKey(selectedCourseId, 'isFinished'), String(isFinished));
  }, [isFinished, selectedCourseId]);

  const activeModule = activeCourse?.modules.find(m => m.id === activeModuleId);

  const selectCourse = (course: MicroCourse) => {
    setSelectedCourseId(course.id);
    setRoleId(readSavedRoleId(course.id, courses));
    setCompletedModules(readSavedCompletedModules(course.id));
    setActiveModuleId(readSavedActiveModuleId(course.id));
    setUserReflection(readStorageItem(getCourseStorageKey(course.id, 'reflection')) || '');
    setIsFinished(readStorageItem(getCourseStorageKey(course.id, 'isFinished')) === 'true');
  };

  const startCourseFresh = (course: MicroCourse) => {
    setSelectedCourseId(course.id);
    setRoleId(null);
    setActiveModuleId(null);
    setCompletedModules([]);
    setUserReflection('');
    setIsFinished(false);
  };

  const publishCourse = (course: MicroCourse) => {
    const saved = courseRepository.saveCourse(course);
    setCourses(courseRepository.listCourses());
    startCourseFresh(saved);
  };

  const reset = () => {
    if (selectedCourseId) {
      localStorage.removeItem(getCourseStorageKey(selectedCourseId, 'roleId'));
      localStorage.removeItem(getCourseStorageKey(selectedCourseId, 'activeModuleId'));
      localStorage.removeItem(getCourseStorageKey(selectedCourseId, 'completed'));
      localStorage.removeItem(getCourseStorageKey(selectedCourseId, 'reflection'));
      localStorage.removeItem(getCourseStorageKey(selectedCourseId, 'isFinished'));
    }
    setSelectedCourseId(null);
    setRoleId(null);
    setActiveModuleId(null);
    setCompletedModules([]);
    setUserReflection('');
    setIsFinished(false);
    // Clear localStorage
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

  if (!activeRole) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onReset={reset} />
        <RoleSelector roles={activeCourse.roles} onSelect={(nextRole) => setRoleId(nextRole.id)} />
        <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header role={activeRole} onReset={reset} />
        <CourseSummary role={activeRole} reflection={userReflection} onFinish={reset} />
        <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header role={activeRole} onReset={reset} />
      
      <main className="flex-1">
        {!activeModuleId || !activeModule ? (
          <LearningPath 
            courseTitle={activeCourse.title}
            role={activeRole}
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
                role={activeRole}
                rules={activeCourse.rules}
                scenarios={activeCourse.matchingScenarios}
                onComplete={() => handleModuleComplete()}
              />
            )}
            {activeModule?.type === 'reflection' && (
              <ReflectionModule role={activeRole} roleScenarios={activeCourse.roleScenarios} onComplete={handleModuleComplete} />
            )}
            {activeModule?.type === 'quiz' && (
              <QuizModule role={activeRole} questions={activeCourse.quizQuestions} onComplete={() => handleModuleComplete()} />
            )}
          </ModuleLayout>
        )}
      </main>

      <Footer debugMode={debugMode} onToggleDebug={toggleDebug} />
    </div>
  );
}
