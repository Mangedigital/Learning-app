import type { Context } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const GEMINI_TIMEOUT_MS = 27_000;
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

type SseSender = (event: string, data: Record<string, unknown>) => void;

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const sseResponse = (work: (send: SseSender) => Promise<void>) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send: SseSender = (event, data) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        await work(send);
      } catch (error) {
        console.error("Course generation stream error:", error);
        send("error", {
          step: "stream",
          message: error instanceof Error ? error.message : "Okänt serverfel i kursgeneratorn.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};

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

const excerpt = (text: string, limit = 700) =>
  text.length > limit ? `${text.slice(0, limit)}...` : text;

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
    return sseResponse(async (send) => {
      send("error", { step: "received", message: "Källfilen saknar nödvändig metadata." });
    });
  }

  return sseResponse(async (send) => {
    const resolvedMimeType = inferMimeType(fileName, fileMimeType);
    const isTextSource = resolvedMimeType === "text/plain" || resolvedMimeType === "text/markdown";
    const sourceTextLength = typeof sourceText === "string" ? sourceText.length : 0;
    const fileBase64Length = typeof fileBase64 === "string" ? fileBase64.length : 0;
    const approximateFileBytes = fileBase64Length ? Math.round((fileBase64Length * 3) / 4) : sourceTextLength;

    send("received", {
      step: "received",
      message: "Källmetadata mottagen.",
      sourceTitle,
      fileName,
      fileMimeType,
      resolvedMimeType,
      fileBase64Length,
      sourceTextLength,
      approximateFileBytes,
    });

    if (!SUPPORTED_MIME_TYPES.has(resolvedMimeType)) {
      send("error", {
        step: "validated",
        message: `Filtypen stöds inte ännu. Använd ${friendlySupportedTypes()}.`,
        resolvedMimeType,
      });
      return;
    }

    if (isTextSource && typeof sourceText !== "string") {
      send("error", { step: "validated", message: "Textkällan kunde inte läsas av webbläsaren." });
      return;
    }

    if (!isTextSource && typeof fileBase64 !== "string") {
      send("error", { step: "validated", message: "Dokumentet kunde inte skickas till generatorn." });
      return;
    }

    const trimmedSourceText = typeof sourceText === "string" ? sourceText.trim().substring(0, MAX_TEXT_LENGTH) : "";
    if (isTextSource && trimmedSourceText.length < 50) {
      send("error", {
        step: "validated",
        message: "Textkällan är för kort för att skapa en mikrokurs.",
        sourceTextLength,
      });
      return;
    }

    if (!isTextSource && typeof fileBase64 === "string" && fileBase64.length > MAX_FILE_SIZE_BASE64) {
      send("error", {
        step: "validated",
        message: "Filen är för stor för prototypen. Testa en fil under cirka 6 MB.",
        fileBase64Length,
        maxFileSizeBase64: MAX_FILE_SIZE_BASE64,
      });
      return;
    }

    send("validated", {
      step: "validated",
      message: "Filtyp och storlek är godkända.",
      resolvedMimeType,
      inputMode: isTextSource ? "text" : "inline_data",
      trimmedSourceTextLength: trimmedSourceText.length,
      fileBase64Length,
    });

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

    send("calling_model", {
      step: "calling_model",
      message: "Gemini-anrop startar.",
      model: "gemini-2.5-flash",
      sourcePayloadMode: isTextSource ? "text" : "inline_data",
    });

    let heartbeatCount = 0;
    const heartbeat = setInterval(() => {
      heartbeatCount += 1;
      send("working", {
        step: "calling_model",
        message: "Gemini bearbetar källan och bygger kursutkastet.",
        elapsedSeconds: heartbeatCount * 5,
      });
    }, 5000);

    let response: Response;
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), GEMINI_TIMEOUT_MS);
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
        signal: abortController.signal,
      });
    } catch (error) {
      clearInterval(heartbeat);
      clearTimeout(timeout);
      console.error("Gemini course generation request failed:", error);
      const timedOut = error instanceof DOMException && error.name === "AbortError";
      send("error", {
        step: "calling_model",
        message: timedOut
          ? "Gemini hann inte skapa kursutkastet inom Netlifys gräns för synkrona funktioner. Använd en kortare källa eller flytta genereringen till en Background Function."
          : error instanceof Error ? error.message : "Gemini-anropet misslyckades innan svar mottogs.",
        timeoutMs: timedOut ? GEMINI_TIMEOUT_MS : undefined,
        sourcePayloadMode: isTextSource ? "text" : "inline_data",
        fileBase64Length,
        trimmedSourceTextLength: trimmedSourceText.length,
      });
      return;
    }
    clearInterval(heartbeat);
    clearTimeout(timeout);

    send("model_response", {
      step: "model_response",
      message: "Gemini-svar mottaget.",
      geminiStatus: response.status,
      geminiOk: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini course generation error:", response.status, errorText);
      send("error", {
        step: "model_response",
        message: `Gemini kunde inte skapa kursen (${response.status}): ${summarizeGeminiError(errorText)}`,
        geminiStatus: response.status,
        bodySummary: excerpt(errorText),
      });
      return;
    }

    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch (error) {
      console.error("Gemini response JSON parse error:", error);
      send("error", {
        step: "model_response",
        message: "Gemini-svaret kunde inte läsas som JSON.",
        geminiStatus: response.status,
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || typeof text !== "string") {
      send("error", {
        step: "model_response",
        message: "Gemini returnerade inget kursutkast.",
        geminiStatus: response.status,
        responseKeys: Object.keys(data),
      });
      return;
    }

    send("parsing", {
      step: "parsing",
      message: "Tolkar kursutkastets JSON.",
      responseTextLength: text.length,
    });

    let course: unknown;
    try {
      course = extractJsonObject(text);
    } catch (error) {
      console.error("Course generation JSON extraction error:", error);
      send("error", {
        step: "parsing",
        message: "Kursutkastet kunde inte tolkas som giltig JSON.",
        responseTextLength: text.length,
        responseStart: excerpt(text.slice(0, 1000), 1000),
        responseEnd: excerpt(text.slice(-1000), 1000),
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    send("complete", {
      step: "complete",
      message: "Kursutkastet är klart för granskning.",
      course,
    });
  });
};

export const config = {
  path: "/api/generate-course",
};
