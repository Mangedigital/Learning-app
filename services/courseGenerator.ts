import { MicroCourse } from '../types';

export const SUPPORTED_SOURCE_ACCEPT = '.pdf,.doc,.docx,.md,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain';

const TEXT_FILE_EXTENSIONS = ['.md', '.txt'];

export type CourseGenerationProgress = {
  event: string;
  step?: string;
  message?: string;
  course?: MicroCourse;
  [key: string]: unknown;
};

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

const parseSseBlock = (block: string): CourseGenerationProgress | null => {
  const lines = block.split('\n').map((line) => line.trimEnd());
  const eventLine = lines.find((line) => line.startsWith('event:'));
  const dataLines = lines.filter((line) => line.startsWith('data:'));
  if (!eventLine || dataLines.length === 0) return null;

  const event = eventLine.replace(/^event:\s*/, '');
  const dataText = dataLines.map((line) => line.replace(/^data:\s*/, '')).join('\n');
  try {
    const data = JSON.parse(dataText);
    return { event, ...data };
  } catch {
    return { event, message: dataText };
  }
};

const formatStreamError = (event: CourseGenerationProgress) => {
  const details = [
    event.step ? `Steg: ${event.step}` : '',
    typeof event.geminiStatus === 'number' ? `Gemini-status: ${event.geminiStatus}` : '',
    typeof event.bodySummary === 'string' ? `Svar: ${event.bodySummary}` : '',
    typeof event.responseTextLength === 'number' ? `Svarslängd: ${event.responseTextLength}` : '',
    typeof event.responseStart === 'string' ? `Start: ${event.responseStart}` : '',
    typeof event.responseEnd === 'string' ? `Slut: ${event.responseEnd}` : '',
  ].filter(Boolean);

  return [event.message || 'Kunde inte generera kursutkast.', ...details].join('\n');
};

export const generateCourseFromSource = async (
  file: File,
  sourceTitle: string,
  onProgress?: (event: CourseGenerationProgress) => void
): Promise<MicroCourse> => {
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

  if (!response.body) {
    throw new Error('Generatorn returnerade ingen läsbar stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let course: MicroCourse | null = null;

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const blocks = buffer.split(/\n\n/);
    buffer = blocks.pop() || '';

    for (const block of blocks) {
      const event = parseSseBlock(block);
      if (!event) continue;

      onProgress?.(event);

      if (event.event === 'error') {
        throw new Error(formatStreamError(event));
      }

      if (event.event === 'complete' && event.course) {
        course = event.course;
      }
    }

    if (done) break;
  }

  if (!course) {
    throw new Error('Generatorn avslutades utan färdigt kursutkast.');
  }

  return course;
};
