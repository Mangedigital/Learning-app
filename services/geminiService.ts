
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getReflectionFeedback = async (reflection: string, role: string) => {
  if (!process.env.API_KEY) return "Anslutningsfel: API-nyckel saknas för feedback.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
