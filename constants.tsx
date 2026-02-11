
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
  { id: 9, title: 'Upphovsrätt', content: 'Du ansvarar för att upphovsrättsrespekteras när du använder ett AI-system.' },
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
      title: "Är det inte okej om jag bara tar bort namnet på kandidaten?",
      content: "Kärnproblemet: Det räcker sällan att bara radera namnet. Det kallas för \"indirekta personuppgifter\". En unik kombination av tidigare arbetsplatser, utbildningsår och specifika projekt kan enkelt kopplas ihop med en person via t.ex. LinkedIn.\n\nExemplet: Om du matar in ett CV för en \"Enhetschef som jobbat 12 år på X-förvaltningen och har suttit i styrelsen för Y-förbundet\", så har du i praktiken identifierat personen för AI:n. Om systemet sedan sparar detta för att träna sin modell, har vi förlorat kontrollen över kandidatens data.\n\nKom ihåg: Regel 5 kräver att vi har laglig grund för all hantering av personuppgifter. Publika AI-tjänster saknar de avtal som krävs för detta."
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
      title: "Kan en algoritm verkligen vara fördomsfull? Den räknar väl bara?",
      content: "Kärnproblemet: AI räknar inte bara, den härmar. Den tränas på enorma mängder historisk text. Om den datan innehåller mönster av t.ex. könsdiskriminering eller åldersfixering, kommer AI:n att tro att detta är \"framgångsfaktorer\".\n\nExemplet: En känd AI-modell för rekrytering lärde sig att ordet \"ledare\" ofta förekom i mäns CV:n men mer sällan i kvinnors. Resultatet? AI:n började automatiskt nedgradera kvinnliga sökande, trots att de hade exakt samma kompetens.\n\nKom ihåg: Regel 1 påminner oss om att vi har ett demokratiskt uppdrag att arbeta rättvist. Vi får aldrig låta tekniken automatisera gamla fördomar."
    }
  },
  {
    id: 'hr3',
    role: UserRole.HR,
    text: "Case 3: Berätta om AI-stöd. En kandidat undrar om deras ansökan har behandlats av en AI. Du funderar på om du behöver svara ärligt på detta.",
    correctRuleId: 7,
    explanation: "Transparens: AI-genererat material (eller stöd i processen) ska användas transparent för att behålla förtroendet. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: AI-genererat material (eller stöd i processen) ska användas transparent för att behålla förtroendet.",
    socraticQuestion: "Hur påverkas förtroendet för Göteborgs Stad som arbetsgivare om we använder AI 'i smyg'?",
    options: [6, 7, 8, 9],
    nudge: {
      title: "Varför spelar det roll om kandidaten vet hur jag förbereder mitt arbete?",
      content: "Kärnproblemet: Tillit. Som offentlig aktör ska Göteborgs Stad vara förutsägbar och transparent. Om en medborgare känner att en \"maskin\" har sorterat bort dem utan att de vetat om det, skadas förtroendet för hela förvaltningen.\n\nExemplet: Tänk dig att en sökande får veta i efterhand att en AI analyserade deras personliga egenskaper. Om vi inte har varit öppna med det, upplevs det ofta som rättsosäkert och \"skymt\".\n\nKom ihåg: Regel 7 säger att vi ska vara öppna för att bidra till förtroendet för staden. Transparens är vårt bästa verktyg mot misstro."
    }
  },
  {
    id: 'hr4',
    role: UserRole.HR,
    text: "Case 4: Kontroll av intervjunota. Du använder AI för att snygga till dina anteckningar från en intervju. AI:n lägger till kompetenser som aldrig nämndes.",
    correctRuleId: 6,
    explanation: "Kontroll: Du måste alltid kontrollera resultatet (p.g.a. risk för \"hallucinationer\") och ansvarar för användningen. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: Du måste always kontrollera resultatet (p.g.a. risk för \"hallucinationer\") och ansvarar för användningen.",
    socraticQuestion: "Vad blir konsekvensen för kandidaten om sammanfattningen av intervjun råkar innehålla kompetenser som inte stämmer?",
    options: [1, 3, 4, 6],
    nudge: {
      title: "AI:n skriver ju så proffsigt – hur kan den ha fel?",
      content: "Kärnproblemet: AI-modeller fungerar genom att gissa nästa ord, inte genom att förstå sanningen. Detta kallas för \"hallucinationer\". Om AI:n märker att din intervjunota är lite tunn, kan den \"fylla i luckorna\" för att få texten att flyta bättre.\n\nExemplet: Du skriver \"Kandidaten har erfarenhet av Word\". AI:n, som vill vara hjälpsam, skriver om det till: \"Kandidaten har avancerade kunskaper i hela Office-paketet och har lett IT-projekt\". Det låter bra, men det är osant.\n\nKom ihåg: Regel 6 är stenhård: Du är alltid ansvarig för slutresultatet. AI:n kan inte ställas till svars, det kan bara du."
    }
  },
  {
    id: 'hr5',
    role: UserRole.HR,
    text: "Case 5: Begäran om loggar. Efter en avslutad rekrytering begär en kandidat ut den dialog (prompter) du haft med AI:n.",
    correctRuleId: 8,
    explanation: "Allmän handling: Inmatad data och dialog med AI:n kan utgöra allmänna handlingar. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Allmänna handlingar: Inmatad data och dialog med AI:n kan utgöra allmänna handlingar.",
    socraticQuestion: "Skriver du annorlunda i chatten om du tänker på att loggen kan läsas av kandidaten eller en journalist?",
    options: [4, 7, 8, 9],
    nudge: {
      title: "Räknas mina prompter (instruktioner) verkligen som officiella dokument?",
      content: "Kärnproblemet: Offentlighetsprincipen. All information som förvaras hos en myndighet och som har inkommit eller upprättats där är som huvudregel en allmän handling. Detta inkluderar din chattlogg med en AI.\n\nExemplet: En kandidat som nekas anställning kan begära ut loggarna för att se om du gett AI:n instruktioner som: \"Hitta de mest ungdomliga kandidaterna\" eller \"Sammanfatta bara de som bor nära centrum\". Dessa loggar kan bli bevis i en diskrimineringsombudsmannens (DO) granskning.\n\nKom ihåg: Regel 8 påminner oss om att det digitala spåret du lämnar efter dig är en del av stadens gemensamma minne och kan granskas av vem som helst."
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
      content: "När du använder AI i tjänsten omfattas dina instruktioner (prompts) och AI:ns svar av offentlighetsprincipen om de har betydelse för ett ärende eller beslut. Regel 7 poängterar att vi ska främja tillit genom öppenhet. Spara därför relevanta konversationer om de ligger till grund för ditt arbete – de kan begäras ut som allmän handling."
    }
  },
  {
    id: 'utv2',
    role: UserRole.DEV_LEAD,
    text: "Case 2: AI-bild i material. Du genererar en bild för en broschyr men råkar få med en felaktig logotyp.",
    correctRuleId: 9,
    explanation: "Logik: Du ansvarar för att materialet följer grafisk profil. Källan \"Så jobbar du med AI\" förbjuder manipulering av logotyper och kräver märkning av AI-bilder. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Upphovsrätt & varumärke: Du ansvarar för att materialet följer grafisk profil och källan förbjuder manipulering av logotyper.",
    socraticQuestion: "Varför är det viktigt att vi är tydliga med vad som är en riktig miljö och vad som är skapat av AI?",
    options: [2, 7, 8, 9],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Stadens grafiska profil är bärare av vårt förtroende. Enligt dokumentet \"Så jobbar du med AI-genererad bild\" ska AI-bilder alltid granskas så att de inte innehåller felaktiga symboler eller logotyper. Dessutom ska AI-genererade bilder märkas tydligt för att inte vilseleda mottagaren om vad som är ett äkta fotografi."
    }
  },
  {
    id: 'utv3',
    role: UserRole.DEV_LEAD,
    text: "Case 3: Plan för högindex. Du planerar insatser. AI föreslår att ni drar ner på språket för att fokusera på 'enklare färdigheter'.",
    correctRuleId: 3,
    explanation: "Logik: AI-förslag som rör resursfördelning eller pedagogiska strategier i prioriterade områden är högrisk. Mänsklig tillsyn krävs för att motverka bias (Regel 1 & 3). [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Högriskområden: AI-förslag som rör resursfördelning eller pedagogiska strategier i prioriterade områden är högrisk.",
    socraticQuestion: "Om AI:ns förslag bygger på bias – hur säkerställer du att din planering bidrar till en mer jämlik stad?",
    options: [1, 3, 5, 7],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Nivåskillnader i högindexområden är ett komplext område. AI tenderar att förenkla och kan föreslå sänkta ambitioner baserat på statistiska mönster i sin träningsdata (bias). Regel 3 (Högrisk) kräver att du som expert alltid gör den slutgiltiga bedömningen. AI får aldrig diktera den pedagogiska riktningen."
    }
  },
  {
    id: 'utv4',
    role: UserRole.DEV_LEAD,
    text: "Case 4: Snäv norm / Bias. En ledarskapsplattform föreslår beteenden som utgår från en snäv norm för kommunikation.",
    correctRuleId: 1,
    explanation: "Logik: AI speglar ofta träningsdata som kan sakna inkludering. Som utvecklingsledare är det ditt uppdrag att säkerställa att materialet vilar på stadens demokratiska värdegrund. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Det är ditt uppdrag att säkerställa att materialet vilar på stadens demokratiska värdegrund.",
    socraticQuestion: "Hur motverkar vi att AI-stöttat material missar mångfalden i våra verksamheter?",
    options: [1, 3, 5, 7],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "De flesta stora AI-modeller är tränade på västerländsk, ofta anglosaxisk, affärskultur. Detta kan leda till att de föreslår ledarskapsbeteenden som inte rimmar med Göteborgs Stads inkluderande värdegrund. Regel 1 påminner oss om att tekniken ska understödja mänskliga rättigheter och icke-diskriminering."
    }
  },
  {
    id: 'utv5',
    role: UserRole.DEV_LEAD,
    text: "Case 5: Träna på egna bilder. Du vill träna en AI-modell på bilder från stadens gemensamma bildförsörjning för att skapa nytt innehåll.",
    correctRuleId: 8,
    explanation: "Logik: Du får inte mata in bilder från stadens gemensamma bildförsörjning i publika AI-verktyg då modellavtal för personerna på bilderna inte täcker maskininlärning (Källa: \"Så jobbar du med AI\"). [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mata inte in känslig info: Modellavtal för personerna på bilderna täcker inte maskininlärning.",
    socraticQuestion: "Hur säkerställer du att integriteten bevaras för deltagare i små grupper?",
    options: [2, 4, 5, 8],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Det är lockande att ladda upp en bild på en barngrupp för att \"skapa en liknande bild\". Men enligt dokumentet \"Så jobbar du med AI\" är detta förbjudet. De personer som gett samtycke till att synas i stadens bildbank har inte gett samtycke till att deras ansikten används för att träna AI-modeller hos tredje part (t.ex. OpenAI eller Adobe)."
    }
  },

  // --- CHEF (HR-CHEF / MANAGER) ---
  {
    id: 'manager1',
    role: UserRole.MANAGER,
    text: "Case 1: Ansvar för leverans. En medarbetare har använt AI för att ta fram ett beslutsunderlag som visade sig innehålla felaktiga slutsatser. Vem bär ansvaret?",
    correctRuleId: 6,
    explanation: "Korrekt. Regel 6 i dokumentet betonar uttryckligen: \"Du ansvarar alltid själv för resultatet av ditt arbete\". Som chef bär du ansvaret för den slutliga produkten oavsett framställningsmetod. [✅ OK] [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: Betonar att du alltid ansvarar själv för resultatet av ditt arbete.",
    socraticQuestion: "Hur säkerställer du att dina medarbetare förstår att de inte kan 'skylla' på AI:n om ett underlag blir fel?",
    options: [1, 4, 6, 7],
    nudge: {
      title: "💡 Vill du förstå varför?",
      content: "Enligt stadens nio regler (Regel 6) är AI att betrakta som ett arbetsverktyg, inte en kollega. Precis som du bär ansvaret om en medarbetare räknat fel i Excel eller missuppfattat en rutin, bär du ansvaret för att de underlag som din enhet producerar är korrekta. AI-system kan drabbas av \"hallucinationer\" (där de hittar på fakta som låter trovärdiga). Som chef är din roll att säkerställa att enheten har rutiner för mänsklig granskning innan något publiceras eller skickas vidare.\n\nKärnbudskap: AI-stöd fråntar aldrig människan ansvaret."
    }
  },
  {
    id: 'manager2',
    role: UserRole.MANAGER,
    text: "Case 2: Facklig samverkan. Ni planerar att införa ett nytt AI-verktyg för schemaoptimering. De fackliga parterna undrar hur algoritmen fungerar.",
    correctRuleId: 7,
    explanation: "Korrekt. Dokumentet anger att transparens och handlar om att \"skapa tillit och förenande\". I chefsrollen innebär detta att öppet redovisa AI-användning vid samverkan. [✅ OK] [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: Handlar om att skapa tillit och förtroende genom öppenhet.",
    socraticQuestion: "Vilka risker ser du om medarbetarna upplever att schemat styrs av en 'svart låda' utan insyn?",
    options: [5, 6, 7, 8],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Transparens (Regel 7) är avgörande för att upprätthålla tillit. Vid införande av AI-stöd som påverkar arbetsmiljön eller hur arbetsuppgifter utförs, aktualiseras ofta samverkan enligt MBL. Genom att vara öppen med hur verktyget fungerar, vilken data det använder och vad syftet är, minskar du oron för övervakning eller osakliga bedömningar.\n\nKärnbudskap: Öppenhet är grunden för trygg förändringsledning."
    }
  },
  {
    id: 'manager3',
    role: UserRole.MANAGER,
    text: "Case 3: Inkluderande ledarskap. Du märker att ett AI-stöttat verktyg för schemaläggning systematiskt missgynnar föräldralediga eller deltidsanställda.",
    correctRuleId: 1,
    explanation: "Korrekt. Regel 1 lyfter fram \"demokratins grundläggande värden\" och \"mänskliga rättigheter\". Att motverka diskriminering är en kärndel i detta etiska ansvar. [✅ OK] [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Lyft fram demokratins grundläggande värden och mänskliga rättigheter.",
    socraticQuestion: "Hur kan vi i Förskoleförvaltningen säkerställa att tekniken stöttar vår vision om en inkluderande arbetsplats?",
    options: [1, 3, 5, 9],
    nudge: {
      title: "💡 Ge mig ett exempel",
      content: "Algoritmisk bias är en verklig risk. Om ett AI-verktyg är tränat på historisk data som innehåller fördomar, kommer verktyget att reproducera dessa (Regel 1). Som chef i Göteborgs Stad ska du värna om den demokratiska värdegrunden. Det innebär att du måste vara vaksam på om AI-stöd tenderar att premiera en viss typ av profil eller beteende som exkluderar andra.\n\nKärnbudskap: Du är grindvakten som ser till att tekniken inte motverkar stadens jämlikhetsmål."
    }
  },
  {
    id: 'manager4',
    role: UserRole.MANAGER,
    text: "Case 4: Känslig info i ledningsgrupp. Vid ett möte föreslår en kollega att ni laddar upp medarbetarnas prestationsdata i en publik AI för analys.",
    correctRuleId: 4,
    explanation: "Mycket stark. Här kan du även addera Regel 5 (Personuppgifter) som stöd, då prestationer är kopplade till individer. Dokumentet förbjuder specifikt inmatning av \"uppgifter som rör medarbetare\" i publika AI-system. [✅ OK] [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Sekretess: Förbjuder inmatning av känsliga uppgifter om medarbetare i osäkra system.",
    socraticQuestion: "Vad blir konsekvensen för medarbetarnas tillit om deras data hamnar i en publik molntjänst?",
    options: [1, 2, 4, 8],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Här möts sekretess (Regel 4) och dataskydd (Regel 5). När du matar in uppgifter om enskilda medarbetare i ett publikt AI-verktyg (som ChatGPT), skickas datan till servrar utanför stadens kontroll och kan användas för att träna framtida modeller. Detta innebär ett röjande av sekretess och ett brott mot GDPR. Även om informationen inte är sekretessmarkerad, kräver god personalpolitik att känsliga personalärenden stannar inom stadens säkra system.\n\nKärnbudskap: Mata aldrig in personuppgifter eller känsliga interna analyser i öppna system."
    }
  },
  {
    id: 'manager5',
    role: UserRole.MANAGER,
    text: "Case 5: Beslutsstöd / Högindex. En ny AI-rapport föreslår drastiska resursändringar i högindexområden utan att förklara varför.",
    correctRuleId: 1,
    explanation: "Korrekt, men... Här bör du även nämna Regel 3 (Högriskområden). Dokumentet varnar för system som används för att fatta beslut om individers tillgång till tjänster/förmåner. Förklarbarhet är här ett lagkrav (AI Act). [⚠️ Justera] [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Innebär ett ansvar att kunna förklara och motivera beslut.",
    socraticQuestion: "Kan du som chef stå bakom ett beslut inför förskolenämnden om du inte förstår hur analysen gjordes?",
    options: [1, 3, 6, 7],
    nudge: {
      title: "💡 Vill du förstå varför?",
      content: "Beslut om resursfördelning räknas ofta som högriskområden (Regel 3). Enligt AI Act och stadens regler får vi inte använda \"svarta lådan\"-system där vi inte kan förklara logiken bakom ett resultat. Om du inte kan motivera för en medborgare eller politiker varför en viss resursfördelning skett, faller beslutet på bristande förklarbarhet. Du måste alltid kunna utöva \"mänsklig tillsyn\" och vid behov åsidosätta AI-förslaget.\n\nKärnbudskap: Kan du inte förklara beslutet, kan du inte fatta det."
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
