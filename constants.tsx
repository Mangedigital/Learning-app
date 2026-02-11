
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
    text: "Case 1: Granskning av ansökningar. Du vill snabba på urvalet genom att låta AI sammanfatta kandidaternas personliga brev och CV:n i en publik chatt.",
    correctRuleId: 5,
    explanation: "Personuppgifter: CV:n innehåller personuppgifter som aldrig får matas in i publika system.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Personuppgifter (GDPR): Mata aldrig in personuppgifter i publika AI-system.",
    socraticQuestion: "Om du ändå vill använda AI för att analysera kravprofilen – hur kan du göra det utan att mata in personuppgifter?",
    options: [1, 2, 4, 5]
  },
  {
    id: 'hr2',
    role: UserRole.HR,
    text: "Case 2: Rangordning av kandidater. Du ber AI rangordna topp 5-kandidater baserat på kompetens. Du märker att AI:n endast föreslår kandidater med liknande utbildningsbakgrund.",
    correctRuleId: 1,
    explanation: "Etik/Rättvisa: Innebär ett åtagande att säkerställa att individer inte utsätts för diskriminering eller snedvridning.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Vi ska säkerställa att individer inte utsätts för diskriminering.",
    socraticQuestion: "Hur kan du som rekryterare kontrollera att AI:n inte har missat en kompetens på grund av bias?",
    options: [1, 5, 6, 7]
  },
  {
    id: 'hr3',
    role: UserRole.HR,
    text: "Case 3: Transparens i processen. En kandidat undrar om deras ansökan har behandlats av en AI. Du funderar på om du behöver svara ärligt på detta.",
    correctRuleId: 7,
    explanation: "Transparens: AI-genererat material (eller stöd i processen) ska användas transparent för att behålla förtroendet.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: Vi ska kunna förklara hur vi använder AI i våra processer.",
    socraticQuestion: "Hur påverkas förtroendet för Göteborgs Stad som arbetsgivare om vi använder AI 'i smyg'?",
    options: [6, 7, 8, 9]
  },
  {
    id: 'hr4',
    role: UserRole.HR,
    text: "Case 4: Sammanfattning av intervjuer. Du använder AI för att snygga till dina anteckningar från en intervju. AI:n lägger till kompetenser som kandidaten aldrig nämnde, men som \"passar in\".",
    correctRuleId: 6,
    explanation: "Kontroll: Du måste alltid kontrollera resultatet (p.g.a. risk för \"hallucinationer\") och ansvarar för användningen.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: Du måste alltid granska AI-genererade förslag.",
    socraticQuestion: "Vad blir konsekvensen för kandidaten om sammanfattningen av intervjun råkar innehålla kompetenser som inte stämmer?",
    options: [1, 3, 4, 6]
  },
  {
    id: 'hr5',
    role: UserRole.HR,
    text: "Case 5: Utlämning av loggar. Efter en avslutad rekrytering begär en kandidat ut den dialog (prompter) du haft med AI:n för att förstå hur deras profil bedömdes.",
    correctRuleId: 8,
    explanation: "Allmän handling: Inmatad data och dialog med AI:n kan utgöra allmänna handlingar.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Allmänna handlingar: Loggar och inmatad data kan bli allmänna handlingar.",
    socraticQuestion: "Skriver du annorlunda i chatten om du tänker på att loggen kan läsas av kandidaten eller en journalist?",
    options: [4, 7, 8, 9]
  },

  // --- UTVECKLINGSLEDARE ---
  {
    id: 'utv1',
    role: UserRole.DEV_LEAD,
    text: "Case 1: Plan för högindexområden. Du planerar kompetenshöjande insatser för personal i områden med stora socioekonomiska utmaningar. AI:n föreslår att ni drar ner på språket i vissa områden för att fokusera på 'enklare praktiska färdigheter'.",
    correctRuleId: 1,
    explanation: "Människans autonomi: Det är människan som ska ha kontrollen över etiska och ansvarsfulla beslut.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Du ansvarar för att du använder AI på ett etiskt sätt.",
    socraticQuestion: "Om AI:ns förslag bygger på bias – hur säkerställer du att din planering bidrar till en mer jämlik stad?",
    options: [1, 4, 5, 7]
  },
  {
    id: 'utv2',
    role: UserRole.DEV_LEAD,
    text: "Case 2: AI-bild i material. Du genererar en AI-bild som visar en 'perfekt' utemiljö för en broschyr, men råkar få med en logotyp som liknar stadens men är lite 'off'.",
    correctRuleId: 9,
    explanation: "Upphovsrätt: Du ansvarar för att upphovsrätten respekteras vid AI-genererat material.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Upphovsrätt: Du ansvarar för att upphovsrätten respekteras när du använder AI.",
    socraticQuestion: "Varför är det viktigt att vi är tydliga med vad som är en riktig miljö och vad som är skapat av AI?",
    options: [2, 7, 8, 9]
  },
  {
    id: 'utv3',
    role: UserRole.DEV_LEAD,
    text: "Case 3: Mentorspar (indirekt info). Du klistrar in barnskötarnas motiveringar (med detaljer om deras arbetslag) i en AI för att hitta bra matchningar baserat på personlighet.",
    correctRuleId: 5,
    explanation: "Personuppgifter: Även uppgifter som indirekt kan kopplas till en person (t.ex. unik yrkesroll) kräver GDPR-hänsyn.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Personuppgifter: Du får bara behandla personuppgifter i enlighet med dataskyddslagstiftningen.",
    socraticQuestion: "Hur säkerställer du att integriteten bevaras för deltagare i små grupper?",
    options: [1, 2, 4, 5]
  },
  {
    id: 'utv4',
    role: UserRole.DEV_LEAD,
    text: "Case 4: Forskningssammanfattning. Du använder AI för att sammanfatta rapporter. En föräldraförening begär ut att få se hela din 'konversation' med AI:n.",
    correctRuleId: 8,
    explanation: "Allmän handling: Din användning och loggarna i tjänsten kan begäras ut för granskning.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Allmänna handlingar: Information du lägger in kan bli allmänna handlingar.",
    socraticQuestion: "Om du vet att din dialog kan granskas – hur påverkar det kvaliteten i dina prompter?",
    options: [4, 7, 8, 9]
  },
  {
    id: 'utv5',
    role: UserRole.DEV_LEAD,
    text: "Case 5: Ledarskapsplattform. AI:n föreslår ledarbeteenden som utgår från en snäv, västerlänsk norm för kommunikation.",
    correctRuleId: 1,
    explanation: "Rättvisa: Säkerställa att systemet inte leder till orättvis snedvridning eller exkludering.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Du ansvarar för att AI används utifrån stadens demokratiska uppdrag.",
    socraticQuestion: "Hur motverkar vi att AI-stöttat material missar mångfalden i våra verksamheter?",
    options: [1, 3, 5, 7]
  },

  // --- CHEF ---
  {
    id: 'manager1',
    role: UserRole.MANAGER,
    text: "Case 1: Delegering av ansvar. En medarbetare har använt AI för att ta fram ett beslutsunderlag som visade sig innehålla felaktiga slutsatser.",
    correctRuleId: 6,
    explanation: "Ansvar: Du är alltid ansvarig för hur AI-resultatet används i din verksamhet.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: Du äger beslutet, inte tekniken.",
    socraticQuestion: "Hur skapar du rutiner som säkerställer att medarbetare granskar AI-svar?",
    options: [1, 4, 6, 7]
  },
  {
    id: 'manager2',
    role: UserRole.MANAGER,
    text: "Case 2: Facklig dialog. Ni planerar att införa ett nytt AI-verktyg för schemaoptimering. De fackliga parterna undrar hur algoritmen fungerar.",
    correctRuleId: 7,
    explanation: "Transparens: Att vara öppen med hur tekniken används bygger förtroende för verksamheten.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: Vi ska kunna förklara hur vi använder AI i våra processer.",
    socraticQuestion: "Vilka risker ser du om medarbetarna upplever att schemat styrs av en 'svart låda'?",
    options: [5, 6, 7, 8]
  },
  {
    id: 'manager3',
    role: UserRole.MANAGER,
    text: "Case 3: Inkluderande teknikval. En avdelning vill använda en AI-tjänst som visat sig ha kopplingar till oetisk datainsamling.",
    correctRuleId: 1,
    explanation: "Etik: AI ska användas på ett sätt som respekterar principer om rättvisa och skadeförebyggande.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Du ansvarar för att använda AI på ett etiskt sätt.",
    socraticQuestion: "Hur väger du effektivitetsvinster mot risken att stadens varumärke skadas?",
    options: [1, 3, 5, 9]
  },
  {
    id: 'manager4',
    role: UserRole.MANAGER,
    text: "Case 4: Känslig info på ledningsmöte. Ni diskuterar strategiska personalfrågor och en chef vill använda en publik AI för att analysera känsliga uppgifter.",
    correctRuleId: 4,
    explanation: "Sekretess: Sekretessbelagda uppgifter får aldrig matas in i ett system som inte är riskbedömt för det.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Sekretess: Du ansvarar för att sekretessuppgifter inte röjs för obehöriga.",
    socraticQuestion: "Vad händer med känslig information om den lämnas i en publik molntjänst?",
    options: [1, 2, 4, 8]
  },
  {
    id: 'manager5',
    role: UserRole.MANAGER,
    text: "Case 5: Strategiskt underlag. En ny AI-rapport föreslår att ni ska stänga två förskolor baserat på demografiska prognoser.",
    correctRuleId: 1,
    explanation: "Förklarbarhet: Det är viktigt att kunna förklara hur AI-modellen har kommit fram till sitt resultat.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Du ansvarar för att AI används på ett ansvarsfullt sätt.",
    socraticQuestion: "Kan du försvara ett beslut inför politiker om du inte förstår logiken bakom AI-analysen?",
    options: [1, 6, 7, 8]
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
    explanation: "Falskt. Policyn kräver att vi förstår hur AI:n tagit fram resultatet (förklarbarhet) för att undvika diskriminering. Automatiserad rangordning utan insyn i logiken är problematisk."
  },
  {
    question: "Om jag använder AI för att rätta stavfel i ett offentligt dokument, räknas det fortfarande som att jag är 'människan i loopen'?",
    answer: true,
    explanation: "Sant. Men du måste fortfarande läsa igenom slutresultatet för att säkerställa att AI:n inte ändrat betydelsen i texten."
  },
  {
    question: "Loggar från publika AI-verktyg gallras automatiskt och behöver därför inte arkiveras eller lämnas ut.",
    answer: false,
    explanation: "Falskt. Att ett verktyg raderar historik påverkar inte din skyldighet enligt offentlighetsprincipen om handlingen räknas som inkommen eller upprättad."
  }
];

export const ROLE_SCENARIOS = {
  [UserRole.HR]: "Du överväger att använda AI för att sortera ut de 10 bästa kandidaterna till en rektorstjänst baserat på deras svar i ett personlighetstest. Hur reflekterar du kring kravet på förklarbarhet och risken för diskriminering?",
  [UserRole.DEV_LEAD]: "Du leder ett projekt där AI ska användas för att analysera frisvar i medarbetarenkäten för att föreslå förbättringsåtgärder. Hur säkerställer du att integriteten bevaras och att förslagen är förankrade i verksamhetens verkliga behov?",
  [UserRole.MANAGER]: "Du märker att dina medarbetare börjar använda AI för att skriva beslutsunderlag till förskolenämnden. Hur agerar du för att säkerställa att transparensen bibehålls och att ansvarskedjan är intakt?"
};
