import { DEFAULT_COURSE } from '../constants';
import { CourseRole, MicroCourse } from '../types';

const COURSES_KEY = 'microlearning_courses';

const readStoredCourses = (): MicroCourse[] => {
  try {
    const saved = localStorage.getItem(COURSES_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredCourses = (courses: MicroCourse[]) => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'roll';

const toCourseRole = (role: CourseRole | string, index: number): CourseRole => {
  if (typeof role !== 'string') {
    return {
      ...role,
      id: role.id || `roll-${index + 1}`,
      icon: role.icon || 'fa-user-circle',
      focus: role.focus || role.description || role.title,
      description: role.description || role.focus || role.title,
    };
  }

  return {
    id: role === 'HR-specialist/Rekryterare' ? 'hr' : role === 'Utvecklingsledare' ? 'dev-lead' : role === 'Chef' ? 'manager' : slugify(role),
    title: role,
    description: `Rollanpassad lärstig för ${role}.`,
    focus: role,
    icon: role === 'HR-specialist/Rekryterare' ? 'fa-user-tie' : role === 'Utvecklingsledare' ? 'fa-arrows-spin' : role === 'Chef' ? 'fa-briefcase' : 'fa-user-circle',
  };
};

const normalizeCourse = (course: MicroCourse): MicroCourse => {
  const legacy = course as any;
  const roles = (Array.isArray(legacy.roles) ? legacy.roles : []).map(toCourseRole).slice(0, 3);
  const roleIdByTitle = new Map(roles.map((role) => [role.title, role.id]));
  const moduleRoleIds = (metadata: any) => {
    if (Array.isArray(metadata?.roleIds)) return metadata.roleIds;
    const legacyRoles = metadata?.["role"];
    if (Array.isArray(legacyRoles)) {
      return legacyRoles.map((role: string) => roleIdByTitle.get(role) || slugify(role));
    }
    return roles.map((role) => role.id);
  };

  return {
    ...course,
    roles: roles.length ? roles : course.roles,
    modules: (Array.isArray(course.modules) ? course.modules : []).map((module) => ({
      ...module,
      metadata: {
        ...module.metadata,
        roleIds: moduleRoleIds(module.metadata),
      },
    })),
    matchingScenarios: (Array.isArray(course.matchingScenarios) ? course.matchingScenarios : []).map((scenario) => ({
      ...scenario,
      roleId: (scenario as any).roleId || roleIdByTitle.get((scenario as any).role) || slugify((scenario as any).role || roles[0]?.title || 'roll'),
    })),
    roleScenarios: Object.fromEntries(
      Object.entries(legacy.roleScenarios || {}).map(([key, value]) => [roleIdByTitle.get(key) || key, String(value)])
    ),
    quizQuestions: (Array.isArray(course.quizQuestions) ? course.quizQuestions : []).map((question) => ({
      ...question,
      roleId: (question as any).roleId || roleIdByTitle.get((question as any).role) || slugify((question as any).role || roles[0]?.title || 'roll'),
    })),
  };
};

export const courseRepository = {
  listCourses(): MicroCourse[] {
    const stored = readStoredCourses().map(normalizeCourse);
    const merged = [DEFAULT_COURSE, ...stored.filter((course) => course.id !== DEFAULT_COURSE.id)];
    return merged;
  },

  getCourse(courseId: string): MicroCourse | null {
    return this.listCourses().find((course) => course.id === courseId) || null;
  },

  saveCourse(course: MicroCourse): MicroCourse {
    const stored = readStoredCourses();
    const nextCourse = {
      ...normalizeCourse(course),
      status: 'published' as const,
      createdAt: course.createdAt || new Date().toISOString(),
    };
    const withoutExisting = stored.filter((item) => item.id !== nextCourse.id);
    writeStoredCourses([nextCourse, ...withoutExisting]);
    return nextCourse;
  },
};
