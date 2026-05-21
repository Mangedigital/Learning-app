import type { Context } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_FILE_SIZE_BASE64 = 8_000_000;
const MAX_TEXT_LENGTH = 120_000;
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/plain",
]);
const SUPPORTED_EXTENSIONS: Record<string, string> = {
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

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const extractJsonObject = (text: string) => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON object found");
  return JSON.parse(cleaned.slice(start, end + 1));
};

const summarizeGeminiError = (errorText: string) => {
  try {
    const parsed = JSON.parse(errorText);
    const message = parsed?.error?.message;
    return typeof message === "string" ? message : errorText.slice(0, 300);
  } catch {
    return errorText.slice(0, 300);
  }
};

const inferMimeType = (fileName: string, fileMimeType: string) => {
  if (SUPPORTED_MIME_TYPES.has(fileMimeType)) return fileMimeType;
  const lowerName = fileName.toLowerCase();
  const extension = Object.keys(SUPPORTED_EXTENSIONS).find((candidate) => lowerName.endsWith(candidate));
  return extension ? SUPPORTED_EXTENSIONS[extension] : fileMimeType;
};

const friendlySupportedTypes = () => "PDF, Word (.doc/.docx), Markdown (.md) eller text (.txt)";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "Content-Type must be application/json" }, 415);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "API key not configured on server" }, 500);
  }

  let body: {
    sourceTitle?: unknown;
    fileName?: unknown;
    fileMimeType?: unknown;
    fileBase64?: unknown;
    sourceText?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { sourceTitle, fileName, fileMimeType, fileBase64, sourceText } = body;
  if (
    typeof sourceTitle !== "string" ||
    typeof fileName !== "string" ||
    typeof fileMimeType !== "string"
  ) {
    return jsonResponse({ error: "Källfilen saknar nödvändig metadata." }, 400);
  }

  const resolvedMimeType = inferMimeType(fileName, fileMimeType);
  if (!SUPPORTED_MIME_TYPES.has(resolvedMimeType)) {
    return jsonResponse({ error: `Filtypen stöds inte ännu. Använd ${friendlySupportedTypes()}.` }, 400);
  }

  const isTextSource = resolvedMimeType === "text/plain" || resolvedMimeType === "text/markdown";
  if (isTextSource && typeof sourceText !== "string") {
    return jsonResponse({ error: "Textkällan kunde inte läsas av webbläsaren." }, 400);
  }

  if (!isTextSource && typeof fileBase64 !== "string") {
    return jsonResponse({ error: "Dokumentet kunde inte skickas till generatorn." }, 400);
  }

  const trimmedSourceText = typeof sourceText === "string" ? sourceText.trim().substring(0, MAX_TEXT_LENGTH) : "";
  if (isTextSource && trimmedSourceText.length < 50) {
    return jsonResponse({ error: "Textkällan är för kort för att skapa en mikrokurs." }, 400);
  }

  if (!isTextSource && typeof fileBase64 === "string" && fileBase64.length > MAX_FILE_SIZE_BASE64) {
    return jsonResponse({ error: "Filen är för stor för prototypen. Testa en fil under cirka 6 MB." }, 413);
  }

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

  const sourcePart = isTextSource
    ? { text: `Källtext:\n\n${trimmedSourceText}` }
    : {
        inline_data: {
          mime_type: resolvedMimeType,
          data: fileBase64 as string,
        },
      };

  const geminiBody = {
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
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini course generation error:", response.status, errorText);
      return jsonResponse(
        { error: `Gemini kunde inte skapa kursen (${response.status}): ${summarizeGeminiError(errorText)}` },
        502
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return jsonResponse({ error: "Gemini returnerade inget kursutkast." }, 502);

    const course = extractJsonObject(text);
    return jsonResponse({ course }, 200);
  } catch (error) {
    console.error("Course generation error:", error);
    return jsonResponse({ error: "Kursutkastet kunde inte tolkas som giltig JSON." }, 500);
  }
};

export const config = {
  path: "/api/generate-course",
};
