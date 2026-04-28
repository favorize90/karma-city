// Whitelabel City Configuration
// Swap this object to rebrand the entire app for a different city.

export interface CityConfig {
  id: string;
  name: string;
  region: string;
  slogan: string;
  description: string;
  population: string;
  primaryColor: string;
  accentColor: string;
  website: string;
  districts: string[];
  heroStats: {
    volunteers: number;
    missions: number;
    hoursVolunteered: number;
    partners: number;
  };
}

export const cities: Record<string, CityConfig> = {
  soest: {
    id: "soest",
    name: "Soest",
    region: "Kreis Soest, NRW",
    slogan: "Deine Stadt. Dein Impact.",
    description: "Die historische Hansestadt an der Börde wird zur Vorreiterin für digitales Bürgerengagement.",
    population: "48.000",
    primaryColor: "#16a34a",
    accentColor: "#f59e0b",
    website: "https://www.soest.de",
    districts: [
      "Altstadt", "Ampen", "Deiringsen", "Enkesen", "Hattrop",
      "Lohne", "Meckingsen", "Meiningsen", "Müllingsen",
      "Ostönnen", "Paradiese", "Ruploh", "Schwefe", "Thöningsen",
    ],
    heroStats: {
      volunteers: 142,
      missions: 1283,
      hoursVolunteered: 4820,
      partners: 12,
    },
  },
  musterstadt: {
    id: "musterstadt",
    name: "Musterstadt",
    region: "Musterkreis, NRW",
    slogan: "Gemeinsam. Für unsere Stadt.",
    description: "Musterstadt zeigt, wie Gamification bürgerschaftliches Engagement stärkt.",
    population: "35.000",
    primaryColor: "#2563eb",
    accentColor: "#f97316",
    website: "https://www.musterstadt.de",
    districts: [
      "Zentrum", "Nordviertel", "Südpark", "Westend",
      "Ostheim", "Grünau", "Bergfeld",
    ],
    heroStats: {
      volunteers: 0,
      missions: 0,
      hoursVolunteered: 0,
      partners: 0,
    },
  },
};

export const defaultCity = cities.soest;
