
import { GoldenRule, CourseRole, CourseLevel, CourseModule, QuizQuestion, MatchingScenario, MicroCourse } from './types';

export const COURSE_ROLES: CourseRole[] = [
  {
    id: 'hr',
    title: 'HR-specialist/Rekryterare',
    description: 'Arbetar med rekrytering, kandidaturval och personaldata.',
    focus: 'Rekrytering av chefer och medarbetare',
    icon: 'fa-user-tie',
  },
  {
    id: 'dev-lead',
    title: 'Utvecklingsledare',
    description: 'Arbetar med analys, rapporter, enkäter och verksamhetsutveckling.',
    focus: 'Förändringsledning och kompetensförsörjning',
    icon: 'fa-arrows-spin',
  },
  {
    id: 'manager',
    title: 'Chef',
    description: 'Leder medarbetares AI-användning, rutiner och riskkultur.',
    focus: 'Styrning, ansvar och beslutsunderlag',
    icon: 'fa-briefcase',
  },
];

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
    roleId: 'hr',
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
    roleId: 'hr',
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
    roleId: 'dev-lead',
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
    roleId: 'dev-lead',
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
    roleId: 'dev-lead',
    text: "Case 3: Plan för högindex. Du planerar insatser. AI föreslår att ni drar ner på språket för att fokusera på 'enklare färdigheter'.",
    correctRuleId: 3,
    explanation: "Logik: AI-förslag som rör resursfördelning eller pedagogiska strategier i prioriterade områden är högrisk. Mänsklig tillsyn krävs (Regel 1 & 3). [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Högriskområden: AI-förslag som rör resursfördelning kräver särskild kontroll.",
    socraticQuestion: "Om AI:ns förslag bygger på bias – hur säkerställer du att din planering bidrar till en mer jämlik stad?",
    options: [1, 3, 5, 7],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "AI tenderar att förenkla och kan föreslå sänkta ambitioner baserat på statistiska mönster i sin träningsdata (bias). Regel 3 (Högrisk) kräver att du som expert always gör den slutgiltiga bedömningen. AI får aldrig diktera den pedagogiska riktningen.\n\nKärnbudskap: Tekniken stöttar visionen, den styr den inte."
    }
  },

  // --- CHEF (MANAGER) ---
  {
    id: 'manager1',
    roleId: 'manager',
    text: "Case 1: Underlaget till HR-ledningen\nDu ska presentera en analys av sjukfrånvaron och föreslagna åtgärder för HR-ledningen. En av dina HR-specialister har använt AI för att sammanställa statistiken och skriva utkastet till presentationen. Under mötet upptäcker en kollega att siffrorna för en stadsdel inte stämmer alls – AI:n har \"hallucinerat\" fram data som saknades.\n\nFråga: Vem bär det formella ansvaret för det felaktiga underlaget enligt stadens regler?",
    correctRuleId: 6,
    explanation: "Regel 6: Kontrollera resultatet. Som chef bär du alltid det yttersta ansvaret för det material din enhet levererar. Regel 6 är tydlig: \"Du ansvarar alltid själv för resultatet av ditt arbete\". I rollen som chef innebär det att du ansvarar för att kvalitetssäkra det dina medarbetare producerat med AI-stöd innan det når ledningen. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: Du ansvarar alltid själv för resultatet av ditt arbete.",
    socraticQuestion: "Hur kan du som chef bygga in rutiner för mänsklig granskning som inte hindrar innovationen på enheten?",
    options: [1, 6, 7, 8],
    nudge: {
      title: "Vill du veta varför?",
      content: "Fördjupning: Enligt styrdokumentet (Regel 6) är AI att betrakta som ett stödverktyg, inte en expert. Eftersom AI-modeller bygger på sannolikhet snarare än faktakontroll kan de skapa \"hallucinationer\" som ser korrekta ut vid en första anblick. Som chef äger du leveransen. Att ha en rutin för mänsklig faktagranskning är inte bara god förvaltningssed, det är ett krav för att säkerställa att ledningsbeslut vilar på korrekt grund.\n\nKärna: Kvalitetssäkring är en chefshantering, oavsett verktyg."
    }
  },
  {
    id: 'manager2',
    roleId: 'manager',
    text: "Case 2: Struktur för APT (Arbetsplatsträff)\nDu vill effektivisera planeringen av enhetens APT och ber en medarbetare ta fram en diskussionsstruktur kring \"framtidens kompetensförsörjning i förskolan\" med hjälp av AI. Medarbetaren matar in data från StratSys för att få en korrekt nulägesbild av förskolornas behov.\n\nFråga: Vilken regel riskerar att brytas här och vad är ditt ansvar som chef?",
    correctRuleId: 4,
    explanation: "Regel 4 (Sekretess) & Regel 5 (Personuppgifter). Du som chef måste sätta ramarna för vad som får matas in i AI-systemen. Behov på namngivna förskolor ska med stor försiktighet användas i publika AI-verktyg. Ditt ansvar är att skapa rutiner som skyddar känslig information. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Sekretess: Du ansvarar för att sekretessuppgifter och skyddsvärd information inte röjs.",
    socraticQuestion: "Om medarbetaren anonymiserar namnen på förskolorna, räcker det då för att uppfylla Regel 4?",
    options: [2, 4, 5, 8],
    nudge: {
      title: "Vill du veta varför?",
      content: "Fördjupning: När vi använder publika AI-tjänster skickas informationen utanför stadens nätverk. Även om du anonymiserar namn kan unika händelser (indirekta personuppgifter) röjas. Regel 4 och 5 skyddar inte bara individen, utan även stadens rykte som en trygg arbetsgivare. Som chef sätter du kulturen: Vi matar aldrig in sådant vi inte skulle vilja se på en löpsedel.\n\nKärna: HR-data kräver högsta skyddsnivå; publika AI-verktyg saknar detta skydd."
    }
  },
  {
    id: 'manager3',
    roleId: 'manager',
    text: "Case 3: Implementering av AI-verktyg på enheten\nNågra av dina medarbetare har börjat använda ett olicensierat AI-verktyg för att transkribera exit-samtal för att spara tid. De tycker att det fungerar fantastiskt och vill att hela enheten ska börja använda det.\n\nFråga: Hur bör du som chef agera utifrån stadens styrning?",
    correctRuleId: 2,
    explanation: "Regel 2: Använd lämpliga AI-system. Som chef ansvarar du för att din enhet endast använder system som är anskaffade eller godkända av staden. Du behöver pausa användningen och stämma av med förvaltningens digitaliseringsenhet eller IT-avdelning för att säkerställa att verktyget uppfyller säkerhetskraven innan det blir en del av arbetsrutinen. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Säkerhetskrav: Systemet måste uppfylla säkerhetskraven för den typ av information du hanterar.",
    socraticQuestion: "Varför är ett personuppgiftsbiträdesavtal (PUB) så viktigt när vi transkriberar personalärenden?",
    options: [2, 3, 6, 9],
    nudge: {
      title: "Vill du veta varför?",
      content: "Fördjupning: \"Skugg-IT\" (att använda egna appar) är en stor säkerhetsrisk. Stadens Regel 2 finns för att vi ska veta var vår data hamnar och att vi har tecknat personuppgiftsbiträdesavtal (PUB). Om ett transkriberingsverktyg läcker känsliga samtal är det förvaltningen som står som ansvarig. Din roll som chef är att styra medarbetarna mot stadens godkända alternativ.\n\nKärna: Användarvänlighet får aldrig gå före rättssäkerhet och dataskydd."
    }
  },
  {
    id: 'manager4',
    roleId: 'manager',
    text: "Case 4: Beslutsstöd vid resursfördelning\nDu ska fördela kompetensutvecklingsmedel mellan olika områden. En utvecklingsledare har tagit fram ett prioriteringsförslag med hjälp av en AI-modell. Du förstår inte riktigt varför vissa förskolor i högindexområden har fått lägre prioritet än förväntat, men \"det ser proffsigt ut\".\n\nFråga: Vilket etiskt dilemma står du inför som chef här?",
    correctRuleId: 1,
    explanation: "Regel 1: Etiskt och ansvarsfullt (Förklarbarhet). Som chef får du aldrig fatta beslut baserat på AI-underlag som du inte kan förklara eller motivera mänskligt. Detta är särskilt viktigt i högindexområden (Regel 3). Du har ett ansvar att \"öppna den svarta lådan\" och kräva insyn i hur förslaget tagits fram för att undvika osaklig diskriminering. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Etiskt och ansvarsfullt: Du ansvarar för att du använder AI på ett etiskt och ansvarsfullt sätt.",
    socraticQuestion: "Hur säkerställer du att medarbetare vågar ifrågasätta en AI-modells 'proffsiga' förslag?",
    options: [1, 3, 6, 7],
    nudge: {
      title: "Vill du veta varför?",
      content: "Fördjupning: AI-modeller kan dölja bias (fördomar) i sin data. Om we fördelar resurser till förskolor baserat på en algoritm vi inte förstår, kan vi omedvetet förstärka ojämlikhet. Regel 1 och 3 kräver \"förklarbarhet\". Du måste kunna svara en upprörd rektor varför ett beslut fattades. Kan inte AI:n förklara det, måste den mänskliga analysen styra.\n\nKärna: Transparens och mänskligt omdöme är garanten för en rättvis förskola."
    }
  },
  {
    id: 'manager5',
    roleId: 'manager',
    text: "Case 5: Kommunikation på enhetsmötet\nDu märker att stämningen på enheten är lite orolig kring AI – vissa är rädda att deras arbetsuppgifter ska försvinna. Du vill använda AI för att skriva ett peppande manus till nästa enhetsmöte för att lugna personalen.\n\nFråga: Vad är viktigast att tänka på när du använder AI för att kommunicera som ledare?",
    correctRuleId: 7,
    explanation: "Regel 7: Transparens. För att behålla förtroendet bör du vara öppen med när du använder AI. Genom att berätta: \"Jag har tagit hjälp av AI för att strukturera mina tankar inför idag\", agerar du som en förebild och visar på en transparent och ansvarsfull användning i linje med stadens policy. [Källa: Att använda AI i Göteborgs Stad]",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: Vi ska kunna förklara för andra hur vi använder AI.",
    socraticQuestion: "Kan för hög transparens (t.ex. att AI skrivit HELA talet) minska din auktoritet som ledare?",
    options: [1, 7, 8, 9],
    nudge: {
      title: "Vill du veta varför?",
      content: "Fördjupning: Regel 7 om transparens handlar om att bygga en tillitskultur. Genom att vara öppen med att du använder AI avmystifierar du tekniken. Det visar att AI är ett komplement till ditt ledarskap, inte en ersättare. Det ger också dina medarbetare tryggheten att själva våga utforska verktygen under ordnade och öppna former.\n\nKärna: Ett modernt ledarskap kräver ärlighet om de verktyg vi använder."
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
      roleIds: ['hr', 'dev-lead', 'manager'],
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
      roleIds: ['hr', 'dev-lead', 'manager'],
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
      roleIds: ['hr', 'dev-lead', 'manager'],
      level: CourseLevel.BASIC,
      category: 'Juridik',
      durationMinutes: 5
    }
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- HR-SPECIALIST/REKRYTERARE ---
  {
    id: 'hr-ethics-control',
    roleId: 'hr',
    ruleIds: [1, 6],
    question: "Du låter AI föreslå vilka kandidater som verkar mest lämpade, men du granskar själv mot kravprofilen och dokumenterar varför du går vidare med vissa. Det är ett exempel på mänsklig kontroll.",
    answer: true,
    explanation: "Sant. Regel 1 och 6 kräver att du använder AI ansvarsfullt, kontrollerar resultatet och själv ansvarar för hur det används."
  },
  {
    id: 'hr-approved-system',
    roleId: 'hr',
    ruleIds: [2, 3],
    question: "Om ett AI-verktyg är lätt att använda och ger bra rekryteringsstöd kan du använda det för urval även om det inte är godkänt för den information du hanterar.",
    answer: false,
    explanation: "Falskt. Regel 2 kräver att systemet uppfyller säkerhetskraven, och regel 3 påminner om särskilda krav vid högrisk AI-användning."
  },
  {
    id: 'hr-confidential-personal-data',
    roleId: 'hr',
    ruleIds: [4, 5],
    question: "Det räcker att ta bort kandidatens namn innan du klistrar in CV och personligt brev i en publik AI-tjänst.",
    answer: false,
    explanation: "Falskt. Regel 4 och 5 skyddar sekretess, skyddsvärd information och personuppgifter; CV-data kan ofta identifiera en person indirekt."
  },
  {
    id: 'hr-transparency-records',
    roleId: 'hr',
    ruleIds: [7, 8],
    question: "Om AI hjälper dig att formulera intervjufrågor som påverkar rekryteringsprocessen kan det vara relevant att kunna visa hur AI användes.",
    answer: true,
    explanation: "Sant. Regel 7 handlar om transparens, och regel 8 innebär att både inmatning och resultat kan bli allmän handling."
  },
  {
    id: 'hr-copyright-trust',
    roleId: 'hr',
    ruleIds: [9, 7],
    question: "AI-genererade bilder eller texter i rekryteringsmaterial kan användas utan extra granskning så länge de ser professionella ut.",
    answer: false,
    explanation: "Falskt. Regel 9 kräver respekt för upphovsrätt, och regel 7 kräver transparent användning som inte skadar förtroendet."
  },

  // --- UTVECKLINGSLEDARE ---
  {
    id: 'dev-ethics-control',
    roleId: 'dev-lead',
    ruleIds: [1, 6],
    question: "Du använder AI för att sammanfatta enkätkommentarer men jämför slutsatserna med originalmaterialet innan de används i planering. Det är rätt arbetssätt.",
    answer: true,
    explanation: "Sant. Regel 1 och 6 kräver etiskt ansvar, mänsklig kontroll och att du kontrollerar resultatet innan det används."
  },
  {
    id: 'dev-approved-system',
    roleId: 'dev-lead',
    ruleIds: [2, 3],
    question: "Ett AI-förslag om resursfördelning i prioriterade områden kan användas direkt om modellen presenterar ett tydligt diagram.",
    answer: false,
    explanation: "Falskt. Regel 2 och 3 kräver rätt säkerhetsnivå och särskild försiktighet vid högrisk eller verksamhetspåverkande AI-användning."
  },
  {
    id: 'dev-confidential-personal-data',
    roleId: 'dev-lead',
    ruleIds: [4, 5],
    question: "Frisvar från medarbetarenkäter kan analyseras i publik AI om namn tas bort, även när svaren innehåller unika händelser eller arbetsplatsdetaljer.",
    answer: false,
    explanation: "Falskt. Regel 4 och 5 gäller även indirekt identifiering och skyddsvärd information, inte bara synliga namn."
  },
  {
    id: 'dev-transparency-records',
    roleId: 'dev-lead',
    ruleIds: [7, 8],
    question: "Om AI används för att ta fram ett underlag som påverkar ett beslut behöver du kunna förklara användningen och hantera materialet som möjlig allmän handling.",
    answer: true,
    explanation: "Sant. Regel 7 kräver transparens och regel 8 påminner om att både promptar och resultat kan omfattas av offentlighetsprincipen."
  },
  {
    id: 'dev-copyright-trust',
    roleId: 'dev-lead',
    ruleIds: [9, 7],
    question: "En AI-genererad bild i informationsmaterial behöver granskas så att den inte bryter mot upphovsrätt, använder fel symboler eller vilseleder mottagaren.",
    answer: true,
    explanation: "Sant. Regel 9 handlar om upphovsrätt och regel 7 om transparent användning som bidrar till förtroende."
  },

  // --- CHEF ---
  {
    id: 'manager-ethics-control',
    roleId: 'manager',
    ruleIds: [1, 6],
    question: "Som chef kan du delegera AI-granskningen helt till medarbetaren som skapade underlaget, eftersom ansvaret följer den som använde verktyget.",
    answer: false,
    explanation: "Falskt. Regel 1 och 6 innebär att AI-resultat måste kontrolleras och att du ansvarar för hur materialet används i din verksamhet."
  },
  {
    id: 'manager-approved-system',
    roleId: 'manager',
    ruleIds: [2, 3],
    question: "Om flera medarbetare vill börja använda ett nytt AI-verktyg för transkribering bör du först säkerställa att verktyget är godkänt för informationstypen.",
    answer: true,
    explanation: "Sant. Regel 2 kräver att systemet uppfyller säkerhetskraven, och regel 3 kräver extra kontroll när användningen kan innebära hög risk."
  },
  {
    id: 'manager-confidential-personal-data',
    roleId: 'manager',
    ruleIds: [4, 5],
    question: "Du kan uppmuntra medarbetare att använda publik AI för APT-underlag så länge de bara undviker ordet sekretess i prompten.",
    answer: false,
    explanation: "Falskt. Regel 4 och 5 kräver att sekretess, skyddsvärd information och personuppgifter faktiskt skyddas, inte bara att vissa ord undviks."
  },
  {
    id: 'manager-transparency-records',
    roleId: 'manager',
    ruleIds: [7, 8],
    question: "När AI används i beslutsunderlag bör enheten ha rutiner för att kunna redovisa AI-användningen och spara relevant material vid behov.",
    answer: true,
    explanation: "Sant. Regel 7 kräver transparens, och regel 8 innebär att inmatning och resultat kan bli allmänna handlingar."
  },
  {
    id: 'manager-copyright-trust',
    roleId: 'manager',
    ruleIds: [9, 7],
    question: "Som chef behöver du sätta ramar för AI-genererat kommunikationsmaterial så att upphovsrätt, märkning och förtroende hanteras rätt.",
    answer: true,
    explanation: "Sant. Regel 9 kräver respekt för upphovsrätt, och regel 7 kräver transparent användning som stärker förtroendet."
  }
];

export const ROLE_SCENARIOS: Record<string, string> = {
  ['hr']: "Du överväger att använda AI för att sortera ut de 10 bästa kandidaterna till en rektorstjänst baserat på personlighetstest. Hur reflekterar du kring kravet på förklarbarhet?",
  ['dev-lead']: "Du leder ett projekt där AI ska användas för att analysera frisvar i medarbetarenkäten. Hur säkerställer du att integriteten bevaras?",
  ['manager']: "Du märker att dina medarbetare börjar använda AI för att skriva beslutsunderlag. Hur agerar du för att säkerställa att transparensen bibehålls?"
};

export const DEFAULT_COURSE: MicroCourse = {
  id: 'ai-i-vardagen-goteborgs-stad',
  title: 'AI i Vardagen',
  description: 'En interaktiv utbildningsplattform för anställda i Göteborgs Stad om ansvarsfull användning av AI.',
  sourceTitle: 'Att använda AI i Göteborgs Stad',
  sourceFileName: 'att-anvanda-ai-i-goteborgs-stad.pdf',
  roleCount: 3,
  createdAt: '2026-05-05T00:00:00.000Z',
  status: 'published',
  roles: COURSE_ROLES,
  rules: GOLDEN_RULES,
  modules: MODULES,
  matchingScenarios: MATCHING_SCENARIOS,
  roleScenarios: ROLE_SCENARIOS,
  quizQuestions: QUIZ_QUESTIONS,
  nanoCourse: [
    {
      id: 'hr-nano-1',
      roleId: 'hr',
      subject: 'AI i rekrytering: börja med dataskyddet',
      body: 'När AI används i rekrytering behöver CV, personliga brev och referenser hanteras som personuppgifter. Använd inte öppna AI-tjänster för kandidatdata.',
      cta: 'Gå igenom vilka delar av din rekryteringsprocess som innehåller personuppgifter.',
      suggestedSendStep: 'Dag 1',
      reminderText: 'Påminnelse: kontrollera alltid var kandidatdata hamnar innan AI används.',
    },
    {
      id: 'dev-lead-nano-1',
      roleId: 'dev-lead',
      subject: 'AI i analys: skydda fritext och källor',
      body: 'Vid analys av enkäter och rapporter behöver du tänka på sekretess, transparens och kvalitetssäkring av AI-sammanfattningar.',
      cta: 'Välj en analysuppgift och formulera hur du kan anonymisera underlaget.',
      suggestedSendStep: 'Dag 1',
      reminderText: 'Påminnelse: AI-svar behöver alltid granskas mot källan.',
    },
    {
      id: 'manager-nano-1',
      roleId: 'manager',
      subject: 'Chefens ansvar: sätt ramar för AI',
      body: 'Som chef behöver du skapa rutiner för när AI får användas, hur resultat kontrolleras och hur användningen dokumenteras.',
      cta: 'Ta upp en konkret AI-rutin på nästa APT.',
      suggestedSendStep: 'Dag 1',
      reminderText: 'Påminnelse: ansvar och mänsklig kontroll kan inte delegeras till AI.',
    },
  ],
  emailCampaignDraft: {
    status: 'draft',
    subjectTemplate: '{{nanoSubject}}',
    introText: 'Hej! Här kommer en kort nanokurs kopplad till utbildningen AI i Vardagen.',
    recipientGroups: [],
  },
  resources: [
    {
      title: 'Att använda AI i Göteborgs Stad',
      href: '/resources/att-anvanda-ai-i-goteborgs-stad.pdf',
      format: 'PDF',
    },
  ],
};
