
import { GoogleGenAI } from "@google/genai";

// Hämtar API-nyckeln från Vite/Netlify miljövariabler
const getApiKey = () => {
  try {
    // @ts-ignore - import.meta.env är tillgänglig i Vite-miljöer
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  } catch (e) {
    return '';
  }
};

export const getReflectionFeedback = async (reflection: string, role: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Anslutningsfel: API-nyckel saknas för feedback.";
  
  try {
    // Skapar en ny instans för varje anrop för att säkerställa korrekt kontext
    const ai = new GoogleGenAI({ apiKey });
    
    // Använder ai.models.generateContent direkt med gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Som en Sokratisk coach för AI-etik i Göteborgs Stad, ge feedback på denna reflektion från en ${role}: "${reflection}".
      
      LOGIK FÖR FEEDBACK:
      1. Om svaret är oförsiktigt eller litar för mycket på AI (t.ex. "Jag litar på AI:ns urval"): Ställ en kritisk fråga om transparens och ansvar utifrån Regel 4 & 5.
      2. Om svaret är tveksamt: Bekräfta det som är bra, peka på en specifik risk i Förskoleförvaltningens AI-strategi och ställ en vägledande följdfråga.
      3. Om svaret är korrekt och underbyggt: Fira framgången! Understryk de viktigaste delarna (must-know) och ge en uppmuntrande tanke för framtiden.
      
      Håll svaret kortfattat, pedagogiskt och på svenska (max 4 meningar). Använd en coachande ton.`,
      config: {
        systemInstruction: "Du är en pedagogisk coach för anställda i Göteborgs Stad. Du utgår från stadens AI-regler och Förskoleförvaltningens strategi (mänsklig insyn, ansvar, transparens).",
        temperature: 0.7,
      },
    });

    return response.text || "Kunde inte generera feedback just nu.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ett fel uppstod vid hämtning av feedback. Fortsätt med din egen reflektion.";
  }
};
