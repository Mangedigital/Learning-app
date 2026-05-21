import { MicroCourse } from '../types';

export const SUPPORTED_SOURCE_ACCEPT = '.pdf,.doc,.docx,.md,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain';

const TEXT_FILE_EXTENSIONS = ['.md', '.txt'];

export type CourseGenerationProgress = {
  event: string;
  step?: string;
  message?: string;
  course?: MicroCourse;
  jobId?: string;
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

const formatStreamError = (event: CourseGenerationProgress) => {
  const details = [
    event.step ? `Steg: ${event.step}` : '',
    event.jobId ? `Jobb: ${event.jobId}` : '',
    typeof event.geminiStatus === 'number' ? `Gemini-status: ${event.geminiStatus}` : '',
    typeof event.timeoutMs === 'number' ? `Timeout: ${Math.round(event.timeoutMs / 1000)} sekunder` : '',
    typeof event.bodySummary === 'string' ? `Svar: ${event.bodySummary}` : '',
    typeof event.responseTextLength === 'number' ? `Svarslängd: ${event.responseTextLength}` : '',
    typeof event.responseStart === 'string' ? `Start: ${event.responseStart}` : '',
    typeof event.responseEnd === 'string' ? `Slut: ${event.responseEnd}` : '',
  ].filter(Boolean);

  return [event.message || 'Kunde inte generera kursutkast.', ...details].join('\n');
};

const createJobId = () => {
  if ('randomUUID' in crypto) return crypto.randomUUID();
  return `job-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

type JobStatusResponse = {
  status: 'processing' | 'complete' | 'failed';
  course?: MicroCourse;
  error?: string;
  message?: string;
  metadata?: Record<string, unknown>;
};

const getJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  const response = await fetch(`/api/get-job-status?job_id=${encodeURIComponent(jobId)}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.json();
};

export const generateCourseFromSource = async (
  file: File,
  sourceTitle: string,
  onProgress?: (event: CourseGenerationProgress) => void
): Promise<MicroCourse> => {
  const jobId = createJobId();
  const sourceText = isTextSource(file) ? await fileToText(file) : undefined;
  const fileBase64 = sourceText ? undefined : await fileToBase64(file);

  onProgress?.({
    event: 'received',
    step: 'received',
    message: 'Källfilen är läst i webbläsaren och ett serverjobb skapas.',
    jobId,
  });

  const response = await fetch('/.netlify/functions/generate-course-background', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobId,
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

  onProgress?.({
    event: 'validated',
    step: 'validated',
    message: 'Background-jobbet är startat. Appen pollar serverstatus var tredje sekund.',
    jobId,
  });

  const maxPolls = 300;
  for (let pollCount = 0; pollCount < maxPolls; pollCount += 1) {
    await wait(3000);
    const status = await getJobStatus(jobId);

    if (status.status === 'complete') {
      if (!status.course) throw new Error('Jobbet markerades klart utan kursutkast.');
      onProgress?.({
        event: 'complete',
        step: 'complete',
        message: 'Kursutkastet är klart för granskning.',
        jobId,
        course: status.course,
      });
      return status.course;
    }

    if (status.status === 'failed') {
      throw new Error(formatStreamError({
        event: 'error',
        step: 'background',
        message: status.error || 'Background-jobbet misslyckades.',
        jobId,
      }));
    }

    const stage = typeof status.metadata?.stage === 'string' ? status.metadata.stage : '';
    const progressEvent =
      stage === 'uploading_file' || stage === 'file_uploaded' || stage === 'preparing_text'
        ? 'calling_model'
        : stage === 'generating_course' || stage === 'retrying'
          ? 'model_response'
          : stage === 'parsing_response'
            ? 'parsing'
            : pollCount < 2 ? 'calling_model' : pollCount < 8 ? 'model_response' : 'parsing';
    onProgress?.({
      event: progressEvent,
      step: progressEvent,
      message: status.message || 'Background-jobbet bearbetar källan med Gemini File API.',
      jobId,
      elapsedSeconds: (pollCount + 1) * 3,
      metadata: status.metadata,
    });
  }

  throw new Error('Generatorjobbet tog längre än 15 minuter och avbröts i klienten.');
};
