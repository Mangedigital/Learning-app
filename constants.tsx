
import { GoldenRule, UserRole, CourseLevel, CourseModule, QuizQuestion, MatchingScenario } from './types';

export const GOLDEN_RULES: GoldenRule[] = [
  { id: 1, title: 'Etiskt och ansvarsfullt', content: 'Du ansvarar för att du använder AI på ett etiskt och ansvarsfullt sätt utifrån stadens demokratiska uppdrag.' },
  { id: 2, title: 'Säkerhetskrav', content: 'Innan du använder ett AI-system behöver du vara säker på att systemet uppfyller säkerhetskraven för den typ av information du hanterar.' },
  { id: 3, title: 'Förbjudna system', content: 'Det finns särskilda krav på AI-användning som innebär höga risker och en del AI-system är helt förbjudna.' },
  { id: 4, title: 'Sekretess', content: 'Du ansvarar för att sekretessuppgifter och skyddsvärd information inte röjs för obehöriga. Detta gäller särskilt personuppgifter.', criticalForHR: true },
  { id: 5, title: 'Personuppgifter (GDPR)', content: 'Du får bara behandla personuppgifter om det sker i enlighet med dataskyddslagstiftningen.', criticalForHR: true },
  { id: 6, title: 'Mänsklig kontroll', content: 'Vid rekrytering och förändringsledning måste du alltid granska AI-genererade förslag. Du äger beslutet, inte tekniken.', criticalForHR: true },
  { id: 7, title: 'Transparens', content: 'Vi ska kunna förklara för sökande och politiker hur vi använder AI i våra processer.' },
  { id: 8, title: 'Allmänna handlingar', content: 'Information du lägger in i systemet och resultat som du får ut kan bli allmänna handlingar som omfattas av offentlighetsprincipen.' },
  { id: 9, title: 'Upphovsrätt', content: 'Du ansvarar för att upphovsrätten respekteras när du använder ett AI-system.' },
];

export const MATCHING_SCENARIOS: MatchingScenario[] = [
  // --- HR-SPECIALIST/REKRYTERARE ---
  {
    id: 'hr1',
    role: UserRole.HR,
    text: "Case 1: CV-analys i publik chatt. Du vill snabba på urvalet genom att låta AI sammanfatta kandidaternas personliga brev och CV:n i en publik chatt.",
    correctRuleId: 5,
    explanation: "Personuppgifter: CV:n innehåller personuppgifter som aldrig får matas in i publika system. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Personuppgifter (GDPR): CV:n innehåller personuppgifter som aldrig får matas in i publika system.",
    socraticQuestion: "Om du ändå vill använda AI för att analysera kravprofilen – hur kan du göra det utan att mata in personuppgifter?",
    options: [1, 2, 4, 5],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Kärnproblemet: Det räcker sällan att bara radera namnet. Det kallas för \"indirekta personuppgifter\". En unik kombination av tidigare arbetsplatser, utbildningsår och specifika projekt kan enkelt kopplas ihop med en person via t.ex. LinkedIn.\n\nKom ihåg: Regel 5 kräver att vi har laglig grund för all hantering av personuppgifter. Publika AI-tjänster saknar de avtal som krävs för detta.\n\nKärnbudskap: Personlig integritet går före effektivitet."
    }
  },
  {
    id: 'hr2',
    role: UserRole.HR,
    text: "Case 2: Bias vid rangordning. Du ber AI rangordna topp 5-kandidater baserat på kompetens. Du märker att AI:n endast föreslår kandidater med liknande bakgrund.",
    correctRuleId: 1,
    explanation: "Etik/Rättvisa: Innebär ett åtagande att säkerställa att individer inte utsätts för diskriminering eller snedvridning. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Innebär ett åtagande att säkerställa att individer inte utsätts för diskriminering eller snedvridning.",
    socraticQuestion: "Hur kan du som rekryterare kontrollera att AI:n inte har missat en kompetens på grund av bias?",
    options: [1, 5, 6, 7],
    nudge: {
      title: "💡 Ge mig ett exempel",
      content: "AI räknar inte bara, den härmar. Den tränas på enorma mängder historisk text. Om den datan innehåller mönster av t.ex. könsdiskriminering, kommer AI:n att tro att detta är \"framgångsfaktorer\".\n\nKom ihåg: Regel 1 påminner oss om att vi har ett demokratiskt uppdrag att arbeta rättvist. Vi får aldrig låta tekniken automatisera gamla fördomar.\n\nKärnbudskap: Algoritmer saknar moral, det gör inte du."
    }
  },

  // --- UTVECKLINGSLEDARE ---
  {
    id: 'utv1',
    role: UserRole.DEV_LEAD,
    text: "Case 1: Forskningssammanfattning. Du använder AI för att sammanfatta rapporter. En föräldraförening begär ut att få se hela din konversation.",
    correctRuleId: 7,
    explanation: "Logik: Allmänhetens rätt till insyn gäller även AI-dialoger. Enligt källan ska vi kunna redovisa att och hur AI använts. Loggfiler och chattar kan utgöra allmän handling. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: Allmänhetens rätt till insyn gäller även AI-dialoger och loggfiler.",
    socraticQuestion: "Om du vet att din dialog kan granskas – hur påverkar det kvaliteten i dina prompter?",
    options: [4, 7, 8, 9],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "När du använder AI i tjänsten omfattas dina instruktioner (prompts) och AI:ns svar av offentlighetsprincipen om de har betydelse för ett ärende eller beslut. Regel 7 poängterar att vi ska främja tillit genom öppenhet. Spara därför relevanta konversationer om de ligger till grund för ditt arbete – de kan begäras ut som allmän handling.\n\nKärnbudskap: Din chatt är stadens minne."
    }
  },
  {
    id: 'utv2',
    role: UserRole.DEV_LEAD,
    text: "Case 2: AI-bild i material. Du genererar en bild för en broschyr men råkar få med en felaktig logotyp.",
    correctRuleId: 9,
    explanation: "Logik: Du ansvarar för att materialet följer grafisk profil. Källan \"Så jobbar du med AI\" förbjuder manipulering av logotyper och kräver märkning av AI-bilder. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Upphovsrätt & varumärke: Du ansvarar för att materialet följer grafisk profil.",
    socraticQuestion: "Varför är det viktigt att vi är tydliga med vad som är en riktig miljö och vad som är skapat av AI?",
    options: [2, 7, 8, 9],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Stadens grafiska profil är bärare av vårt förtroende. Enligt dokumentet \"Så jobbar du med AI-genererad bild\" ska AI-bilder alltid granskas så att de inte innehåller felaktiga symboler eller logotyper. Dessutom ska AI-genererade bilder märkas tydligt för att inte vilseleda mottagaren.\n\nKärnbudskap: Trovärdighet kräver märkning."
    }
  },
  {
    id: 'utv3',
    role: UserRole.DEV_LEAD,
    text: "Case 3: Plan för högindex. Du planerar insatser. AI föreslår att ni drar ner på språket för att fokusera på 'enklare färdigheter'.",
    correctRuleId: 3,
    explanation: "Logik: AI-förslag som rör resursfördelning eller pedagogiska strategier i prioriterade områden är högrisk. Mänsklig tillsyn krävs (Regel 1 & 3). [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Högriskområden: AI-förslag som rör resursfördelning kräver särskild kontroll.",
    socraticQuestion: "Om AI:ns förslag bygger på bias – hur säkerställer du att din planering bidrar till en mer jämlik stad?",
    options: [1, 3, 5, 7],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "AI tenderar att förenkla och kan föreslå sänkta ambitioner baserat på statistiska mönster i sin träningsdata (bias). Regel 3 (Högrisk) kräver att du som expert alltid gör den slutgiltiga bedömningen. AI får aldrig diktera den pedagogiska riktningen.\n\nKärnbudskap: Tekniken stöttar visionen, den styr den inte."
    }
  },

  // --- CHEF (MANAGER) ---
  {
    id: 'manager1',
    role: UserRole.MANAGER,
    text: "Case 1: Ansvar för leverans. En medarbetare har använt AI för att ta fram ett beslutsunderlag som visade sig innehålla felaktiga slutsatser. Vem bär ansvaret?",
    correctRuleId: 6,
    explanation: "Korrekt. Regel 6 i dokumentet betonar uttryckligen: \"Du ansvarar alltid själv för resultatet av ditt arbete\". Som chef bär du ansvaret för den slutliga produkten oavsett framställningsmetod. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: Betonar att du alltid ansvarar själv för resultatet av ditt arbete.",
    socraticQuestion: "Hur säkerställer du att dina medarbetare förstår att de inte kan 'skylla' på AI:n om ett underlag blir fel?",
    options: [1, 4, 6, 7],
    nudge: {
      title: "💡 Vill du förstå varför?",
      content: "Enligt stadens nio regler (Regel 6) är AI att betrakta som ett arbetsverktyg, inte en kollega. Som chef är din roll att säkerställa att enheten har rutiner för mänsklig granskning innan något publiceras eller skickas vidare.\n\nKärnbudskap: AI-stöd fråntar aldrig människan ansvaret."
    }
  },
  {
    id: 'manager2',
    role: UserRole.MANAGER,
    text: "Case 2: Facklig samverkan. Ni planerar att införa ett nytt AI-verktyg för schemaoptimering. De fackliga parterna undrar hur algoritmen fungerar.",
    correctRuleId: 7,
    explanation: "Korrekt. Dokumentet anger att transparens handlar om att \"skapa tillit och förenande\". I chefsrollen innebär detta att öppet redovisa AI-användning vid samverkan. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: Handlar om att skapa tillit genom öppenhet.",
    socraticQuestion: "Vilka risker ser du om medarbetarna upplever att schemat styrs av en 'svart låda' utan insyn?",
    options: [5, 6, 7, 8],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Transparens (Regel 7) är avgörande för att upprätthålla tillit. Genom att vara öppen med hur verktyget fungerar, vilken data det använder och vad syftet är, minskar du oron för övervakning eller osakliga bedömningar.\n\nKärnbudskap: Öppenhet är grunden för trygg förändringsledning."
    }
  }
];

export const MODULES: CourseModule[] = [
  {
    id: '1.1',
    title: 'Risk-detektiven',
    description: 'Identifiera risker i scenarier genom att konsultera stadens gyllene regler.',
    type: 'matching',
    metadata: {
      role: [UserRole.HR, UserRole.DEV_LEAD, UserRole.MANAGER],
      level: CourseLevel.BASIC,
      category: 'Etik',
      durationMinutes: 10
    }
  },
  {
    id: '1.2',
    title: 'Människan i loopen',
    description: 'Fördjupad reflektion kring ditt ansvar som HR-specialist eller utvecklingsledare.',
    type: 'reflection',
    metadata: {
      role: [UserRole.HR, UserRole.DEV_LEAD, UserRole.MANAGER],
      level: CourseLevel.BASIC,
      category: 'Ansvar',
      durationMinutes: 15
    }
  },
  {
    id: '1.3',
    title: 'Gråzons-Quiz',
    description: 'Testa dina kunskaper i de mest utmanande juridiska och etiska AI-frågorna.',
    type: 'quiz',
    metadata: {
      role: [UserRole.HR, UserRole.DEV_LEAD, UserRole.MANAGER],
      level: CourseLevel.BASIC,
      category: 'Juridik',
      durationMinutes: 5
    }
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Är det tillåtet att använda AI för att rangordna kandidater om jag själv fattar slutbeslutet?",
    answer: false,
    explanation: "Falskt. Policyn kräver att vi förstår hur AI:n tagit fram resultatet (förklarbarhet) för att undvika diskriminering."
  },
  {
    question: "Om jag använder AI för att rätta stavfel i ett offentligt dokument, räknas det fortfarande som att jag är 'människan i loopen'?",
    answer: true,
    explanation: "Sant. Men du måste fortfarande läsa igenom slutresultatet för att säkerställa att AI:n inte ändrat betydelsen i texten."
  }
];

export const ROLE_SCENARIOS = {
  [UserRole.HR]: "Du överväger att använda AI för att sortera ut de 10 bästa kandidaterna till en rektorstjänst baserat på personlighetstest. Hur reflekterar du kring kravet på förklarbarhet?",
  [UserRole.DEV_LEAD]: "Du leder ett projekt där AI ska användas för att analysera frisvar i medarbetarenkäten. Hur säkerställer du att integriteten bevaras?",
  [UserRole.MANAGER]: "Du märker att dina medarbetare börjar använda AI för att skriva beslutsunderlag. Hur agerar du för att säkerställa att transparensen bibehålls?"
};
