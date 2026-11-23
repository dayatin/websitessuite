import type { FactRecord } from "../db/schema.ts";

export const CATEGORIES = [
  { slug: "science", label: "Science & Physics", icon: "🔬" },
  { slug: "space", label: "Space & Astronomy", icon: "🚀" },
  { slug: "nature", label: "Nature & Animals", icon: "🌿" },
  { slug: "history", label: "History & Civilizations", icon: "🏛️" },
  { slug: "human-body", label: "Human Biology", icon: "🧬" },
  { slug: "technology", label: "Technology & Computing", icon: "💻" },
] as const;

export const SEED_FACTS: FactRecord[] = [
  {
    id: 1,
    slug: "honey-never-spoils",
    fact_text:
      "Honey found in ancient Egyptian tombs over 3,000 years old is still perfectly edible.",
    category: "science",
    subtopic: "Chemistry & Food Preservation",
    explanation:
      "Honey has virtually zero moisture and a naturally acidic pH between 3 and 4.5. This osmotic pressure extracts water from bacteria and microorganisms, effectively dehydrating and preventing them from surviving or reproducing. Combined with bees producing hydrogen peroxide via glucose oxidase, honey remains an eternal preservative.",
    source_name: "Smithsonian Magazine",
    source_url:
      "https://www.smithsonianmag.com/science-nature/the-science-behind-honeys-eternal-shelf-life-1218690/",
    reading_time_seconds: 40,
    is_myth: false,
    day_of_year: 1,
  },
  {
    id: 2,
    slug: "great-wall-from-space-myth",
    fact_text:
      "The Great Wall of China is NOT visible from the Moon or low Earth orbit with the naked eye.",
    category: "space",
    subtopic: "Astronomy & Orbital Observation",
    explanation:
      "This widespread misconception originated in 1932 before human spaceflight. Astronauts from NASA and the International Space Station have confirmed that the Great Wall is virtually indistinguishable from orbit because it was constructed from natural stone and soil that blends directly into surrounding topography. Optical resolution from orbital distances cannot resolve structures only a few meters wide without telephoto magnification.",
    source_name: "NASA Earth Observatory",
    source_url: "https://earthobservatory.nasa.gov/images/3719/great-wall-of-china",
    reading_time_seconds: 45,
    is_myth: true,
    myth_misconception:
      "The Great Wall of China is the only human-made structure visible from the Moon with the naked eye.",
    day_of_year: 2,
  },
  {
    id: 3,
    slug: "cleopatra-closer-to-iphone-than-pyramids",
    fact_text:
      "Cleopatra lived closer in time to the release of the first iPhone than to the construction of the Great Pyramid of Giza.",
    category: "history",
    subtopic: "Chronology & Ancient Egypt",
    explanation:
      "The Great Pyramid of Giza was completed around 2560 BCE. Cleopatra VII ruled Egypt between 51 BCE and 30 BCE—approximately 2,500 years after the pyramid was erected. The launch of the original iPhone occurred in 2007 CE, approximately 2,037 years after Cleopatra's death, proving how immensely ancient dynastic Egyptian history truly was.",
    source_name: "Encyclopaedia Britannica",
    source_url: "https://www.britannica.com/biography/Cleopatra-queen-of-Egypt",
    reading_time_seconds: 35,
    is_myth: false,
    day_of_year: 3,
  },
  {
    id: 4,
    slug: "octopus-three-hearts-blue-blood",
    fact_text: "An octopus has three hearts and blue blood powered by copper rather than iron.",
    category: "nature",
    subtopic: "Marine Biology",
    explanation:
      "Two branchial hearts pump deoxygenated blood through the octopus's gills to gather oxygen, while a third systemic heart circulates oxygenated blood through the rest of the body. Furthermore, unlike human hemoglobin which is iron-based (producing red blood), octopus blood contains the copper-rich protein hemocyanin, which is far more efficient at binding oxygen in frigid, oxygen-deprived deep ocean waters.",
    source_name: "Natural History Museum (London)",
    source_url: "https://www.nhm.ac.uk/discover/octopuses-have-three-hearts.html",
    reading_time_seconds: 40,
    is_myth: false,
    day_of_year: 4,
  },
  {
    id: 5,
    slug: "brain-ten-percent-myth",
    fact_text: "Humans use virtually 100% of their brain, not just 10%.",
    category: "human-body",
    subtopic: "Neuroscience",
    explanation:
      "Modern neuroimaging technologies, including functional magnetic resonance imaging (fMRI) and positron emission tomography (PET), demonstrate that almost all areas of the brain show active neural activity throughout the day, even during sleep. While not every neuron fires simultaneously (which would cause a grand mal seizure), every neurological region serves specialized cognitive, sensory, or autonomic functions.",
    source_name: "Scientific American",
    source_url:
      "https://www.scientificamerican.com/article/do-people-only-use-10-percent-of-their-brains/",
    reading_time_seconds: 45,
    is_myth: true,
    myth_misconception: "Humans only use 10% of their brain capacity.",
    day_of_year: 5,
  },
  {
    id: 6,
    slug: "apollo-11-guidance-computer-memory",
    fact_text:
      "The Apollo 11 Guidance Computer that landed humans on the Moon had only 4 kilobytes of RAM.",
    category: "technology",
    subtopic: "Computer History",
    explanation:
      "Developed by the MIT Instrumentation Laboratory, the Apollo Guidance Computer (AGC) operated on approximately 4 kilobytes of magnetic core RAM and 72 kilobytes of Read-Only 'core rope' memory woven by hand. In contrast, modern entry-level smartphones possess over one million times more working memory and billions of times greater computational throughput.",
    source_name: "MIT Technology Review",
    source_url:
      "https://www.technologyreview.com/2019/07/19/134114/how-the-apollo-11-computers-worked/",
    reading_time_seconds: 40,
    is_myth: false,
    day_of_year: 6,
  },
  {
    id: 7,
    slug: "bananas-are-naturally-radioactive",
    fact_text: "Bananas are naturally radioactive due to high concentrations of Potassium-40.",
    category: "science",
    subtopic: "Nuclear Physics & Biology",
    explanation:
      "Bananas are exceptionally rich in potassium, a vital nutrient. Approximately 0.012% of all naturally occurring potassium is the radioactive isotope Potassium-40 (K-40). The average banana contains around 0.1 microsieverts of radiation, a dosage so minute that physicists humorously created the 'Banana Equivalent Dose' (BED) unit to explain radiation exposure to the public.",
    source_name: "UC Berkeley Department of Nuclear Engineering",
    source_url: "https://nuc.berkeley.edu/radiation-basics/banana-equivalent-dose/",
    reading_time_seconds: 35,
    is_myth: false,
    day_of_year: 7,
  },
  {
    id: 8,
    slug: "venus-day-longer-than-year",
    fact_text: "A single day on Venus lasts longer than an entire Venusian year.",
    category: "space",
    subtopic: "Planetary Science",
    explanation:
      "Venus rotates on its axis at an extraordinarily sluggish pace, taking 243 Earth days to complete one full rotation. Meanwhile, it orbits the Sun in just 224.7 Earth days. Consequently, a sidereal day on Venus is roughly 18 Earth days longer than its year. Furthermore, Venus rotates clockwise (retrograde), meaning the sun rises in the west and sets in the east.",
    source_name: "NASA Solar System Exploration",
    source_url: "https://solarsystem.nasa.gov/planets/venus/in-depth/",
    reading_time_seconds: 40,
    is_myth: false,
    day_of_year: 8,
  },
];
