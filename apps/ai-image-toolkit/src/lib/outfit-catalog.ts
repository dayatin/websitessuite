/**
 * Formal Outfit & Corporate Attire Preset Catalog
 * Standard formal suits, blazers, and collared shirts for professional headshots and official passport photos.
 */

export interface FormalOutfitRecord {
  id: string;
  name: string;
  gender: "men" | "women" | "unisex";
  category: "suit" | "blazer" | "shirt";
  primaryColor: string;
  lapelStyle: "notch" | "peak" | "shawl" | "collar";
  tieColor?: string;
  collarWidthRatio: number; // Ratio of neck opening relative to standard head width (~0.60)
  shoulderSpanRatio: number; // Ratio of shoulder width relative to head width (~2.2)
  description: string;
  badge: string;
}

export const FORMAL_OUTFITS: FormalOutfitRecord[] = [
  // Men's Formal
  {
    id: "mens-charcoal-suit",
    name: "Men's Charcoal Suit & Burgundy Silk Tie",
    gender: "men",
    category: "suit",
    primaryColor: "#1e293b",
    lapelStyle: "notch",
    tieColor: "#881337",
    collarWidthRatio: 0.58,
    shoulderSpanRatio: 2.3,
    description:
      "Classic executive dark charcoal two-button suit with a crisp white shirt and dark red silk tie.",
    badge: "Executive Standard",
  },
  {
    id: "mens-navy-blazer",
    name: "Men's Classic Navy Blazer & Sky Blue Shirt",
    gender: "men",
    category: "blazer",
    primaryColor: "#1e3a8a",
    lapelStyle: "notch",
    tieColor: "#1e293b",
    collarWidthRatio: 0.6,
    shoulderSpanRatio: 2.25,
    description:
      "Professional navy blue tailored blazer over an oxford dress shirt with dark patterned tie.",
    badge: "Business Professional",
  },
  {
    id: "mens-white-shirt-tie",
    name: "Men's Crisp White Dress Shirt & Navy Tie",
    gender: "men",
    category: "shirt",
    primaryColor: "#ffffff",
    lapelStyle: "collar",
    tieColor: "#1e40af",
    collarWidthRatio: 0.55,
    shoulderSpanRatio: 2.1,
    description:
      "Modern semi-spread white dress shirt with neatly knotted navy tie, ideal for warm climate visas.",
    badge: "Visa Clean",
  },
  {
    id: "mens-black-tie-tuxedo",
    name: "Men's Formal Black-Tie Tuxedo & Bowtie",
    gender: "men",
    category: "suit",
    primaryColor: "#020617",
    lapelStyle: "peak",
    tieColor: "#020617",
    collarWidthRatio: 0.56,
    shoulderSpanRatio: 2.35,
    description:
      "Formal black tuxedo with satin peak lapels, wingtip collar, and black silk bowtie.",
    badge: "Gala & Formal",
  },

  // Women's Formal
  {
    id: "womens-black-blazer",
    name: "Women's Executive Black Tailored Blazer",
    gender: "women",
    category: "blazer",
    primaryColor: "#0f172a",
    lapelStyle: "notch",
    collarWidthRatio: 0.52,
    shoulderSpanRatio: 2.05,
    description: "Sleek, sharply tailored black blazer over a silk ivory scoop blouse.",
    badge: "Executive Standard",
  },
  {
    id: "womens-navy-suit",
    name: "Women's Navy Blue Business Suit",
    gender: "women",
    category: "suit",
    primaryColor: "#1e3a8a",
    lapelStyle: "peak",
    collarWidthRatio: 0.54,
    shoulderSpanRatio: 2.1,
    description:
      "Structured navy formal blazer with peak lapels over a white high-neck collared blouse.",
    badge: "Corporate Leader",
  },
  {
    id: "womens-white-collar-blouse",
    name: "Women's Classic White Point-Collar Blouse",
    gender: "women",
    category: "shirt",
    primaryColor: "#ffffff",
    lapelStyle: "collar",
    collarWidthRatio: 0.5,
    shoulderSpanRatio: 1.95,
    description:
      "Refined minimalist white button-down blouse with clean lines, ideal for official passports.",
    badge: "Passport Clean",
  },
  {
    id: "womens-emerald-blazer",
    name: "Women's Jewel-Tone Emerald Blazer",
    gender: "women",
    category: "blazer",
    primaryColor: "#064e3b",
    lapelStyle: "shawl",
    collarWidthRatio: 0.53,
    shoulderSpanRatio: 2.0,
    description:
      "Contemporary rich emerald green shawl-collar blazer for stand-out LinkedIn and speaker headshots.",
    badge: "Speaker / Media",
  },
];

export class OutfitCatalog {
  private outfits: FormalOutfitRecord[];

  constructor(customOutfits: FormalOutfitRecord[] = FORMAL_OUTFITS) {
    this.outfits = customOutfits;
  }

  getAllOutfits(): FormalOutfitRecord[] {
    return this.outfits;
  }

  getOutfitsByGender(gender: "men" | "women" | "all"): FormalOutfitRecord[] {
    if (gender === "all") return this.outfits;
    return this.outfits.filter((o) => o.gender === gender || o.gender === "unisex");
  }

  getOutfitById(id: string): FormalOutfitRecord | null {
    return this.outfits.find((o) => o.id === id.toLowerCase().trim()) || null;
  }
}
