import React, { useMemo, useState } from 'react';
import { MicroCourse } from '../types';
import { generateCourseFromSource, SUPPORTED_SOURCE_ACCEPT } from '../services/courseGenerator';
import type { CourseGenerationProgress } from '../services/courseGenerator';

const GENERATION_STEPS = [
  { event: 'received', label: 'Tar emot källfil och metadata' },
  { event: 'validated', label: 'Kontrollerar filtyp och storlek' },
  { event: 'calling_model', label: 'Tar fram de viktigaste delarna av dokumentet' },
  { event: 'model_response', label: 'Tar emot AI-genererat kursinnehåll' },
  { event: 'parsing', label: 'Paketerar kursutkastet för granskning' },
  { event: 'complete', label: 'Kursutkast klart' },
];

const EVENT_TO_STEP_INDEX = GENERATION_STEPS.reduce<Record<string, number>>((acc, step, index) => {
  acc[step.event] = index;
  return acc;
}, { working: 2 });

export const CourseHome: React.FC<{
  courses: MicroCourse[];
  onSelectCourse: (course: MicroCourse) => void;
  onPublishCourse: (course: MicroCourse) => void;
}> = ({ courses, onSelectCourse, onPublishCourse }) => {
  const [sourceTitle, setSourceTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [draftText, setDraftText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progressEvents, setProgressEvents] = useState<CourseGenerationProgress[]>([]);
  const publishedCourses = useMemo(() => courses.filter((course) => course.status === 'published'), [courses]);
  const activeStep = useMemo(() => {
    const latest = progressEvents[progressEvents.length - 1];
    return latest ? EVENT_TO_STEP_INDEX[latest.event] ?? -1 : -1;
  }, [progressEvents]);
  const latestProgress = progressEvents[progressEvents.length - 1];

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setDraftText('');
    setProgressEvents([]);

    try {
      const draft = await generateCourseFromSource(file, sourceTitle.trim() || file.name, (progressEvent) => {
        setProgressEvents((events) => [...events, progressEvent]);
      });
      setDraftText(JSON.stringify(draft, null, 2));
    } catch (generationError) {
      const message = generationError instanceof Error ? generationError.message : 'Kunde inte generera kursutkast.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    try {
      const parsed = JSON.parse(draftText) as MicroCourse;
      onPublishCourse({
        ...parsed,
        status: 'published',
        createdAt: parsed.createdAt || new Date().toISOString(),
      });
      setDraftText('');
      setFile(null);
      setSourceTitle('');
      setError('');
    } catch {
      setError('Utkastet innehåller ogiltig JSON och kan inte publiceras.');
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mikrolärande</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">Välj kurs</h2>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl">
              Starta en publicerad kurs eller skapa ett nytt källbaserat utkast i adminläget.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {publishedCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-[#004b89] hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-slate-800">{course.title}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-1 rounded">
                  Publicerad
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{course.description}</p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Källa: {course.sourceTitle}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <i className="fa-solid fa-wand-magic-sparkles text-blue-300"></i>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">Skapa kursutkast från källfil</h2>
            <p className="text-sm text-slate-300">Stödjer PDF, Word, Markdown och text. AI-genererat innehåll måste granskas innan publicering.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            value={sourceTitle}
            onChange={(event) => setSourceTitle(event.target.value)}
            placeholder="Källtitel"
            className="md:col-span-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-300"
          />
          <input
            type="file"
            accept={SUPPORTED_SOURCE_ACCEPT}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="md:col-span-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm file:mr-3 file:border-0 file:rounded-lg file:bg-blue-100 file:px-3 file:py-1.5 file:text-blue-800"
          />
          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className="bg-blue-500 disabled:bg-slate-600 disabled:text-slate-300 text-white rounded-xl px-5 py-3 font-bold hover:bg-blue-400 transition-all"
          >
            {loading ? 'Genererar...' : 'Generera utkast'}
          </button>
        </div>

        {loading && (
          <div className="mb-4 bg-white/10 border border-white/10 rounded-2xl p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-3">Genereringsprocess</p>
            <div className="space-y-2">
              {GENERATION_STEPS.map((step, index) => (
                <div key={step.event} className={`flex items-center gap-3 text-sm ${index <= activeStep ? 'text-white' : 'text-slate-500'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    index < activeStep ? 'bg-green-500 text-white' : index === activeStep ? 'bg-blue-400 text-slate-950' : 'bg-white/10 text-slate-500'
                  }`}>
                    {index < activeStep ? <i className="fa-solid fa-check"></i> : index + 1}
                  </span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
            {latestProgress?.message && (
              <div className="mt-4 rounded-xl bg-slate-950/40 border border-white/10 p-3 text-xs text-slate-200">
                <p className="font-bold text-blue-200 mb-1">Senaste serverstatus</p>
                <p>{latestProgress.message}</p>
                {typeof latestProgress.elapsedSeconds === 'number' && (
                  <p className="text-slate-400 mt-1">Väntat {latestProgress.elapsedSeconds} sekunder på modellsvaret.</p>
                )}
              </div>
            )}
          </div>
        )}

        {error && <div className="mb-4 bg-red-500/20 border border-red-300/20 text-red-100 rounded-xl p-3 text-sm whitespace-pre-wrap">{error}</div>}

        {draftText && (
          <div className="space-y-4">
            <div className="bg-amber-100 text-amber-900 border border-amber-200 rounded-xl p-4 text-sm font-medium">
              Granska och justera JSON-utkastet innan publicering. Kontrollera särskilt regler, scenarier och quiz mot källan.
            </div>
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              className="w-full h-96 bg-slate-950 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-100 outline-none focus:border-blue-300"
            />
            <button
              onClick={handlePublish}
              className="w-full bg-green-600 text-white rounded-xl px-5 py-3 font-bold hover:bg-green-500 transition-all"
            >
              Publicera granskad kurs lokalt
            </button>
          </div>
        )}
      </section>
    </main>
  );
};
