import type { Context } from "@netlify/functions";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export default async (req: Request, _context: Context) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured on server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { reflection: string; role: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { reflection, role } = body;
  if (!reflection || !role) {
    return new Response(
      JSON.stringify({ error: "Missing reflection or role" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
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

  const sanitizedReflection = reflection.trim().substring(0, 2000);

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
      return new Response(
        JSON.stringify({ error: "Gemini API request failed" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Kunde inte generera feedback just nu.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/gemini-proxy",
};
