
import { GoogleGenAI } from "@google/genai";

/**
 * Hämtar API-nyckeln från Vite/Netlify miljövariabler
 */
const getApiKey = () => {
  try {
    // @ts-ignore - import.meta.env är tillgänglig i Vite-miljöer
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  } catch (e) {
    return '';
  }
};

/**
 * Saniterar och validerar användarens inmatning
 */
const sanitizeInput = (text: string): string => {
  return text.trim().substring(0, 2000); // Begränsa längd och ta bort whitespace
};

export const getReflectionFeedback = async (reflection: string, role: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Anslutningsfel: API-nyckel saknas för feedback.";
  
  const sanitizedReflection = sanitizeInput(reflection);
  if (!sanitizedReflection) return "Reflektionen är tom. Vänligen skriv något för att få feedback.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // System-prompten definierar personan, kontexten och logiken för feedbacken
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ 
        parts: [{ 
          text: `Här är en reflektion från en person i rollen "${role}":\n\n"${sanitizedReflection}"\n\nGe coachande feedback baserat på dina instruktioner.` 
        }] 
      }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Kunde inte generera feedback just nu. Fortsätt gärna med dina egna tankar.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ett tekniskt fel uppstod vid hämtning av feedback. Din reflektion är dock sparad lokalt.";
  }
};
