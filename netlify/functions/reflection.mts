import type { Context } from "@netlify/functions";

// OpenRouter – byt modell här vid behov. Vald för: snabb, billig, stabil, bra på kort svensk pedagogisk text.
const OPENROUTER_MODEL = "openai/gpt-4o-mini";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const MAX_REFLECTION_LENGTH = 2000;
const MIN_REFLECTION_LENGTH = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
// Höjd från 10 till 50 för att klara ~20 användare bakom samma publika IP under test.
// OBS: In-memory Map är endast best-effort i serverless – varje instans har egen Map och nollställs vid cold start.
// För detta test är det tillräckligt; ingen Redis/extern tjänst införs.
const RATE_LIMIT_MAX_REQUESTS = 50;
const OPENROUTER_TIMEOUT_MS = 15_000;

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

  const apiKey = process.env.OPENROUTER_API_KEY;
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

  // Systemprompt med explicit injektion av de 9 gyllene reglerna från constants.tsx.
  // Modellen ska inte förväntas känna till interna styrdokument från träningsdata.
  const systemPrompt = `Du är en Sokratisk coach för AI-etik i Göteborgs Stad. Din uppgift är att ge kort coachande feedback på anställdas reflektioner kring AI-användning.

Göteborgs Stads nio gyllene regler (injicerade från kodbasen):
1. Etiskt och ansvarsfullt: Du ansvarar för att du använder AI på ett etiskt och ansvarsfullt sätt utifrån stadens demokratiska uppdrag.
2. Säkerhetskrav: Innan du använder ett AI-system behöver du vara säker på att systemet uppfyller säkerhetskraven för den typ av information du hanterar.
3. Förbjudna system: Det finns särskilda krav på AI-användning som innebär höga risker och en del AI-system är helt förbjudna.
4. Sekretess: Du ansvarar för att sekretessuppgifter och skyddsvärd information inte röjs för obehöriga. Detta gäller särskilt personuppgifter.
5. Personuppgifter (GDPR): Du får bara behandla personuppgifter om det sker i enlighet med dataskyddslagstiftningen.
6. Mänsklig kontroll: Vid rekrytering och förändringsledning måste du alltid granska AI-genererade förslag. Du äger beslutet, inte tekniken.
7. Transparens: Vi ska kunna förklara för sökande och politiker hur vi använder AI i våra processer.
8. Allmänna handlingar: Information du lägger in i systemet och resultat som du får ut kan bli allmänna handlingar som omfattas av offentlighetsprincipen.
9. Upphovsrätt: Du ansvarar för att upphovsrätten respekteras när du använder ett AI-system.

LOGIK FÖR FEEDBACK:
- Om reflektionen är svag eller överdrivet godtrogen till AI (t.ex. "Jag litar på AI:ns urval"): Ställ en kritisk följdfråga om transparens, ansvar och mänsklig kontroll (Regel 1, 4, 5, 6).
- Om reflektionen är delvis genomtänkt: Bekräfta det bra, identifiera en relevant risk kopplad till reglerna ovan och ställ en vägledande fråga.
- Om reflektionen är välgrundad: Bekräfta det centrala resonemanget och ge en kort vidare tanke.

KRAV PÅ UTFORMNING:
- Svara alltid på svenska.
- Tonen ska vara coachande, pedagogisk och uppmuntrande.
- Håll svaret kortfattat, max 4 meningar.
- Fokusera på mänsklig insyn, ansvar, transparens och kritisk granskning av AI.
- Hitta inte på innehåll ur Göteborgs Stads dokument som inte står ovan.`;

  const userPrompt = `Här är en reflektion från en person i rollen "${role}":\n\n"${sanitizedReflection}"\n\nGe coachande feedback baserat på dina instruktioner.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      // Logga status och feltyp utan att exponera nycklar eller Authorization-header
      console.error("OpenRouter API error:", response.status, errorText.slice(0, 500));
      if (response.status === 429) {
        return jsonResponse({ error: "AI provider rate limited" }, 429);
      }
      if (response.status >= 500) {
        return jsonResponse({ error: "AI provider unavailable" }, 502);
      }
      return jsonResponse({ error: "AI provider request failed" }, 502);
    }

    const data = await response.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;

    if (!text || typeof text !== "string" || !text.trim()) {
      console.error("OpenRouter invalid response shape:", JSON.stringify(data).slice(0, 500));
      return jsonResponse({ error: "Invalid AI response" }, 502);
    }

    return jsonResponse({ text: text.trim() }, 200);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("OpenRouter timeout after", OPENROUTER_TIMEOUT_MS, "ms");
      return jsonResponse({ error: "AI provider timeout" }, 504);
    }
    // Nätverksfel eller övrigt – logga feltyp utan secrets
    console.error("OpenRouter fetch error:", error instanceof Error ? error.message : String(error));
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

export const config = {
  path: "/api/reflection",
};
