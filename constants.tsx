import { GoldenRule, UserRole, CourseLevel, CourseModule, QuizQuestion, MatchingScenario } from './types';

export const GOLDEN_RULES: GoldenRule[] = [
  { id: 1, title: 'Etiskt och ansvarsfullt', content: 'Du ansvarar för att du använder AI på ett etiskt och ansvarsfullt sätt utifrån stadens demokratiska uppdrag.' },
  { id: 2, title: 'Säkerhetskrav', content: 'Innan du använder ett AI-system behöver du vara säker på att systemet uppfyller säkerhetskraven för den typ av information du hanterar.' },
  { id: 3, title: 'Förbjudna system', content: 'Det finns särskilda krav på AI-användning som innebär höga risker och en del AI-system är helt förbjudna.' },
  { id: 4, title: 'Sekretess', content: 'Du ansvarar för att sekretessuppgifter och skyddsvärd information inte röjs för obehöriga. Detta gäller särskilt personuppgifter.', criticalForHR: true },
  { id: 5, title: 'Personuppgifter (GDPR)', content: 'Du får bara behandla personuppgifter om det sker i enlighet med dataskyddslagstiftningen.', criticalForHR: true },
  { id: 6, title: 'Mänsklig kontroll', content: 'Du ansvarar för att granska AI-genererade resultat innan de används i ditt arbete. AI kan vara ett stöd, men det är människan som ansvarar för bedömningen och beslutet.', criticalForHR: true },
  { id: 7, title: 'Transparens', content: 'Vi ska kunna förklara för sökande och politiker hur vi använder AI i våra processer.' },
  { id: 8, title: 'Allmänna handlingar', content: 'Information du lägger in i systemet och resultat som du får ut kan bli allmänna handlingar som omfattas av offentlighetsprincipen.' },
  { id: 9, title: 'Upphovsrätt', content: 'Du ansvarar för att upphovsrätten respekteras när du använder ett AI-system.' },
];

export const MATCHING_SCENARIOS: MatchingScenario[] = [
  // --- HR-SPECIALIST/REKRYTERARE ---
  {
    id: 'hr1',
    role: UserRole.HR,
    text: "CV-analys i publik AI-tjänst. Du vill snabba på urvalet genom att låta AI sammanfatta kandidaternas CV:n och personliga brev i en publik AI-tjänst.",
    correctRuleId: 5,
    explanation: "Personuppgifter: CV och personliga brev innehåller omfattande personuppgifter. Innan sådan information används i ett AI-system måste systemet vara godkänt för behandlingen och dataskyddskraven vara uppfyllda.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Personuppgifter (GDPR): Vilken information om kandidaten lämnar stadens kontroll när dokumentet skickas till AI-tjänsten?",
    socraticQuestion: "Om du ändå vill använda AI för att analysera kravprofilen – hur kan du göra det utan att föra över personuppgifter?",
    options: [1, 2, 4, 5],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "CV:n innehåller ofta indirekta personuppgifter. Även om du tar bort namnet kan kombinationen av tidigare arbetsplatser, utbildningsår och specifika projekt göra personen identifierbar, till exempel via LinkedIn.\n\nFör att hantera personuppgifter i en AI-tjänst behöver systemet vara godkänt för ändamålet och det måste finnas rättslig grund. Många publika tjänster uppfyller inte dessa krav.\n\nKärnbudskap: Skydda personlig integritet genom att välja rätt system och undvik att föra över identifierande information."
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
    text: "Forskningssammanfattning. Du använder AI för att sammanfatta flera rapporter inför ett beslutsunderlag. När en kollega frågar hur slutsatserna har tagits fram inser du att det inte framgår någonstans att AI har använts.",
    correctRuleId: 7,
    explanation: "Transparens: När AI används som stöd i ett underlag behöver du kunna beskriva hur verktyget har använts och hur resultatet har granskats.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Transparens: Kan du förklara vilken roll AI hade i arbetet och vad du själv har kontrollerat?",
    socraticQuestion: "Vad behöver du dokumentera för att någon annan ska kunna förstå hur AI bidrog till underlaget?",
    options: [4, 7, 8, 9],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "Regel 7 handlar om öppenhet och spårbarhet. När AI har bidragit till ett underlag behöver mottagaren kunna förstå vad verktyget gjorde, vilka källor som användes och vad du själv har granskat eller kompletterat.\n\nGör det tydligt i underlaget hur AI har använts och spara gärna anteckningar om prompts och granskning så att arbetet kan följas upp i efterhand.\n\nKärnbudskap: Transparens skapar tillit – berätta hur AI har bidragit."
    }
  },
  {
    id: 'utv2',
    role: UserRole.DEV_LEAD,
    text: "AI-bild i material. Du tar fram en bild med AI till en broschyr. När du granskar bilden upptäcker du att den innehåller en felaktig symbol som liknar stadens logotyp.",
    correctRuleId: 9,
    explanation: "Upphovsrätt och granskning: AI-genererat bildmaterial behöver alltid granskas innan användning. Kontrollera att bilden inte innehåller felaktiga symboler, logotyper eller upphovsrättsskyddat innehåll och att mottagaren inte vilseleds.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Upphovsrätt: Har du granskat att bilden inte innehåller felaktiga symboler eller material som kräver rättigheter?",
    socraticQuestion: "Vad behöver du kontrollera och tydliggöra innan en AI-genererad bild används i stadens material?",
    options: [2, 7, 8, 9],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "AI-bilder kan se övertygande ut men innehålla felaktiga detaljer som logotyper eller varumärken. Du ansvarar för att materialet är korrekt och följer stadens grafiska profil.\n\nGranska alltid bilden noga, säkerställ att upphovsrätten respekteras och var tydlig mot mottagaren när bilden är AI-genererad så att ingen vilseleds.\n\nKärnbudskap: Granskning och tydlighet skyddar trovärdigheten."
    }
  },
  {
    id: 'utv3',
    role: UserRole.DEV_LEAD,
    text: "Prioritering av utvecklingsinsatser. Du ber AI hjälpa dig analysera verksamhetsdata och föreslå vilka förskolor som bör få extra stöd. När du granskar förslaget ser du att några förskolor med stora behov får låg prioritet, men det framgår inte varför.",
    correctRuleId: 6,
    explanation: "Mänsklig kontroll: AI kan bidra med analys, men du behöver själv granska vilka antaganden och underlag som ligger bakom förslaget innan det används i planeringen.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: Ett AI-förslag blir inte automatiskt ett bra beslutsunderlag.",
    socraticQuestion: "Vad skulle du vilja kontrollera innan du använder AI-förslaget för att prioritera insatser?",
    options: [1, 3, 6, 7],
    nudge: {
      title: "🔍 Vill du förstå varför?",
      content: "AI kan hitta mönster i data men förklarar inte alltid vilka antaganden som ligger bakom ett förslag. Om träningsdata innehåller skevheter kan förslaget spegla dem utan att det syns.\n\nEnligt Regel 6 behöver du granska underlaget, ställa frågor om hur slutsatsen togs fram och säkerställa att prioriteringen vilar på begriplig och rättvis grund innan du går vidare.\n\nKärnbudskap: Låt AI stödja analysen, men behåll den mänskliga bedömningen."
    }
  },

  // --- CHEF (MANAGER) ---
  {
    id: 'manager1',
    role: UserRole.MANAGER,
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
    role: UserRole.MANAGER,
    text: "Struktur för APT. En medarbetare använder en publik AI-tjänst för att förbereda en diskussion om kompetensförsörjning. För att få bättre förslag klistrar hen in uppgifter från StratSys som innehåller information om bemanning, sjukfrånvaro och behov på enskilda förskolor.\n\nFråga: Vad behöver du som chef reagera på?",
    correctRuleId: 4,
    explanation: "Sekretess och skyddsvärd information: Innan verksamhetsinformation förs över till en extern AI-tjänst måste du veta att systemet är godkänt för den typen av information.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Sekretess: Fundera på vilken information som lämnar stadens miljö när den klistras in i AI-tjänsten.",
    socraticQuestion: "Hur skulle medarbetaren kunna få hjälp av AI utan att föra över verksamhetsinformation som inte hör hemma i tjänsten?",
    options: [2, 4, 5, 8],
    nudge: {
      title: "Vill du veta varför?",
      content: "När uppgifter från interna system klistras in i en publik AI-tjänst lämnar informationen stadens kontrollerade miljö. Även sammanställd verksamhetsdata kan vara känslig om den går att koppla till specifika enheter eller förhållanden.\n\nSom chef behöver du tydliggöra vilka typer av information som får användas i vilka system och hänvisa till godkända alternativ. Behöver AI användas, bör det ske med avidentifierat eller mer generellt underlag.\n\nKärna: Säkerställ att verksamhetsinformation hanteras i rätt system."
    }
  },
  {
    id: 'manager3',
    role: UserRole.MANAGER,
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
    role: UserRole.MANAGER,
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
    role: UserRole.MANAGER,
    text: "AI sammanfattar medarbetarnas synpunkter. Efter en workshop har du ett stort antal anonymiserade fritextsvar. Du låter AI sammanfatta vad medarbetarna tycker och använder sammanfattningen när du presenterar resultatet för gruppen. Några medarbetare känner inte igen sig i slutsatserna.\n\nFråga: Vad är viktigast att tänka på innan du presenterar AI:s sammanfattning som gruppens bild?",
    correctRuleId: 6,
    explanation: "Mänsklig kontroll: AI kan hjälpa dig hitta mönster, men du behöver kontrollera att sammanfattningen faktiskt representerar materialet och inte förstärker, tonar ned eller hittar på slutsatser.",
    sourceQuote: "Källa: Att använda AI i Göteborgs Stad",
    clue: "Mänsklig kontroll: AI:s sammanfattning är en tolkning av materialet, inte materialet självt.",
    socraticQuestion: "Hur kan du använda AI:s sammanfattning utan att låta verktyget bli medarbetarnas röst?",
    options: [1, 6, 7, 8],
    nudge: {
      title: "Vill du veta varför?",
      content: "En AI-sammanfattning komprimerar materialet och kan oavsiktligt lyfta vissa mönster, tona ned nyanser eller lägga till formuleringar som inte fanns i underlaget.\n\nJämför därför alltid sammanfattningen med originalsvaren, kontrollera att nyanser finns kvar och var tydlig med att det är din tolkning med AI-stöd, inte automatiskt gruppens samlade röst.\n\nKärna: Granska att sammanfattningen är rättvisande innan du presenterar den."
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
  // --- GENERELT / MANAGER ---
  {
    question: "Är det tillåtet att använda AI för att rangordna kandidater om jag själv fattar slutbeslutet?",
    answer: false,
    explanation: "Falskt. Policyn kräver att vi förstår hur AI:n tagit fram resultatet (förklarbarhet) för att undvika diskriminering."
  },
  {
    question: "Om jag använder AI för att rätta stavfel i ett offentligt dokument, räknas det fortfarande som att jag är 'människan i loopen'?",
    answer: true,
    explanation: "Sant. Men du måste fortfarande läsa igenom slutresultatet för att säkerställa att AI:n inte ändrat betydelsen i texten."
  },

  // --- UTVECKLINGSLEDARE SPECIFIKT ---
  {
    role: UserRole.DEV_LEAD,
    question: "Är det tillåtet att använda publik AI för att omarbeta språket i introduktionsplaner, under förutsättning att ingen sekretess eller känslig info matas in?",
    answer: true,
    explanation: "Sant, men med stor försiktighet. Du bär ansvaret för att AI:n inte hittar på egna rutiner och du får absolut inte mata in säkerhetskoder eller interna detaljer (Regel 2 & 6)."
  },
  {
    role: UserRole.DEV_LEAD,
    question: "Det är säkert att analysera transkriberade exit-samtal i en publik AI så länge jag har tagit bort personnamnen.",
    answer: false,
    explanation: "Falskt. Risken för indirekt identifiering via unika händelser eller citat är hög. För personalärenden krävs stadsövergripande, säkra AI-miljöer (Regel 5 & 8)."
  },
  {
    role: UserRole.DEV_LEAD,
    question: "AI-genererade bilder för rekrytering får användas fritt så länge de är märkta som 'AI-genererad'.",
    answer: false,
    explanation: "Falskt. Bilderna måste också vara sakliga och inte ge en vilseledande bild av verksamheten. Dessutom får man inte använda stadens egna bildbanker för att träna AI:n (Regel 9)."
  }
];

export const ROLE_SCENARIOS = {
  [UserRole.HR]: "Du överväger att använda AI för att sortera ut de 10 bästa kandidaterna till en rektorstjänst baserat på personlighetstest. Hur reflekterar du kring kravet på förklarbarhet?",
  [UserRole.DEV_LEAD]: "Du leder ett projekt där AI ska användas för att analysera frisvar i medarbetarenkäten. Hur säkerställer du att integriteten bevaras?",
  [UserRole.MANAGER]: "Du märker att dina medarbetare börjar använda AI för att skriva beslutsunderlag. Hur agerar du för att säkerställa att transparensen bibehålls?"
};
