import React, { useMemo, useState } from 'react';
import { CourseRole, EmailRecipientGroup, GoldenRule, MatchingScenario, MicroCourse, NanoCoursePart, QuizQuestion } from '../types';

type DraftSection = 'overview' | 'roles' | 'rules' | 'cases' | 'reflection' | 'quiz' | 'nano' | 'email';

const sections: Array<{ id: DraftSection; label: string; icon: string }> = [
  { id: 'overview', label: 'Översikt', icon: 'fa-file-lines' },
  { id: 'roles', label: 'Roller', icon: 'fa-users' },
  { id: 'rules', label: 'Regler', icon: 'fa-list-check' },
  { id: 'cases', label: 'Riskcase', icon: 'fa-triangle-exclamation' },
  { id: 'reflection', label: 'Reflektion', icon: 'fa-comment-dots' },
  { id: 'quiz', label: 'Quiz', icon: 'fa-circle-question' },
  { id: 'nano', label: 'Nanokurs', icon: 'fa-envelope-open-text' },
  { id: 'email', label: 'Mejlutkast', icon: 'fa-paper-plane' },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getDraftValidationErrors = (course: MicroCourse | null) => {
  if (!course) return [];
  const errors: string[] = [];
  const roles = Array.isArray(course.roles) ? course.roles : [];
  const matchingScenarios = Array.isArray(course.matchingScenarios) ? course.matchingScenarios : [];
  const quizQuestions = Array.isArray(course.quizQuestions) ? course.quizQuestions : [];
  const roleScenarios: Record<string, string> = course.roleScenarios && typeof course.roleScenarios === 'object' ? course.roleScenarios : {};

  if (roles.length < 1 || roles.length > 4) errors.push('Kursen måste ha mellan en och fyra roller.');

  roles.forEach((role) => {
    const matchingCount = matchingScenarios.filter((scenario) => scenario.roleId === role.id).length;
    const quizCount = quizQuestions.filter((question) => question.roleId === role.id).length;
    const nanoCount = Array.isArray(course.nanoCourse) ? course.nanoCourse.filter((part) => part.roleId === role.id).length : 0;
    if (matchingCount < 2) errors.push(`${role.title} behöver minst två riskdetektiv-case.`);
    if (!roleScenarios[role.id]) errors.push(`${role.title} saknar reflektionsscenario.`);
    if (quizCount < 5) errors.push(`${role.title} behöver fem quizfrågor.`);
    if (nanoCount < 1) errors.push(`${role.title} behöver minst en nanokursdel.`);
  });

  course.emailCampaignDraft?.recipientGroups?.forEach((group) => {
    group.emails.forEach((email) => {
      if (email.trim() && !emailPattern.test(email.trim())) {
        errors.push(`Ogiltig mejladress i ${group.label}: ${email}`);
      }
    });
  });

  return errors;
};

const Field: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  textarea?: boolean;
  helper?: string;
  type?: string;
}> = ({ label, value, onChange, textarea, helper, type = 'text' }) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    )}
    {helper && <span className="block text-xs text-slate-400">{helper}</span>}
  </label>
);

const StatusPill: React.FC<{ children: React.ReactNode; tone?: 'ok' | 'warn' }> = ({ children, tone = 'ok' }) => (
  <span className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold ${
    tone === 'ok' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
  }`}>
    {children}
  </span>
);

const makeScenario = (roleId: string, index: number, rules: GoldenRule[]): MatchingScenario => ({
  id: `${roleId}-case-${Date.now()}-${index}`,
  roleId,
  text: '',
  correctRuleId: rules[0]?.id || 1,
  explanation: '',
  sourceQuote: '',
  clue: '',
  socraticQuestion: '',
  options: rules.slice(0, 4).map((rule) => rule.id),
});

const makeQuizQuestion = (roleId: string, index: number, rules: GoldenRule[]): QuizQuestion => ({
  id: `${roleId}-q-${Date.now()}-${index}`,
  roleId,
  ruleIds: [rules[0]?.id || 1],
  question: '',
  answer: true,
  explanation: '',
});

const makeRole = (index: number): CourseRole => ({
  id: `roll-${Date.now()}-${index}`,
  title: `Ny roll ${index}`,
  description: 'Beskriv rollens uppdrag.',
  focus: 'Praktiskt fokus för nanokurs och mikrokurs.',
  icon: 'fa-user-circle',
});

const makeNanoPart = (roleId: string, index: number): NanoCoursePart => ({
  id: `${roleId}-nano-${Date.now()}-${index}`,
  roleId,
  subject: 'Ny nanokursdel',
  body: 'Kort innehåll som kan skickas som mejl.',
  cta: 'Öppna kursen och gör nästa steg.',
  suggestedSendStep: `Dag ${index}`,
  reminderText: 'Påminnelse: fortsätt med nanokursen när du har några minuter.',
});

const makeRecipientGroup = (role?: CourseRole): EmailRecipientGroup => ({
  id: `group-${Date.now()}`,
  label: role ? `${role.title}` : 'Ny mottagargrupp',
  roleId: role?.id,
  emails: [],
});

const parseRuleIds = (value: string) =>
  value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));

export const DraftEditor: React.FC<{
  course: MicroCourse;
  onChange: (course: MicroCourse) => void;
  onPublish: () => void;
  validationErrors: string[];
}> = ({ course, onChange, onPublish, validationErrors }) => {
  const [activeSection, setActiveSection] = useState<DraftSection>('overview');
  const [activeRoleId, setActiveRoleId] = useState(course.roles[0]?.id || '');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  const activeRole = course.roles.find((role) => role.id === activeRoleId) || course.roles[0];
  const activeRoleIdSafe = activeRole?.id || '';
  const roleCases = course.matchingScenarios.filter((scenario) => scenario.roleId === activeRoleIdSafe);
  const roleQuiz = course.quizQuestions.filter((question) => question.roleId === activeRoleIdSafe);
  const roleNanoParts = (course.nanoCourse || []).filter((part) => part.roleId === activeRoleIdSafe);
  const emailDraft = course.emailCampaignDraft || {
    status: 'draft' as const,
    subjectTemplate: '{{nanoSubject}}',
    introText: `Hej! Här kommer en kort nanokurs från ${course.title}.`,
    recipientGroups: [],
  };
  const roleErrors = useMemo(
    () => validationErrors.filter((error) => activeRole && error.includes(activeRole.title)),
    [activeRole, validationErrors]
  );

  const patchCourse = (patch: Partial<MicroCourse>) => onChange({ ...course, ...patch });

  const updateRole = (roleId: string, patch: Partial<MicroCourse['roles'][number]>) => {
    patchCourse({
      roles: course.roles.map((role) => role.id === roleId ? { ...role, ...patch } : role),
    });
  };

  const addRole = () => {
    if (course.roles.length >= 4) return;
    const role = makeRole(course.roles.length + 1);
    patchCourse({
      roleCount: Math.min(course.roles.length + 1, 4) as MicroCourse['roleCount'],
      roles: [...course.roles, role],
      modules: course.modules.map((module) => ({
        ...module,
        metadata: {
          ...module.metadata,
          roleIds: [...new Set([...(module.metadata.roleIds || []), role.id])],
        },
      })),
      roleScenarios: { ...course.roleScenarios, [role.id]: '' },
      nanoCourse: [...(course.nanoCourse || []), makeNanoPart(role.id, 1)],
    });
    setActiveRoleId(role.id);
  };

  const deleteRole = (roleId: string) => {
    if (course.roles.length <= 1) return;
    const nextRoles = course.roles.filter((role) => role.id !== roleId);
    patchCourse({
      roleCount: Math.max(nextRoles.length, 1) as MicroCourse['roleCount'],
      roles: nextRoles,
      modules: course.modules.map((module) => ({
        ...module,
        metadata: {
          ...module.metadata,
          roleIds: (module.metadata.roleIds || []).filter((id) => id !== roleId),
        },
      })),
      matchingScenarios: course.matchingScenarios.filter((scenario) => scenario.roleId !== roleId),
      roleScenarios: Object.fromEntries(Object.entries(course.roleScenarios).filter(([id]) => id !== roleId)),
      quizQuestions: course.quizQuestions.filter((question) => question.roleId !== roleId),
      nanoCourse: (course.nanoCourse || []).filter((part) => part.roleId !== roleId),
      emailCampaignDraft: {
        ...emailDraft,
        recipientGroups: emailDraft.recipientGroups.map((group) => group.roleId === roleId ? { ...group, roleId: undefined } : group),
      },
    });
    setActiveRoleId(nextRoles[0]?.id || '');
  };

  const updateRule = (ruleId: number, patch: Partial<GoldenRule>) => {
    patchCourse({
      rules: course.rules.map((rule) => rule.id === ruleId ? { ...rule, ...patch } : rule),
    });
  };

  const updateScenario = (scenarioId: string, patch: Partial<MatchingScenario>) => {
    patchCourse({
      matchingScenarios: course.matchingScenarios.map((scenario) => scenario.id === scenarioId ? { ...scenario, ...patch } : scenario),
    });
  };

  const addScenario = () => {
    patchCourse({
      matchingScenarios: [...course.matchingScenarios, makeScenario(activeRoleIdSafe, roleCases.length + 1, course.rules)],
    });
  };

  const duplicateScenario = (scenario: MatchingScenario) => {
    patchCourse({
      matchingScenarios: [
        ...course.matchingScenarios,
        { ...scenario, id: `${scenario.id}-copy-${Date.now()}`, text: `${scenario.text} (kopia)` },
      ],
    });
  };

  const deleteScenario = (scenarioId: string) => {
    if (roleCases.length <= 2) return;
    patchCourse({
      matchingScenarios: course.matchingScenarios.filter((scenario) => scenario.id !== scenarioId),
    });
  };

  const updateReflection = (roleId: string, value: string) => {
    patchCourse({
      roleScenarios: { ...course.roleScenarios, [roleId]: value },
    });
  };

  const updateQuiz = (questionId: string, patch: Partial<QuizQuestion>) => {
    patchCourse({
      quizQuestions: course.quizQuestions.map((question) => question.id === questionId ? { ...question, ...patch } : question),
    });
  };

  const addQuiz = () => {
    patchCourse({
      quizQuestions: [...course.quizQuestions, makeQuizQuestion(activeRoleIdSafe, roleQuiz.length + 1, course.rules)],
    });
  };

  const deleteQuiz = (questionId: string) => {
    if (roleQuiz.length <= 5) return;
    patchCourse({
      quizQuestions: course.quizQuestions.filter((question) => question.id !== questionId),
    });
  };

  const updateNanoPart = (partId: string, patch: Partial<NanoCoursePart>) => {
    patchCourse({
      nanoCourse: (course.nanoCourse || []).map((part) => part.id === partId ? { ...part, ...patch } : part),
    });
  };

  const addNanoPart = () => {
    patchCourse({
      nanoCourse: [...(course.nanoCourse || []), makeNanoPart(activeRoleIdSafe, roleNanoParts.length + 1)],
    });
  };

  const deleteNanoPart = (partId: string) => {
    patchCourse({
      nanoCourse: (course.nanoCourse || []).filter((part) => part.id !== partId),
    });
  };

  const updateEmailDraft = (patch: Partial<typeof emailDraft>) => {
    patchCourse({
      emailCampaignDraft: {
        ...emailDraft,
        ...patch,
        status: 'draft',
      },
    });
  };

  const updateRecipientGroup = (groupId: string, patch: Partial<EmailRecipientGroup>) => {
    updateEmailDraft({
      recipientGroups: emailDraft.recipientGroups.map((group) => group.id === groupId ? { ...group, ...patch } : group),
    });
  };

  const addRecipientGroup = () => {
    updateEmailDraft({
      recipientGroups: [...emailDraft.recipientGroups, makeRecipientGroup(activeRole)],
    });
  };

  const deleteRecipientGroup = (groupId: string) => {
    updateEmailDraft({
      recipientGroups: emailDraft.recipientGroups.filter((group) => group.id !== groupId),
    });
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonText) as MicroCourse;
      const errors = getDraftValidationErrors(parsed);
      if (errors.length) {
        setJsonError(errors.join('\n'));
        return;
      }
      onChange(parsed);
      setActiveRoleId(parsed.roles[0]?.id || '');
      setJsonError('');
      setAdvancedOpen(false);
    } catch {
      setJsonError('JSON kunde inte tolkas. Kontrollera formatet och försök igen.');
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="border-b border-slate-200 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">Granska kursutkast</p>
            <h3 className="text-xl font-black text-slate-900">{course.title || 'Namnlöst kursutkast'}</h3>
            <p className="text-sm text-slate-500">Redigera innehållet i rutor. JSON finns kvar under avancerat läge.</p>
          </div>
          <button
            onClick={onPublish}
            disabled={validationErrors.length > 0}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-500 disabled:bg-slate-200 disabled:text-slate-500"
          >
            Publicera granskad kurs lokalt
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="mb-1 font-bold">Det finns saker att fixa före publicering:</p>
            <div className="whitespace-pre-wrap">{validationErrors.join('\n')}</div>
          </div>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 py-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
              activeSection === section.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <i className={`fa-solid ${section.icon}`}></i>
            {section.label}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-5">
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Kurstitel" value={course.title} onChange={(title) => patchCourse({ title })} />
            <Field label="Källa" value={course.sourceTitle} onChange={(sourceTitle) => patchCourse({ sourceTitle })} />
            <div className="md:col-span-2">
              <Field label="Beskrivning" value={course.description} onChange={(description) => patchCourse({ description })} textarea />
            </div>
            <Field label="Källfil" value={course.sourceFileName || ''} onChange={(sourceFileName) => patchCourse({ sourceFileName })} />
            <Field label="Kurs-id" value={course.id} onChange={(id) => patchCourse({ id })} helper="Ändra bara om du behöver skilja två utkast åt." />
          </div>
        )}

        {activeSection === 'roles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill tone={course.roles.length >= 1 && course.roles.length <= 4 ? 'ok' : 'warn'}>{course.roles.length}/4 roller</StatusPill>
              <button
                onClick={addRole}
                disabled={course.roles.length >= 4}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:text-slate-300"
              >
                <i className="fa-solid fa-plus mr-2"></i>Lägg till roll
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {course.roles.map((role) => (
                <div key={role.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <StatusPill>{course.matchingScenarios.filter((scenario) => scenario.roleId === role.id).length} case</StatusPill>
                  <StatusPill tone={course.quizQuestions.filter((question) => question.roleId === role.id).length >= 5 ? 'ok' : 'warn'}>
                    {course.quizQuestions.filter((question) => question.roleId === role.id).length}/5 frågor
                  </StatusPill>
                </div>
                <div className="space-y-3">
                  <Field label="Titel" value={role.title} onChange={(title) => updateRole(role.id, { title })} />
                  <Field label="Fokus" value={role.focus} onChange={(focus) => updateRole(role.id, { focus })} />
                  <Field label="Ikon" value={role.icon} onChange={(icon) => updateRole(role.id, { icon })} helper="FontAwesome, t.ex. fa-user-tie." />
                  <Field label="Beskrivning" value={role.description} onChange={(description) => updateRole(role.id, { description })} textarea />
                  <button
                    onClick={() => deleteRole(role.id)}
                    disabled={course.roles.length <= 1}
                    className="w-full rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-bold text-red-600 disabled:text-slate-300"
                  >
                    Ta bort roll
                  </button>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'rules' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {course.rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Regel {rule.id}</div>
                <div className="space-y-3">
                  <Field label="Titel" value={rule.title} onChange={(title) => updateRule(rule.id, { title })} />
                  <Field label="Innehåll" value={rule.content} onChange={(content) => updateRule(rule.id, { content })} textarea />
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeSection === 'cases' || activeSection === 'reflection' || activeSection === 'quiz' || activeSection === 'nano') && (
          <div className="mb-4 flex flex-wrap gap-2">
            {course.roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRoleId(role.id)}
                className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                  activeRoleIdSafe === role.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                }`}
              >
                {role.title}
              </button>
            ))}
          </div>
        )}

        {roleErrors.length > 0 && (activeSection === 'cases' || activeSection === 'reflection' || activeSection === 'quiz' || activeSection === 'nano') && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 whitespace-pre-wrap">
            {roleErrors.join('\n')}
          </div>
        )}

        {activeSection === 'cases' && activeRole && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill tone={roleCases.length >= 2 ? 'ok' : 'warn'}>{roleCases.length} case</StatusPill>
              <button onClick={addScenario} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <i className="fa-solid fa-plus mr-2"></i>Lägg till case
              </button>
            </div>
            {roleCases.map((scenario, index) => (
              <div key={scenario.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-700">Case {index + 1}</p>
                  <div className="flex gap-2">
                    <button onClick={() => duplicateScenario(scenario)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600">Duplicera</button>
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      disabled={roleCases.length <= 2}
                      className="rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 disabled:text-slate-300"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="Case-text" value={scenario.text} onChange={(text) => updateScenario(scenario.id, { text })} textarea />
                  </div>
                  <Field label="Rätt regel" value={scenario.correctRuleId} type="number" onChange={(value) => updateScenario(scenario.id, { correctRuleId: Number(value) || 1 })} />
                  <Field label="Regelalternativ" value={(scenario.options || []).join(', ')} onChange={(value) => updateScenario(scenario.id, { options: parseRuleIds(value) })} helper="Kommaseparerade regelnummer." />
                  <Field label="Ledtråd" value={scenario.clue} onChange={(clue) => updateScenario(scenario.id, { clue })} textarea />
                  <Field label="Förklaring" value={scenario.explanation} onChange={(explanation) => updateScenario(scenario.id, { explanation })} textarea />
                  <div className="md:col-span-2">
                    <Field label="Reflektionsfråga" value={scenario.socraticQuestion} onChange={(socraticQuestion) => updateScenario(scenario.id, { socraticQuestion })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'reflection' && activeRole && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Field
              label={`Reflektionsscenario för ${activeRole.title}`}
              value={course.roleScenarios[activeRole.id] || ''}
              onChange={(value) => updateReflection(activeRole.id, value)}
              textarea
              helper="Detta visas i modulen Människan i loopen."
            />
          </div>
        )}

        {activeSection === 'quiz' && activeRole && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill tone={roleQuiz.length >= 5 ? 'ok' : 'warn'}>{roleQuiz.length}/5 frågor</StatusPill>
              <button onClick={addQuiz} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <i className="fa-solid fa-plus mr-2"></i>Lägg till quizfråga
              </button>
            </div>
            {roleQuiz.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-700">Fråga {index + 1}</p>
                  <button
                    onClick={() => deleteQuiz(question.id)}
                    disabled={roleQuiz.length <= 5}
                    className="rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 disabled:text-slate-300"
                  >
                    Ta bort
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="Fråga" value={question.question} onChange={(value) => updateQuiz(question.id, { question: value })} textarea />
                  </div>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Svar</span>
                    <select
                      value={String(question.answer)}
                      onChange={(event) => updateQuiz(question.id, { answer: event.target.value === 'true' })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="true">Sant</option>
                      <option value="false">Falskt</option>
                    </select>
                  </label>
                  <Field label="Regelkoppling" value={question.ruleIds.join(', ')} onChange={(value) => updateQuiz(question.id, { ruleIds: parseRuleIds(value) })} helper="Kommaseparerade regelnummer." />
                  <div className="md:col-span-2">
                    <Field label="Förklaring" value={question.explanation} onChange={(value) => updateQuiz(question.id, { explanation: value })} textarea />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'nano' && activeRole && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusPill tone={roleNanoParts.length >= 1 ? 'ok' : 'warn'}>{roleNanoParts.length} nanodelar</StatusPill>
              <button onClick={addNanoPart} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <i className="fa-solid fa-plus mr-2"></i>Lägg till nanodel
              </button>
            </div>
            {roleNanoParts.map((part, index) => (
              <div key={part.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-700">Nanodel {index + 1}</p>
                  <button
                    onClick={() => deleteNanoPart(part.id)}
                    className="rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600"
                  >
                    Ta bort
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Ämne" value={part.subject} onChange={(subject) => updateNanoPart(part.id, { subject })} />
                  <Field label="Föreslaget utskick" value={part.suggestedSendStep} onChange={(suggestedSendStep) => updateNanoPart(part.id, { suggestedSendStep })} helper="Exempel: Dag 1, Vecka 2, Efter modul 1." />
                  <div className="md:col-span-2">
                    <Field label="Kort innehåll" value={part.body} onChange={(body) => updateNanoPart(part.id, { body })} textarea />
                  </div>
                  <Field label="Call to action" value={part.cta} onChange={(cta) => updateNanoPart(part.id, { cta })} />
                  <Field label="Påminnelsetext" value={part.reminderText} onChange={(reminderText) => updateNanoPart(part.id, { reminderText })} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'email' && (
          <div className="space-y-5">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Förberett utkast, ej skickat. Den här versionen sparar mottagargrupper och mejltext lokalt med kursen.
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Ämnesradsmall"
                value={emailDraft.subjectTemplate}
                onChange={(subjectTemplate) => updateEmailDraft({ subjectTemplate })}
                helper="Du kan använda {{nanoSubject}}."
              />
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                <p className="font-bold text-slate-700 mb-1">Status</p>
                <p>Draft. Inga mejl skickas från prototypen.</p>
              </div>
              <div className="md:col-span-2">
                <Field label="Introtext" value={emailDraft.introText} onChange={(introText) => updateEmailDraft({ introText })} textarea />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-sm font-black text-slate-700">Mottagargrupper</p>
              <button onClick={addRecipientGroup} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <i className="fa-solid fa-plus mr-2"></i>Lägg till grupp
              </button>
            </div>

            {emailDraft.recipientGroups.map((group) => (
              <div key={group.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <StatusPill tone={group.emails.every((email) => !email.trim() || emailPattern.test(email.trim())) ? 'ok' : 'warn'}>
                    {group.emails.filter((email) => email.trim()).length} adresser
                  </StatusPill>
                  <button onClick={() => deleteRecipientGroup(group.id)} className="rounded-md border border-red-100 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600">
                    Ta bort
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Gruppnamn" value={group.label} onChange={(label) => updateRecipientGroup(group.id, { label })} />
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Rollkoppling</span>
                    <select
                      value={group.roleId || ''}
                      onChange={(event) => updateRecipientGroup(group.id, { roleId: event.target.value || undefined })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Ingen särskild roll</option>
                      {course.roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.title}</option>
                      ))}
                    </select>
                  </label>
                  <div className="md:col-span-2">
                    <Field
                      label="Mejladresser"
                      value={group.emails.join('\n')}
                      onChange={(value) => updateRecipientGroup(group.id, { emails: value.split(/\n|,|;/).map((email) => email.trim()).filter(Boolean) })}
                      textarea
                      helper="En adress per rad, eller separera med komma/semikolon."
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Förhandsvisning</p>
              <p className="text-sm font-bold text-slate-800">{emailDraft.subjectTemplate.replace('{{nanoSubject}}', course.nanoCourse?.[0]?.subject || 'Nanokurs')}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{emailDraft.introText}</p>
              {course.nanoCourse?.[0] && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-bold">{course.nanoCourse[0].subject}</p>
                  <p className="mt-1">{course.nanoCourse[0].body}</p>
                  <p className="mt-2 font-bold text-blue-700">{course.nanoCourse[0].cta}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            onClick={() => {
              setAdvancedOpen(!advancedOpen);
              setJsonText(JSON.stringify(course, null, 2));
              setJsonError('');
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <i className="fa-solid fa-code mr-2"></i>Avancerat JSON-läge
          </button>

          {advancedOpen && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-950 p-4">
              <textarea
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
                className="h-80 w-full rounded-lg border border-white/10 bg-slate-900 p-3 font-mono text-xs text-slate-100 outline-none focus:border-blue-300"
              />
              {jsonError && <div className="mt-3 whitespace-pre-wrap rounded-lg bg-red-500/20 p-3 text-xs text-red-100">{jsonError}</div>}
              <div className="mt-3 flex justify-end">
                <button onClick={importJson} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500">
                  Importera JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
