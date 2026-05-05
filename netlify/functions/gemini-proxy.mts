import type { Context } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_REFLECTION_LENGTH = 2000;
const MIN_REFLECTION_LENGTH = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const ALLOWED_ROLES = new Set([
  "HR-specialist/Rekryterare",
  "Utvecklingsledare",
  "Chef",
]);

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const jsonResponse = (body: Record<string, unknown>, status: number, headers?: HeadersInit) => {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json");

  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
};

const getClientIp = (req: Request) =>
  req.headers.get("x-nf-client-connection-ip") ||
  req.headers.get("client-ip") ||
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "unknown";

const getAllowedOrigins = (req: Request) => {
  const configuredOrigins = process.env.ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) return configuredOrigins;

  try {
    return [new URL(req.url).origin];
  } catch {
    return [];
  }
};

const isAllowedOrigin = (req: Request) => {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  return getAllowedOrigins(req).includes(origin);
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
};

export default async (req: Request, _context: Context) => {
  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!isAllowedOrigin(req)) {
    return jsonResponse({ error: "Forbidden origin" }, 403);
  }

  if (!req.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse({ error: "Content-Type must be application/json" }, 415);
  }

  if (isRateLimited(getClientIp(req))) {
    return jsonResponse(
      { error: "Too many requests" },
      429,
      { "Retry-After": String(RATE_LIMIT_WINDOW_MS / 1000) }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "API key not configured on server" }, 500);
  }

  let body: { reflection?: unknown; role?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { reflection, role } = body;
  if (typeof reflection !== "string" || typeof role !== "string") {
    return jsonResponse({ error: "Missing or invalid reflection or role" }, 400);
  }

  const sanitizedReflection = reflection.trim().substring(0, MAX_REFLECTION_LENGTH);
  if (sanitizedReflection.length < MIN_REFLECTION_LENGTH) {
    return jsonResponse({ error: "Reflection is too short" }, 400);
  }

  if (!ALLOWED_ROLES.has(role)) {
    return jsonResponse({ error: "Invalid role" }, 400);
  }

  const systemInstruction = `Du är en Sokratisk coach för AI-etik i Göteborgs Stad. Din uppgift är att ge feedback på anställdas reflektioner kring AI-användning baserat på stadens nio gyllene regler och Förskoleförvaltningens AI-strategi.

LOGIK FÖR FEEDBACK:
1. Om svaret är oförsiktigt eller litar för mycket på AI (t.ex. "Jag litar på AI:ns urval"): Ställ en kritisk fråga om transparens och ansvar utifrån Regel 4 & 5.
2. Om svaret är tveksamt: Bekräfta det som är bra, peka på en specifik risk i Förskoleförvaltningens AI-strategi och ställ en vägledande följdfråga.
3. Om svaret är korrekt och underbyggt: Fira framgången! Understryk de viktigaste delarna (must-know) och ge en uppmuntrande tanke för framtiden.

KRAV PÅ UTFORMNING:
- Svara alltid på svenska.
- Tonen ska vara coachande, pedagogisk och uppmuntrande.
- Håll svaret kortfattat, max 4 meningar.
- Fokusera på mänsklig insyn, ansvar och transparens.`;

  const prompt = `Här är en reflektion från en person i rollen "${role}":\n\n"${sanitizedReflection}"\n\nGe coachande feedback baserat på dina instruktioner.`;

  const geminiBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
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
      console.error("Gemini API error:", response.status, errorText);
      return jsonResponse({ error: "Gemini API request failed" }, 502);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Kunde inte generera feedback just nu.";

    return jsonResponse({ text }, 200);
  } catch (error) {
    console.error("Proxy error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config = {
  path: "/api/gemini-proxy",
};
