export type MissionCategory = "social" | "environment" | "culture" | "elderly" | "food" | "digital";

export interface Mission {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  category: MissionCategory;
  coins: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  distance: string;
  deadline: string;
  organizer: string;
  location: string;
  participantsMax: number;
  participantsCurrent: number;
  imageSeed: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  level: "Bronze" | "Silber" | "Gold" | "Platin";
  district: string;
  missionsCompleted: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface Reward {
  id: string;
  title: string;
  partner: string;
  coinCost: number;
  description: string;
  category: string;
  imageSeed: string;
}

export const missions: Mission[] = [
  {
    id: "m1",
    title: "Großer Teich Müllsammelaktion",
    description: "Gemeinsam das Ufer am Großen Teich von Müll befreien und die Natur schützen.",
    fullDescription: "Jeden Samstag treffen wir uns am Großen Teich in der Soester Altstadt, um gemeinsam das Ufer und die Wege von Müll zu befreien. Handschuhe und Müllsäcke werden gestellt. Nach der Aktion gibt es Getränke und Snacks für alle Helfer im Bürgertreff. Zusammen halten wir unser Naherholungsgebiet sauber!",
    category: "environment",
    coins: 35,
    difficulty: 2,
    distance: "0.8 km",
    deadline: "Jeden Samstag, 10:00 Uhr",
    organizer: "Grünes Soest e.V.",
    location: "Großer Teich, Eingang Thomästraße",
    participantsMax: 30,
    participantsCurrent: 18,
    imageSeed: "pond-cleanup-soest",
  },
  {
    id: "m2",
    title: "Essen für Senioren verteilen",
    description: "Warme Mahlzeiten an ältere Mitbürger in der Soester Innenstadt liefern.",
    fullDescription: "Die Soester Tafel sucht ehrenamtliche Fahrer und Helfer, die warme Mahlzeiten an Senioren in der Altstadt und den umliegenden Ortsteilen ausliefern. Die Tour dauert ca. 2 Stunden und umfasst 8-12 Haushalte. Ein Fahrzeug wird gestellt.",
    category: "elderly",
    coins: 50,
    difficulty: 2,
    distance: "0.5 km",
    deadline: "Mo-Fr, 11:00-13:00 Uhr",
    organizer: "Soester Tafel e.V.",
    location: "Ulricher Straße 18, Soest",
    participantsMax: 8,
    participantsCurrent: 5,
    imageSeed: "food-delivery-seniors",
  },
  {
    id: "m3",
    title: "Bäume pflanzen am Soester Wall",
    description: "Neue Bäume entlang der historischen Wallanlage pflanzen.",
    fullDescription: "Im Rahmen der städtischen Begrünungsinitiative pflanzen wir 40 neue Laubbäume entlang des Soester Walls. Die Wallanlage ist das grüne Herz der Stadt und braucht Nachpflanzungen. Werkzeug und Setzlinge werden vom Grünflächenamt bereitgestellt. Bitte festes Schuhwerk mitbringen!",
    category: "environment",
    coins: 60,
    difficulty: 3,
    distance: "1.2 km",
    deadline: "12. April 2026, 09:00 Uhr",
    organizer: "Stadt Soest - Grünflächenamt",
    location: "Osthofentor, Wallanlage",
    participantsMax: 40,
    participantsCurrent: 27,
    imageSeed: "tree-planting-wall",
  },
  {
    id: "m4",
    title: "Digitalhilfe für Senioren im Rathaus",
    description: "Älteren Menschen den Umgang mit Smartphone und Internet erklären.",
    fullDescription: "Jeden Mittwoch bieten wir im Soester Rathaus eine offene Sprechstunde an, in der junge Freiwillige Senioren bei digitalen Fragen helfen: Smartphone einrichten, Video-Telefonate führen, Online-Banking erklären, die Soest-App nutzen. Geduld und Freundlichkeit sind wichtiger als Technik-Wissen!",
    category: "digital",
    coins: 40,
    difficulty: 2,
    distance: "0.3 km",
    deadline: "Jeden Mittwoch, 14:00-16:00 Uhr",
    organizer: "Seniorenbeirat Soest",
    location: "Rathaus Soest, Am Vreithof 8",
    participantsMax: 12,
    participantsCurrent: 7,
    imageSeed: "digital-help-rathaus",
  },
  {
    id: "m5",
    title: "Lebensmittel retten am Wochenmarkt",
    description: "Übrig gebliebene Lebensmittel vom Markt einsammeln und verteilen.",
    fullDescription: "Samstags nach Marktschluss auf dem Petrikirchhof sammeln wir übrig gebliebene, aber einwandfreie Lebensmittel von den Markthändlern ein. Diese werden sortiert und an bedürftige Familien und die Tafel weitergegeben. Wir brauchen Helfer zum Tragen, Sortieren und Ausfahren.",
    category: "food",
    coins: 30,
    difficulty: 2,
    distance: "0.4 km",
    deadline: "Jeden Samstag, 13:00 Uhr",
    organizer: "Foodsharing Soest",
    location: "Wochenmarkt, Petrikirchhof",
    participantsMax: 15,
    participantsCurrent: 9,
    imageSeed: "food-rescue-market",
  },
  {
    id: "m6",
    title: "Allerheiligenkirmes Helfer gesucht",
    description: "Unterstütze das größte Altstadtvolksfest Europas als freiwilliger Helfer.",
    fullDescription: "Die Allerheiligenkirmes ist das Highlight des Soester Jahres! Wir suchen Freiwillige für Information, Besucherbetreuung, Auf- und Abbau sowie Sauberkeit. Du erlebst die Kirmes hautnah und hilfst dabei, dieses Traditionsereignis für alle unvergesslich zu machen.",
    category: "culture",
    coins: 70,
    difficulty: 3,
    distance: "0.2 km",
    deadline: "1.-5. November 2026",
    organizer: "Soester Wirtschaftsförderung",
    location: "Soester Altstadt, diverse Standorte",
    participantsMax: 50,
    participantsCurrent: 31,
    imageSeed: "kirmes-soest-fest",
  },
  {
    id: "m7",
    title: "Spielplatz-Patenschaft übernehmen",
    description: "Einen Spielplatz in deinem Ortsteil regelmäßig kontrollieren und pflegen.",
    fullDescription: "Als Spielplatz-Pate kontrollierst du einmal pro Woche einen zugewiesenen Spielplatz auf Schäden, Verschmutzung und Sicherheitsmängel. Du meldest Probleme der Stadt und führst kleine Aufräum-Arbeiten selbst durch. Eine Patenschaft läuft mindestens 3 Monate.",
    category: "social",
    coins: 25,
    difficulty: 1,
    distance: "0.7 km",
    deadline: "Laufend - jederzeit starten",
    organizer: "Jugendamt Stadt Soest",
    location: "Verschiedene Spielplätze im Stadtgebiet",
    participantsMax: 20,
    participantsCurrent: 12,
    imageSeed: "playground-soest",
  },
  {
    id: "m8",
    title: "Fahrrad-Reparatur-Workshop am Wall",
    description: "Hilf Mitbürgern dabei, ihre Fahrräder fit für den Frühling zu machen.",
    fullDescription: "In unserer offenen Fahrradwerkstatt am Kattenturm helfen erfahrene Schrauber Bürgerinnen und Bürgern bei der Reparatur ihrer Räder. Vom Platten flicken bis zur Bremsjustierung - jede Hand wird gebraucht! Werkzeug ist vorhanden.",
    category: "social",
    coins: 35,
    difficulty: 3,
    distance: "0.9 km",
    deadline: "5. April 2026, 10:00-15:00 Uhr",
    organizer: "ADFC Ortsgruppe Soest",
    location: "Kattenturm, Wallanlage Soest",
    participantsMax: 10,
    participantsCurrent: 6,
    imageSeed: "bike-repair-wall",
  },
  {
    id: "m9",
    title: "Vorleseaktion in der Stadtbücherei",
    description: "Kindern aus verschiedenen Kulturen vorlesen und gemeinsam basteln.",
    fullDescription: "Jeden Freitagnachmittag lesen Freiwillige Kindern zwischen 4 und 8 Jahren in der Stadtbücherei Soest vor. Besonders gesucht: Menschen, die auch in anderen Sprachen vorlesen können! Nach dem Vorlesen wird gemeinsam gebastelt.",
    category: "culture",
    coins: 30,
    difficulty: 1,
    distance: "0.6 km",
    deadline: "Jeden Freitag, 15:00-16:30 Uhr",
    organizer: "Stadtbücherei Soest",
    location: "Stadtbücherei, Windmühlenweg 1",
    participantsMax: 8,
    participantsCurrent: 4,
    imageSeed: "reading-children-soest",
  },
  {
    id: "m10",
    title: "Gemeinschaftsgarten Paradiese",
    description: "Einen Gemeinschaftsgarten im Ortsteil Paradiese aufbauen und bepflanzen.",
    fullDescription: "Auf einer Fläche in Paradiese entsteht ein neuer Gemeinschaftsgarten. Wir brauchen Helfer für das Anlegen von Hochbeeten, das Pflanzen von Gemüse und Blumen und die langfristige Pflege. Saatgut und Erde werden von lokalen Partnern gespendet.",
    category: "environment",
    coins: 55,
    difficulty: 4,
    distance: "2.4 km",
    deadline: "15. April 2026, 09:00 Uhr",
    organizer: "Quartierbüro Paradiese",
    location: "Paradieser Weg 38, Soest",
    participantsMax: 25,
    participantsCurrent: 14,
    imageSeed: "garden-paradiese",
  },
];

export const communityMembers: CommunityMember[] = [
  { id: "u1", name: "Marlene Schemme", avatar: "marlene", coins: 1240, level: "Platin", district: "Altstadt", missionsCompleted: 47 },
  { id: "u2", name: "Florian Westhoff", avatar: "florian", coins: 980, level: "Gold", district: "Paradiese", missionsCompleted: 38 },
  { id: "u3", name: "Ayse Korkmaz", avatar: "ayse", coins: 875, level: "Gold", district: "Ampen", missionsCompleted: 33 },
  { id: "u4", name: "Henrik Rademacher", avatar: "henrik", coins: 720, level: "Silber", district: "Ostönnen", missionsCompleted: 28 },
  { id: "u5", name: "Lena Poepping", avatar: "lena", coins: 695, level: "Silber", district: "Altstadt", missionsCompleted: 26 },
  { id: "u6", name: "Moussa Diallo", avatar: "moussa", coins: 610, level: "Silber", district: "Deiringsen", missionsCompleted: 23 },
  { id: "u7", name: "Clara Toenne", avatar: "clara", coins: 540, level: "Silber", district: "Meckingsen", missionsCompleted: 21 },
  { id: "u8", name: "Jonas Graewe", avatar: "jonas", coins: 485, level: "Bronze", district: "Altstadt", missionsCompleted: 19 },
  { id: "u9", name: "Fatima Benhadi", avatar: "fatima", coins: 430, level: "Bronze", district: "Paradiese", missionsCompleted: 17 },
  { id: "u10", name: "Tobias Viegener", avatar: "tobias", coins: 380, level: "Bronze", district: "Schwefe", missionsCompleted: 14 },
];

export const achievements: Achievement[] = [
  { id: "a1", name: "Erster Einsatz", description: "Deine erste Mission abgeschlossen", icon: "rocket", unlocked: true, unlockedDate: "2026-01-15" },
  { id: "a2", name: "Umweltheld", description: "5 Umwelt-Missionen abgeschlossen", icon: "leaf", unlocked: true, unlockedDate: "2026-02-20" },
  { id: "a3", name: "Digitalpionier", description: "3 Digital-Hilfe Missionen gemeistert", icon: "monitor", unlocked: true, unlockedDate: "2026-03-01" },
  { id: "a4", name: "Sozialer Anker", description: "10 soziale Missionen geschafft", icon: "heart", unlocked: false },
  { id: "a5", name: "Kulturkenner", description: "3 Kultur-Missionen besucht", icon: "palette", unlocked: true, unlockedDate: "2026-03-10" },
  { id: "a6", name: "Frühaufsteher", description: "5 Missionen vor 9 Uhr gestartet", icon: "sunrise", unlocked: false },
  { id: "a7", name: "Teamplayer", description: "An einer Mission mit 20+ Teilnehmern teilgenommen", icon: "users", unlocked: true, unlockedDate: "2026-02-05" },
  { id: "a8", name: "Marathon-Helfer", description: "30 Missionen insgesamt abgeschlossen", icon: "trophy", unlocked: false },
];

export const rewards: Reward[] = [
  { id: "r1", title: "AquaFun Tageskarte", partner: "AquaFun Soest", coinCost: 50, description: "Ein Tag freier Eintritt im AquaFun Soesterbörde.", category: "Freizeit", imageSeed: "aquafun-soest" },
  { id: "r2", title: "Cafe Gutschein 5 Euro", partner: "Cafe Fromme am Markt", coinCost: 30, description: "Gutschein für Heißgetränke und Kuchen im Cafe Fromme.", category: "Gastronomie", imageSeed: "cafe-fromme" },
  { id: "r3", title: "Stadtbücherei Jahresabo", partner: "Stadtbücherei Soest", coinCost: 80, description: "12 Monate kostenlose Ausleihe in der Stadtbücherei Soest.", category: "Bildung", imageSeed: "library-soest" },
  { id: "r4", title: "Bördemuseum Eintritt + Führung", partner: "Burghofmuseum Soest", coinCost: 45, description: "Eintritt und exklusive Führung durch die Soester Stadtgeschichte.", category: "Kultur", imageSeed: "museum-soest" },
  { id: "r5", title: "Bio-Gemüse-Kiste", partner: "Biolandhof Kneer", coinCost: 40, description: "Eine Kiste frisches Bio-Gemüse vom regionalen Biolandhof aus der Börde.", category: "Ernährung", imageSeed: "bio-gemuese-boerde" },
  { id: "r6", title: "Kino-Doppelkarte", partner: "Schlachthof Kino Soest", coinCost: 65, description: "Zwei Eintrittskarten für einen Film deiner Wahl im Schlachthof Kino.", category: "Freizeit", imageSeed: "kino-schlachthof" },
];

export const currentUser = {
  id: "u-self",
  name: "Max",
  fullName: "Max Brinkmann",
  avatar: "max",
  coins: 485,
  totalCoinsEarned: 685,
  level: "Silber" as const,
  nextLevel: "Gold" as const,
  coinsForNextLevel: 700,
  rank: 8,
  district: "Altstadt",
  missionsCompleted: 19,
  joinedDate: "2025-11-01",
  interests: ["environment", "digital", "social"],
  completedMissions: [
    { missionId: "m1", title: "Großer Teich Müllsammelaktion", date: "2026-03-22", coinsEarned: 35 },
    { missionId: "m4", title: "Digitalhilfe für Senioren im Rathaus", date: "2026-03-15", coinsEarned: 40 },
    { missionId: "m7", title: "Spielplatz-Patenschaft", date: "2026-03-08", coinsEarned: 25 },
    { missionId: "m5", title: "Lebensmittel retten am Wochenmarkt", date: "2026-03-01", coinsEarned: 30 },
    { missionId: "m3", title: "Bäume pflanzen am Soester Wall", date: "2026-02-20", coinsEarned: 60 },
    { missionId: "m9", title: "Vorleseaktion in der Stadtbücherei", date: "2026-02-14", coinsEarned: 30 },
  ],
  redeemedRewards: [
    { rewardId: "r2", title: "Cafe Gutschein 5 Euro - Cafe Fromme", redeemedDate: "2026-03-18", code: "KC-2026-0847" },
    { rewardId: "r5", title: "Bio-Gemüse-Kiste", redeemedDate: "2026-02-25", code: "KC-2026-0612" },
  ],
};

export const communityStats = {
  totalCoinsEarned: 34750,
  activeVolunteersThisWeek: 142,
  missionsCompletedTotal: 1283,
  mostActiveDistrict: "Altstadt",
};

export const categoryLabels: Record<MissionCategory, string> = {
  social: "Soziales",
  environment: "Umwelt",
  culture: "Kultur",
  elderly: "Seniorenhilfe",
  food: "Ernährung",
  digital: "Digital",
};

export const categoryColors: Record<MissionCategory, string> = {
  social: "bg-rose-100 text-rose-700",
  environment: "bg-emerald-100 text-emerald-700",
  culture: "bg-violet-100 text-violet-700",
  elderly: "bg-sky-100 text-sky-700",
  food: "bg-orange-100 text-orange-700",
  digital: "bg-cyan-100 text-cyan-700",
};

export const levelConfig = {
  Bronze: { min: 0, color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300" },
  Silber: { min: 300, color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-300" },
  Gold: { min: 700, color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-400" },
  Platin: { min: 1200, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-400" },
};
