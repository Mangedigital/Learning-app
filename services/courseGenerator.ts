import { MicroCourse } from '../types';

export const SUPPORTED_SOURCE_ACCEPT = '.pdf,.doc,.docx,.md,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain';

const TEXT_FILE_EXTENSIONS = ['.md', '.txt'];

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

const fileToText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const isTextSource = (file: File) => {
  const lowerName = file.name.toLowerCase();
  return file.type.startsWith('text/') || TEXT_FILE_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
};

const readErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return typeof data.error === 'string' ? data.error : 'Kunde inte generera kursutkast.';
  } catch {
    return 'Kunde inte generera kursutkast.';
  }
};

export const generateCourseFromSource = async (file: File, sourceTitle: string): Promise<MicroCourse> => {
  const sourceText = isTextSource(file) ? await fileToText(file) : undefined;
  const fileBase64 = sourceText ? undefined : await fileToBase64(file);
  const response = await fetch('/api/generate-course', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceTitle,
      fileName: file.name,
      fileMimeType: file.type || 'application/octet-stream',
      fileBase64,
      sourceText,
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  return data.course as MicroCourse;
};
