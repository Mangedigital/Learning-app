const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_FILE_UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files";
const MAX_FILE_SIZE_BASE64 = 8_000_000;
const MAX_TEXT_LENGTH = 120_000;
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
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
const ALLOWED_ROLES = [
  "HR-specialist/Rekryterare",
  "Utvecklingsledare",
  "Chef",
];

export const friendlySupportedTypes = () => "PDF, Word (.doc/.docx), Markdown (.md) eller text (.txt)";

export const inferMimeType = (fileName, fileMimeType) => {
  if (SUPPORTED_MIME_TYPES.has(fileMimeType)) return fileMimeType;
  const lowerName = fileName.toLowerCase();
  const extension = Object.keys(SUPPORTED_EXTENSIONS).find((candidate) => lowerName.endsWith(candidate));
  return extension ? SUPPORTED_EXTENSIONS[extension] : fileMimeType;
};

export const isTextMimeType = (mimeType) => mimeType === "text/plain" || mimeType === "text/markdown";

export const validateGenerationInput = (body) => {
  const { sourceTitle, fileName, fileMimeType, fileBase64, sourceText } = body;
  if (
    typeof sourceTitle !== "string" ||
    typeof fileName !== "string" ||
    typeof fileMimeType !== "string"
  ) {
    throw new Error("Källfilen saknar nödvändig metadata.");
  }

  const resolvedMimeType = inferMimeType(fileName, fileMimeType);
  if (!SUPPORTED_MIME_TYPES.has(resolvedMimeType)) {
    throw new Error(`Filtypen stöds inte ännu. Använd ${friendlySupportedTypes()}.`);
  }

  const isTextSource = isTextMimeType(resolvedMimeType);
  if (isTextSource && typeof sourceText !== "string") {
    throw new Error("Textkällan kunde inte läsas av webbläsaren.");
  }

  if (!isTextSource && typeof fileBase64 !== "string") {
    throw new Error("Dokumentet kunde inte skickas till generatorn.");
  }

  const trimmedSourceText = typeof sourceText === "string" ? sourceText.trim().substring(0, MAX_TEXT_LENGTH) : "";
  if (isTextSource && trimmedSourceText.length < 50) {
    throw new Error("Textkällan är för kort för att skapa en mikrokurs.");
  }

  if (!isTextSource && typeof fileBase64 === "string" && fileBase64.length > MAX_FILE_SIZE_BASE64) {
    throw new Error("Filen är för stor för prototypen. Testa en fil under cirka 6 MB.");
  }

  return {
    sourceTitle,
    fileName,
    fileMimeType,
    fileBase64,
    sourceText,
    resolvedMimeType,
    isTextSource,
    trimmedSourceText,
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

const buildInstructions = ({ sourceTitle, fileName }) => {
  const systemInstruction = `Du skapar svenska mikrolärandekurser från en källfil.
Returnera endast strikt JSON utan markdown. Inga kommentarer.
Kursen ska vara ett faktakontrollerbart utkast som en administratör granskar innan publicering.
Använd endast dessa roller: ${ALLOWED_ROLES.join(", ")}.
Skapa samma struktur för alla roller:
- 9 regler/principer från källan
- 3 moduler: matching, reflection, quiz
- minst 2 matching-scenarier per roll
- 1 reflektionsscenario per roll
- 5 sant/falskt quizfrågor per roll
Alla scenarier och quizförklaringar ska vara korta, praktiska och källnära.`;

  const prompt = `Skapa ett MicroCourse JSON-objekt från källan "${sourceTitle}".
JSON-format:
{
  "id": "url-vanlig-id",
  "title": "kort kurstitel",
  "description": "kort beskrivning",
  "sourceTitle": "${sourceTitle}",
  "sourceFileName": "${fileName}",
  "createdAt": "${new Date().toISOString()}",
  "status": "draft",
  "roles": ["HR-specialist/Rekryterare","Utvecklingsledare","Chef"],
  "rules": [{"id":1,"title":"...","content":"..."}],
  "modules": [
    {"id":"1.1","title":"Risk-detektiven","description":"...","type":"matching","metadata":{"role":["HR-specialist/Rekryterare","Utvecklingsledare","Chef"],"level":1,"category":"Etik","durationMinutes":10}},
    {"id":"1.2","title":"Människan i loopen","description":"...","type":"reflection","metadata":{"role":["HR-specialist/Rekryterare","Utvecklingsledare","Chef"],"level":1,"category":"Ansvar","durationMinutes":15}},
    {"id":"1.3","title":"Gråzons-Quiz","description":"...","type":"quiz","metadata":{"role":["HR-specialist/Rekryterare","Utvecklingsledare","Chef"],"level":1,"category":"Juridik","durationMinutes":5}}
  ],
  "matchingScenarios": [{"id":"hr1","role":"HR-specialist/Rekryterare","text":"...","correctRuleId":1,"explanation":"...","sourceQuote":"Källa: ${sourceTitle}","clue":"...","socraticQuestion":"...","options":[1,2,3,4]}],
  "roleScenarios": {"HR-specialist/Rekryterare":"...","Utvecklingsledare":"...","Chef":"..."},
  "quizQuestions": [{"id":"hr-q1","role":"HR-specialist/Rekryterare","ruleIds":[1,6],"question":"...","answer":true,"explanation":"..."}],
  "resources": []
}`;

  return { systemInstruction, prompt };
};

const uploadGeminiFile = async ({ apiKey, fileName, mimeType, fileBase64 }) => {
  const bytes = Buffer.from(fileBase64, "base64");
  const startResponse = await fetch(GEMINI_FILE_UPLOAD_URL, {
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
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`Gemini File API kunde inte starta uppladdningen (${startResponse.status}): ${summarizeGeminiError(errorText)}`);
  }

  const uploadUrl = startResponse.headers.get("x-goog-upload-url");
  if (!uploadUrl) {
    throw new Error("Gemini File API returnerade ingen upload URL.");
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: bytes,
  });

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

  return { fileUri, mimeType: uploadedMimeType };
};

export const generateCourseWithGemini = async ({ apiKey, input, useFileApi = false }) => {
  const { systemInstruction, prompt } = buildInstructions(input);
  let sourcePart;

  if (input.isTextSource) {
    sourcePart = { text: `Källtext:\n\n${input.trimmedSourceText}` };
  } else if (useFileApi) {
    const uploadedFile = await uploadGeminiFile({
      apiKey,
      fileName: input.fileName,
      mimeType: input.resolvedMimeType,
      fileBase64: input.fileBase64,
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

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
        temperature: 0.2,
        maxOutputTokens: 8192,
        response_mime_type: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini kunde inte skapa kursen (${response.status}): ${summarizeGeminiError(errorText)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returnerade inget kursutkast.");
  }

  return {
    course: extractJsonObject(text),
    responseTextLength: text.length,
  };
};
