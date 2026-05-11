import type { Context } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_FILE_SIZE_BASE64 = 8_000_000;
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
  };

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { sourceTitle, fileName, fileMimeType, fileBase64 } = body;
  if (
    typeof sourceTitle !== "string" ||
    typeof fileName !== "string" ||
    typeof fileMimeType !== "string" ||
    typeof fileBase64 !== "string"
  ) {
    return jsonResponse({ error: "Missing or invalid PDF payload" }, 400);
  }

  if (fileMimeType !== "application/pdf") {
    return jsonResponse({ error: "Only PDF files are supported" }, 400);
  }

  if (fileBase64.length > MAX_FILE_SIZE_BASE64) {
    return jsonResponse({ error: "PDF is too large for this prototype" }, 413);
  }

  const systemInstruction = `Du skapar svenska mikrolärandekurser från en PDF-källa.
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

  const prompt = `Skapa ett MicroCourse JSON-objekt från PDF-källan "${sourceTitle}".
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

  const geminiBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: fileMimeType,
              data: fileBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
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
      return jsonResponse({ error: "Gemini API request failed" }, 502);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return jsonResponse({ error: "No generated course returned" }, 502);

    const course = extractJsonObject(text);
    return jsonResponse({ course }, 200);
  } catch (error) {
    console.error("Course generation error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config = {
  path: "/api/generate-course",
};
