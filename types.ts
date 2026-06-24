
export enum CourseLevel {
  BASIC = 1,
  APPLICATION = 2,
  ADVANCED = 3
}

export type RoleId = string;
export type CourseRoleCount = 1 | 2 | 3 | 4;

export interface CourseRole {
  id: RoleId;
  title: string;
  description: string;
  focus: string;
  icon: string;
}

export interface ModuleMetadata {
  roleIds: RoleId[];
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

export interface ResourceLink {
  title: string;
  href: string;
  format: 'PDF' | 'Word' | 'Link';
}

export interface NanoCoursePart {
  id: string;
  roleId: RoleId;
  subject: string;
  body: string;
  cta: string;
  suggestedSendStep: string;
  reminderText: string;
}

export interface EmailRecipientGroup {
  id: string;
  label: string;
  roleId?: RoleId;
  emails: string[];
}

export interface EmailCampaignDraft {
  status: 'draft';
  subjectTemplate: string;
  introText: string;
  recipientGroups: EmailRecipientGroup[];
}

export interface EmailDeliveryProvider {
  id: string;
  label: string;
  sendPreview?: boolean;
}

export interface QuizQuestion {
  id: string;
  roleId: RoleId;
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
  roleId: RoleId;
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

export interface MicroCourse {
  id: string;
  title: string;
  description: string;
  sourceTitle: string;
  sourceFileName?: string;
  roleCount?: CourseRoleCount;
  createdAt: string;
  status: 'draft' | 'published';
  roles: CourseRole[];
  rules: GoldenRule[];
  modules: CourseModule[];
  matchingScenarios: MatchingScenario[];
  roleScenarios: Record<RoleId, string>;
  quizQuestions: QuizQuestion[];
  nanoCourse: NanoCoursePart[];
  emailCampaignDraft?: EmailCampaignDraft;
  resources: ResourceLink[];
}
