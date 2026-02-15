
export const getReflectionFeedback = async (reflection: string, role: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reflection, role }),
    });

    if (!response.ok) {
      console.error('Proxy error:', response.status);
      return "Ett fel uppstod vid hämtning av feedback. Fortsätt med din egen reflektion.";
    }

    const data = await response.json();
    return data.text || "Kunde inte generera feedback just nu.";
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return "Ett fel uppstod vid hämtning av feedback. Fortsätt med din egen reflektion.";
  }
};
