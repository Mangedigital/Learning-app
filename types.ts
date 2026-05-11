
export enum UserRole {
  HR = 'HR-specialist/Rekryterare',
  DEV_LEAD = 'Utvecklingsledare',
  MANAGER = 'Chef'
}

export enum CourseLevel {
  BASIC = 1,
  APPLICATION = 2,
  ADVANCED = 3
}

export interface ModuleMetadata {
  role: UserRole[];
  level: CourseLevel;
  category: string;
  durationMinutes: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  metadata: ModuleMetadata;
  type: 'matching' | 'reflection' | 'quiz';
}

export interface QuizQuestion {
  id: string;
  role: UserRole;
  ruleIds: number[];
  question: string;
  answer: boolean;
  explanation: string;
}

export interface GoldenRule {
  id: number;
  title: string;
  content: string;
  criticalForHR?: boolean;
}

export interface MatchingScenario {
  id: string;
  role: UserRole;
  text: string;
  correctRuleId: number;
  explanation: string;
  sourceQuote: string;
  clue: string;
  socraticQuestion: string;
  options?: number[];
  nudge?: {
    title: string;
    content: string;
  };
}
