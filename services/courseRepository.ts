import { DEFAULT_COURSE } from '../constants';
import { MicroCourse } from '../types';

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

export const courseRepository = {
  listCourses(): MicroCourse[] {
    const stored = readStoredCourses();
    const merged = [DEFAULT_COURSE, ...stored.filter((course) => course.id !== DEFAULT_COURSE.id)];
    return merged;
  },

  getCourse(courseId: string): MicroCourse | null {
    return this.listCourses().find((course) => course.id === courseId) || null;
  },

  saveCourse(course: MicroCourse): MicroCourse {
    const stored = readStoredCourses();
    const nextCourse = {
      ...course,
      status: 'published' as const,
      createdAt: course.createdAt || new Date().toISOString(),
    };
    const withoutExisting = stored.filter((item) => item.id !== nextCourse.id);
    writeStoredCourses([nextCourse, ...withoutExisting]);
    return nextCourse;
  },
};
