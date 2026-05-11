import { MicroCourse } from '../types';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const generateCourseFromPdf = async (file: File, sourceTitle: string): Promise<MicroCourse> => {
  const fileBase64 = await fileToBase64(file);
  const response = await fetch('/api/generate-course', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceTitle,
      fileName: file.name,
      fileMimeType: file.type || 'application/pdf',
      fileBase64,
    }),
  });

  if (!response.ok) {
    throw new Error('Kunde inte generera kursutkast från PDF.');
  }

  const data = await response.json();
  return data.course as MicroCourse;
};
