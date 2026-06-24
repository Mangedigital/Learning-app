const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_FILE_UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const GEMINI_RETRY_DELAYS_MS = [1_500, 4_000, 8_000];
const MAX_FILE_SIZE_BASE64 = 8_000_000;
const MAX_TEXT_LENGTH = 120_000;
const MIN_TEXT_LENGTH = 50;
const WEAK_PDF_CHARS_PER_PAGE = 80;
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/plain",
]);
const SUPPORTED_EXTENSIONS = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".md": "text/markdown",
  ".txt": "text/plain",
};
export const friendlySupportedTypes = () => "PDF, Word (.docx), Markdown (.md) eller text (.txt). Äldre .doc behöver sparas som .docx eller PDF.";

export const inferMimeType = (fileName, fileMimeType) => {
  if (SUPPORTED_MIME_TYPES.has(fileMimeType)) return fileMimeType;
  const lowerName = fileName.toLowerCase();
  const extension = Object.keys(SUPPORTED_EXTENSIONS).find((candidate) => lowerName.endsWith(candidate));
  return extension ? SUPPORTED_EXTENSIONS[extension] : fileMimeType;
};

export const isTextMimeType = (mimeType) => mimeType === "text/plain" || mimeType === "text/markdown";
export const isDocxMimeType = (mimeType) => mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const isPdfMimeType = (mimeType) => mimeType === "application/pdf";

const hasStrongExtractedText = (text, extraction, resolvedMimeType) => {
  const length = typeof text === "string" ? text.trim().length : 0;
  if (length < MIN_TEXT_LENGTH) return false;
  if (
    isPdfMimeType(resolvedMimeType) &&
    extraction?.pageCount &&
    length / extraction.pageCount < WEAK_PDF_CHARS_PER_PAGE
  ) {
    return false;
  }
  return true;
};

export const validateGenerationInput = (body) => {
  const { sourceTitle, roleCount, fileName, fileMimeType, fileBase64, sourceText, extraction, documentFallback } = body;
  if (
    typeof sourceTitle !== "string" ||
    typeof fileName !== "string" ||
    typeof fileMimeType !== "string"
  ) {
    throw new Error("Källfilen saknar nödvändig metadata.");
  }

  const resolvedMimeType = inferMimeType(fileName, fileMimeType);
  if (resolvedMimeType === "application/msword") {
    throw new Error("Äldre Word-format (.doc) stöds inte i v1. Spara dokumentet som .docx eller PDF.");
  }

  if (!SUPPORTED_MIME_TYPES.has(resolvedMimeType)) {
    throw new Error(`Filtypen stöds inte ännu. Använd ${friendlySupportedTypes()}.`);
  }

  const trimmedSourceText = typeof sourceText === "string" ? sourceText.trim().substring(0, MAX_TEXT_LENGTH) : "";
  const hasStrongText = hasStrongExtractedText(trimmedSourceText, extraction, resolvedMimeType);
  const isTextSource = isTextMimeType(resolvedMimeType) || isDocxMimeType(resolvedMimeType) || hasStrongText;

  if ((isTextMimeType(resolvedMimeType) || isDocxMimeType(resolvedMimeType)) && typeof sourceText !== "string") {
    throw new Error("Dokumenttexten kunde inte läsas.");
  }

  if (!isTextSource && typeof fileBase64 !== "string") {
    const diagnostics = extraction?.diagnostics ? ` Diagnostik: ${JSON.stringify(extraction.diagnostics).slice(0, 400)}` : "";
    throw new Error(`Dokumentet kunde inte skickas till generatorn och ingen tillräcklig text kunde extraheras.${diagnostics}`);
  }

  if (isTextSource && trimmedSourceText.length < 50) {
    throw new Error("Dokumenttexten är för kort för att skapa en mikrokurs.");
  }

  if (!isTextSource && typeof fileBase64 === "string" && fileBase64.length > MAX_FILE_SIZE_BASE64) {
    throw new Error("Filen är för stor för prototypen. Testa en fil under cirka 6 MB.");
  }

  const normalizedRoleCount = [1, 2, 3, 4].includes(Number(roleCount)) ? Number(roleCount) : 3;

  return {
    sourceTitle,
    roleCount: normalizedRoleCount,
    fileName,
    fileMimeType,
    fileBase64,
    sourceText,
    resolvedMimeType,
    isTextSource,
    trimmedSourceText,
    extraction,
    documentFallback,
    fileBase64Length: typeof fileBase64 === "string" ? fileBase64.length : 0,
    sourceTextLength: typeof sourceText === "string" ? sourceText.length : 0,
  };
};

export const extractJsonObject = (text) => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON object found");
  return JSON.parse(cleaned.slice(start, end + 1));
};

export const summarizeGeminiError = (errorText) => {
  try {
    const parsed = JSON.parse(errorText);
    const message = parsed?.error?.message;
    return typeof message === "string" ? message : errorText.slice(0, 300);
  } catch {
    return errorText.slice(0, 300);
  }
};

export const excerpt = (text, limit = 700) =>
  text.length > limit ? `${text.slice(0, limit)}...` : text;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status) => status === 429 || status === 503 || status >= 500;

const fetchWithRetry = async (label, requestFactory, onProgress) => {
  let lastResponse;

  for (let attempt = 0; attempt <= GEMINI_RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await requestFactory();
    lastResponse = response;

    if (!isRetryableStatus(response.status) || attempt === GEMINI_RETRY_DELAYS_MS.length) {
      return response;
    }

    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
    const delayMs = Number.isFinite(retryAfterSeconds)
      ? Math.max(1_000, retryAfterSeconds * 1000)
      : GEMINI_RETRY_DELAYS_MS[attempt];

    await onProgress?.({
      stage: "retrying",
      message: `${label} fick ${response.status}. Försöker igen om ${Math.round(delayMs / 1000)} sekunder.`,
      attempt: attempt + 1,
      status: response.status,
    });

    await wait(delayMs);
  }

  return lastResponse;
};

const buildInstructions = ({ sourceTitle, fileName, roleCount = 3 }) => {
  const roleIds = Array.from({ length: roleCount }, (_, index) => `roll-${index + 1}`);
  const systemInstruction = `Du skapar svenska mikrolärandekurser från en källfil.
Returnera endast strikt JSON utan markdown. Inga kommentarer.
Kursen ska vara ett faktakontrollerbart utkast som en administratör granskar innan publicering.
Föreslå exakt ${roleCount} roller som är relevanta för källan. Roller ska vara specifika för källans målgrupper, inte fasta standardroller.
Varje roll ska ha id, title, description, focus och FontAwesome-ikon i formatet fa-...
Skapa samma struktur för alla roller:
- 9 regler/principer från källan
- 3 moduler: matching, reflection, quiz
- minst 2 matching-scenarier per roll
- 1 reflektionsscenario per roll
- 5 sant/falskt quizfrågor per roll
- minst 1 rollspecifik nanokursdel per roll med ämne, kort innehåll, CTA, föreslaget utskickssteg och påminnelsetext
Koppla allt rollinnehåll via roleId. Använd exakt samma roleId i roles, matchingScenarios, roleScenarios och quizQuestions.
Alla scenarier, quizförklaringar och nanokursdelar ska vara korta, praktiska och källnära.
Mejlkampanjen ska vara ett utkast. Den ska aldrig påstå att mejl redan har skickats.`;

  const prompt = `Skapa ett MicroCourse JSON-objekt från källan "${sourceTitle}".
JSON-format:
{
  "id": "url-vanlig-id",
  "title": "kort kurstitel",
  "description": "kort beskrivning",
  "sourceTitle": "${sourceTitle}",
  "sourceFileName": "${fileName}",
  "roleCount": ${roleCount},
  "createdAt": "${new Date().toISOString()}",
  "status": "draft",
  "roles": [{"id":"roll-1","title":"...","description":"...","focus":"...","icon":"fa-user-tie"}],
  "rules": [{"id":1,"title":"...","content":"..."}],
  "modules": [
    {"id":"1.1","title":"Risk-detektiven","description":"...","type":"matching","metadata":{"roleIds":${JSON.stringify(roleIds)},"level":1,"category":"Etik","durationMinutes":10}},
    {"id":"1.2","title":"Människan i loopen","description":"...","type":"reflection","metadata":{"roleIds":${JSON.stringify(roleIds)},"level":1,"category":"Ansvar","durationMinutes":15}},
    {"id":"1.3","title":"Gråzons-Quiz","description":"...","type":"quiz","metadata":{"roleIds":${JSON.stringify(roleIds)},"level":1,"category":"Juridik","durationMinutes":5}}
  ],
  "matchingScenarios": [{"id":"roll-1-case-1","roleId":"roll-1","text":"...","correctRuleId":1,"explanation":"...","sourceQuote":"Källa: ${sourceTitle}","clue":"...","socraticQuestion":"...","options":[1,2,3,4]}],
  "roleScenarios": {"roll-1":"..."},
  "quizQuestions": [{"id":"roll-1-q1","roleId":"roll-1","ruleIds":[1,6],"question":"...","answer":true,"explanation":"..."}],
  "nanoCourse": [{"id":"roll-1-nano-1","roleId":"roll-1","subject":"...","body":"...","cta":"...","suggestedSendStep":"Dag 1","reminderText":"..."}],
  "emailCampaignDraft": {"status":"draft","subjectTemplate":"{{nanoSubject}}","introText":"...","recipientGroups":[]},
  "resources": []
}`;

  return { systemInstruction, prompt };
};

const generateJsonWithModelFallback = async ({ apiKey, label, prompt, systemInstruction, sourcePart, onProgress }) => {
  let response;
  let selectedModel = GEMINI_MODELS[0];

  for (const model of GEMINI_MODELS) {
    selectedModel = model;
    await onProgress?.({
      stage: "generating_course",
      message: `${label} med ${model}.`,
      model,
    });

    response = await fetchWithRetry(label, () =>
      fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              parts: [
                { text: prompt },
                sourcePart,
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 16384,
            response_mime_type: "application/json",
          },
        }),
      }),
      onProgress
    );

    if (!isRetryableStatus(response.status) || model === GEMINI_MODELS[GEMINI_MODELS.length - 1]) {
      break;
    }

    await onProgress?.({
      stage: "retrying",
      message: `${model} är fortfarande otillgänglig (${response.status}). Växlar till nästa Gemini-modell.`,
      status: response.status,
      model,
    });
  }

  if (!response) {
    throw new Error("Gemini-anropet kunde inte startas.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini kunde inte skapa kursen (${response.status}): ${summarizeGeminiError(errorText)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returnerade inget kursutkast.");
  }

  return { text, model: selectedModel };
};

const repairCourseJson = async ({ apiKey, text, parseError, onProgress }) => {
  await onProgress?.({
    stage: "repairing_json",
    message: "Gemini-svaret var inte strikt JSON. Försöker reparera JSON-utkastet.",
    responseTextLength: text.length,
  });

  const repairPrompt = `Rätta följande nästan-giltiga JSON till strikt giltig JSON.
Returnera endast JSON. Bevara alla fält och värden. Lägg inte till markdown.
Parsefel: ${parseError instanceof Error ? parseError.message : String(parseError)}

JSON:
${text}`;

  const repaired = await generateJsonWithModelFallback({
    apiKey,
    label: "Reparerar kurs-JSON",
    prompt: repairPrompt,
    systemInstruction: "Du reparerar JSON. Returnera endast strikt giltig JSON utan markdown.",
    sourcePart: { text: "Returnera ett enda giltigt JSON-objekt." },
    onProgress,
  });

  return {
    course: extractJsonObject(repaired.text),
    responseTextLength: repaired.text.length,
    model: repaired.model,
    repaired: true,
  };
};

const generateJsonWithOpenAiCompatibleProvider = async ({
  provider,
  apiKey,
  model,
  apiUrl,
  prompt,
  systemInstruction,
  sourceText,
  onProgress,
}) => {
  await onProgress?.({
    stage: "generating_course",
    message: `${provider} skapar mikrokursutkastet med ${model}.`,
    provider,
    model,
  });

  const response = await fetchWithRetry(`${provider} skapar mikrokursutkastet`, () =>
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(provider === "openrouter" ? {
          "HTTP-Referer": process.env.URL || "https://koalearning.netlify.app",
          "X-Title": "Källbaserad mikrokursgenerator",
        } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `${prompt}\n\nKälltext:\n\n${sourceText}` },
        ],
        temperature: 0.1,
        max_tokens: 16384,
        response_format: { type: "json_object" },
      }),
    }),
    onProgress
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider} kunde inte skapa kursen (${response.status}): ${summarizeGeminiError(errorText)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") {
    throw new Error(`${provider} returnerade inget kursutkast.`);
  }

  return { text, model, provider };
};

const finalizeGeneratedCourse = async ({ text, model, provider = "gemini", apiKey, onProgress }) => {
  await onProgress?.({
    stage: "parsing_response",
    message: "Tolkar AI-svaret som kurs-JSON.",
    responseTextLength: text.length,
    model,
    provider,
  });

  try {
    return {
      course: extractJsonObject(text),
      responseTextLength: text.length,
      model,
      provider,
    };
  } catch (error) {
    if (!apiKey) {
      throw new Error(`AI-svaret kunde inte tolkas som kurs-JSON och GEMINI_API_KEY saknas för JSON-reparation. ${error instanceof Error ? error.message : ""}`);
    }

    const repaired = await repairCourseJson({
      apiKey,
      text,
      parseError: error,
      onProgress,
    });
    return {
      ...repaired,
      provider,
    };
  }
};

const uploadGeminiFile = async ({ apiKey, fileName, mimeType, fileBase64, onProgress }) => {
  const bytes = Buffer.from(fileBase64, "base64");
  await onProgress?.({
    stage: "uploading_file",
    message: "Startar uppladdning till Gemini File API.",
    byteLength: bytes.byteLength,
    mimeType,
  });

  const startResponse = await fetchWithRetry("Gemini File API start", () =>
    fetch(GEMINI_FILE_UPLOAD_URL, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(bytes.byteLength),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { display_name: fileName } }),
    }),
    onProgress
  );

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`Gemini File API kunde inte starta uppladdningen (${startResponse.status}): ${summarizeGeminiError(errorText)}`);
  }

  const uploadUrl = startResponse.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    throw new Error("Gemini File API returnerade ingen upload URL.");
  }

  await onProgress?.({
    stage: "uploading_file",
    message: "Skickar dokumentbytes till Gemini File API.",
    byteLength: bytes.byteLength,
  });

  const uploadResponse = await fetchWithRetry("Gemini File API upload", () =>
    fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": String(bytes.byteLength),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
      },
      body: bytes,
    }),
    onProgress
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Gemini File API kunde inte slutföra uppladdningen (${uploadResponse.status}): ${summarizeGeminiError(errorText)}`);
  }

  const uploadData = await uploadResponse.json();
  const fileUri = uploadData?.file?.uri;
  const uploadedMimeType = uploadData?.file?.mimeType || mimeType;
  if (!fileUri) {
    throw new Error("Gemini File API returnerade ingen file_uri.");
  }

  await onProgress?.({
    stage: "file_uploaded",
    message: "Källfilen är uppladdad till Gemini File API.",
    mimeType: uploadedMimeType,
  });

  return { fileUri, mimeType: uploadedMimeType };
};

export const generateCourseWithGemini = async ({ apiKey, input, useFileApi = false, onProgress }) => {
  const { systemInstruction, prompt } = buildInstructions(input);
  let sourcePart;

  if (input.isTextSource) {
    await onProgress?.({
      stage: "preparing_text",
      message: "Förbereder textkälla för Gemini.",
      textLength: input.trimmedSourceText.length,
    });
    sourcePart = { text: `Källtext:\n\n${input.trimmedSourceText}` };
  } else if (useFileApi) {
    if (input.resolvedMimeType !== "application/pdf") {
      throw new Error("Gemini File API stödjer inte Word-filer direkt just nu. Spara dokumentet som PDF, Markdown eller text och försök igen.");
    }

    const uploadedFile = await uploadGeminiFile({
      apiKey,
      fileName: input.fileName,
      mimeType: input.resolvedMimeType,
      fileBase64: input.fileBase64,
      onProgress,
    });
    sourcePart = {
      file_data: {
        mime_type: uploadedFile.mimeType,
        file_uri: uploadedFile.fileUri,
      },
    };
  } else {
    sourcePart = {
      inline_data: {
        mime_type: input.resolvedMimeType,
        data: input.fileBase64,
      },
    };
  }

  const generated = await generateJsonWithModelFallback({
    apiKey,
    label: "Gemini skapar mikrokursutkastet",
    prompt,
    systemInstruction,
    sourcePart,
    onProgress,
  });

  return finalizeGeneratedCourse({
    text: generated.text,
    model: generated.model,
    provider: "gemini",
    apiKey,
    onProgress,
  });
};

const getProviderPreference = () => {
  const provider = (process.env.COURSE_AI_PROVIDER || "gemini").toLowerCase();
  return ["gemini", "openrouter", "nvidia"].includes(provider) ? provider : "gemini";
};

const getFallbackProvider = () => {
  const provider = (process.env.COURSE_AI_FALLBACK_PROVIDER || "gemini").toLowerCase();
  return ["gemini", "openrouter", "nvidia"].includes(provider) ? provider : "gemini";
};

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} är inte konfigurerad på servern.`);
  return value;
};

const generateCourseWithOpenRouter = async ({ input, onProgress }) => {
  const { systemInstruction, prompt } = buildInstructions(input);
  const generated = await generateJsonWithOpenAiCompatibleProvider({
    provider: "openrouter",
    apiKey: requireEnv("OPENROUTER_API_KEY"),
    model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
    apiUrl: OPENROUTER_API_URL,
    prompt,
    systemInstruction,
    sourceText: input.trimmedSourceText,
    onProgress,
  });

  return finalizeGeneratedCourse({
    text: generated.text,
    model: generated.model,
    provider: "openrouter",
    apiKey: process.env.GEMINI_API_KEY,
    onProgress,
  });
};

const generateCourseWithNvidia = async ({ input, onProgress }) => {
  const { systemInstruction, prompt } = buildInstructions(input);
  const generated = await generateJsonWithOpenAiCompatibleProvider({
    provider: "nvidia",
    apiKey: requireEnv("NVIDIA_API_KEY"),
    model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    apiUrl: NVIDIA_API_URL,
    prompt,
    systemInstruction,
    sourceText: input.trimmedSourceText,
    onProgress,
  });

  return finalizeGeneratedCourse({
    text: generated.text,
    model: generated.model,
    provider: "nvidia",
    apiKey: process.env.GEMINI_API_KEY,
    onProgress,
  });
};

const generateCourseWithSelectedProvider = async ({ provider, input, onProgress }) => {
  if (provider === "openrouter") return generateCourseWithOpenRouter({ input, onProgress });
  if (provider === "nvidia") return generateCourseWithNvidia({ input, onProgress });

  return generateCourseWithGemini({
    apiKey: requireEnv("GEMINI_API_KEY"),
    input,
    useFileApi: !input.isTextSource,
    onProgress,
  });
};

export const generateCourse = async ({ input, onProgress }) => {
  const provider = getProviderPreference();
  const fallbackProvider = getFallbackProvider();

  if (!input.isTextSource && provider !== "gemini") {
    await onProgress?.({
      stage: "using_document_fallback",
      message: "PDF-texten var otillräcklig. Använder Gemini File API som dokumentfallback.",
      provider: "gemini",
      requestedProvider: provider,
    });
    return generateCourseWithSelectedProvider({ provider: "gemini", input, onProgress });
  }

  try {
    return await generateCourseWithSelectedProvider({ provider, input, onProgress });
  } catch (error) {
    if (fallbackProvider === provider) throw error;

    await onProgress?.({
      stage: "provider_fallback",
      message: `${provider} misslyckades. Försöker med ${fallbackProvider}.`,
      provider,
      fallbackProvider,
      error: error instanceof Error ? error.message : "Okänt provider-fel.",
    });

    return generateCourseWithSelectedProvider({ provider: fallbackProvider, input, onProgress });
  }
};
