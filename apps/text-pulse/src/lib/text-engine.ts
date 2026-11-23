/**
 * TextPulse AI Text Analytics & Token Estimation Engine
 * Multi-LLM Token counting, Readability scoring (Flesch), and linguistic analytics.
 */

export interface TextToolMeta {
  slug: string;
  title: string;
  category: "ai" | "metrics" | "linguistics" | "transform";
  icon: string;
  badge: string;
  description: string;
  features: string[];
}

export const TEXT_TOOLS: TextToolMeta[] = [
  {
    slug: "ai-token-counter",
    title: "AI Token Counter & Price Estimator",
    category: "ai",
    icon: "🤖",
    badge: "LLM Standard",
    description:
      "Estimate token consumption and API pricing across GPT-4o, Claude 3.5 Sonnet, Gemini 2.0, and Llama 3.",
    features: [
      "Hardware-accelerated client-side BPE heuristic token estimator",
      "Estimates input and output inference API costs in real-time",
      "Calculates context window saturation against 128k, 200k, and 1M limits",
    ],
  },
  {
    slug: "word-counter",
    title: "Word & Character Counter",
    category: "metrics",
    icon: "📝",
    badge: "Writing Suite",
    description:
      "Instant character, word, sentence, paragraph, and page counts with real-time keystroke tracking.",
    features: [
      "Character count with and without whitespace characters",
      "Standard academic and publishing page count estimation (250 words/page)",
      "Instant copy and clear controls with zero cloud telemetry",
    ],
  },
  {
    slug: "readability-analyzer",
    title: "Flesch Readability & Grade Level",
    category: "linguistics",
    icon: "📊",
    badge: "SEO & Clarity",
    description:
      "Compute Flesch Reading Ease and Flesch-Kincaid Grade Level scores to evaluate content accessibility.",
    features: [
      "Accurate syllable counting algorithm with English phonetic heuristics",
      "Flesch Reading Ease score (0-100) with audience accessibility classification",
      "Flesch-Kincaid US educational school grade level equivalence",
    ],
  },
  {
    slug: "reading-time-calculator",
    title: "Reading & Speaking Time Calculator",
    category: "metrics",
    icon: "⏱️",
    badge: "Speech & Blog",
    description:
      "Estimate silent reading time and spoken speech duration for blog posts, keynotes, and video scripts.",
    features: [
      "Calculates silent reading time based on standard 225 WPM benchmark",
      "Calculates presentation speech duration at natural 140 WPM pace",
      "Minutes and seconds breakdown for podcast and video rehearsal",
    ],
  },
  {
    slug: "keyword-density-analyzer",
    title: "SEO Keyword Density Analyzer",
    category: "linguistics",
    icon: "🔍",
    badge: "SEO Strategy",
    description:
      "Extract high-frequency search keywords, compute percentage density, and filter out grammatical stop words.",
    features: [
      "Filters out 100+ standard English grammatical stop words",
      "Calculates exact occurrence count and proportional percentage density",
      "Highlights potential keyword stuffing risks above 3.5% density",
    ],
  },
  {
    slug: "case-converter",
    title: "Multi-Format Text Case Converter",
    category: "transform",
    icon: "🔤",
    badge: "Formatting",
    description:
      "Convert string casing between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.",
    features: [
      "Supports 7 standard casing conventions for developers and editors",
      "Handles hyphenated, underscored, and mixed-case source strings",
      "1-click formatted clipboard export",
    ],
  },
];

// --- 1. Core Text Metrics ---

export interface TextMetrics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  pages: number;
  readingTimeSeconds: number;
  speakingTimeSeconds: number;
  formattedReadingTime: string;
  formattedSpeakingTime: string;
}

export function analyzeTextStats(rawText: string): TextMetrics {
  const text = rawText || "";
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  const wordsArray = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const words = wordsArray.length;

  const sentencesArray = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentences = Math.max(words > 0 ? 1 : 0, sentencesArray.length);

  const paragraphsArray = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphs = Math.max(words > 0 ? 1 : 0, paragraphsArray.length);

  const pages = Math.round((words / 250) * 10) / 10;

  const readingTimeSeconds = Math.round((words / 225) * 60);
  const speakingTimeSeconds = Math.round((words / 140) * 60);

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs} sec`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return rem > 0 ? `${mins} min ${rem} sec` : `${mins} min`;
  };

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    pages,
    readingTimeSeconds,
    speakingTimeSeconds,
    formattedReadingTime: formatTime(readingTimeSeconds),
    formattedSpeakingTime: formatTime(speakingTimeSeconds),
  };
}

// --- 2. Syllable Counter & Readability Scores ---

export function countSyllablesInWord(rawWord: string): number {
  const word = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 2) return 1;

  // Count vowel sequences
  const vowels = word.match(/[aeiouy]{1,2}/g);
  let count = vowels ? vowels.length : 1;

  // Subtract silent 'e' at end, UNLESS preceded by 'l' preceded by a consonant (like 'apple', 'table')
  if (word.endsWith("e") && !/[^aeiouy]le$/.test(word)) {
    count--;
  }

  // Handle -ed and -es at end if not pronounced
  if (/(?:ed|es)$/.test(word) && !/(?:ted|ded)$/.test(word)) {
    count--;
  }

  return Math.max(1, count);
}

export interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  readingEaseRating: string;
  schoolGradeLevel: string;
}

export function calculateReadability(rawText: string): ReadabilityMetrics {
  const stats = analyzeTextStats(rawText);
  if (stats.words === 0) {
    return {
      fleschReadingEase: 100,
      fleschKincaidGrade: 0,
      readingEaseRating: "N/A",
      schoolGradeLevel: "N/A",
    };
  }

  const words = rawText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllablesInWord(w);
  }

  const wordsPerSentence = stats.words / Math.max(1, stats.sentences);
  const syllablesPerWord = totalSyllables / stats.words;

  // Flesch Reading Ease: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  const freRaw = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const fleschReadingEase = Math.round(Math.max(0, Math.min(100, freRaw)) * 10) / 10;

  // Flesch-Kincaid Grade Level: 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
  const fkgRaw = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const fleschKincaidGrade = Math.round(Math.max(0, fkgRaw) * 10) / 10;

  let readingEaseRating = "Standard";
  if (fleschReadingEase >= 90) readingEaseRating = "Very Easy (5th Grade)";
  else if (fleschReadingEase >= 80) readingEaseRating = "Easy (6th Grade)";
  else if (fleschReadingEase >= 70) readingEaseRating = "Fairly Easy (7th Grade)";
  else if (fleschReadingEase >= 60) readingEaseRating = "Standard (8th - 9th Grade)";
  else if (fleschReadingEase >= 50) readingEaseRating = "Fairly Difficult (High School)";
  else if (fleschReadingEase >= 30) readingEaseRating = "Difficult (College Level)";
  else readingEaseRating = "Very Difficult (Academic / Graduate)";

  const schoolGradeLevel =
    fleschKincaidGrade <= 1
      ? "Kindergarten / 1st Grade"
      : fleschKincaidGrade <= 5
        ? "Elementary School"
        : fleschKincaidGrade <= 8
          ? "Middle School"
          : fleschKincaidGrade <= 12
            ? "High School"
            : "College / University";

  return {
    fleschReadingEase,
    fleschKincaidGrade,
    readingEaseRating,
    schoolGradeLevel,
  };
}

// --- 3. Multi-LLM Token Estimation ---

export interface TokenEstimationResult {
  estimatedTokens: number;
  models: {
    model: string;
    tokenCount: number;
    estimatedCostInputUSD: number;
    estimatedCostOutputUSD: number;
    contextUsagePercent: number;
  }[];
}

export function estimateLLMTokens(rawText: string): TokenEstimationResult {
  if (!rawText || rawText.trim().length === 0) {
    return {
      estimatedTokens: 0,
      models: [],
    };
  }

  // BPE heuristics:
  // English letters: ~4.0 chars/token
  // Numbers/symbols: ~2.8 chars/token
  // CJK/multi-byte: ~1.5 chars/token
  let tokenEstimate = 0;
  for (let i = 0; i < rawText.length; i++) {
    const code = rawText.charCodeAt(i);
    if (code > 0x4e00) {
      tokenEstimate += 0.7; // Asian/CJK characters
    } else if (code >= 33 && code <= 47) {
      tokenEstimate += 0.45; // Punctuation / symbols
    } else {
      tokenEstimate += 0.25; // Standard ASCII latin letters
    }
  }

  const baseTokens = Math.max(1, Math.round(tokenEstimate));

  const modelSpecs = [
    {
      name: "GPT-4o (OpenAI)",
      multiplier: 1.0,
      inputPerMillion: 2.5,
      outputPerMillion: 10.0,
      contextLimit: 128000,
    },
    {
      name: "Claude 3.5 Sonnet (Anthropic)",
      multiplier: 1.05,
      inputPerMillion: 3.0,
      outputPerMillion: 15.0,
      contextLimit: 200000,
    },
    {
      name: "Gemini 2.0 Flash (Google)",
      multiplier: 0.95,
      inputPerMillion: 0.1,
      outputPerMillion: 0.4,
      contextLimit: 1000000,
    },
    {
      name: "Llama 3 70B (Meta)",
      multiplier: 1.02,
      inputPerMillion: 0.8,
      outputPerMillion: 0.8,
      contextLimit: 128000,
    },
  ];

  const models = modelSpecs.map((spec) => {
    const count = Math.round(baseTokens * spec.multiplier);
    const inputCost = Math.round((count / 1_000_000) * spec.inputPerMillion * 100000) / 100000;
    const outputCost = Math.round((count / 1_000_000) * spec.outputPerMillion * 100000) / 100000;
    const usagePercent = Math.round((count / spec.contextLimit) * 10000) / 100;

    return {
      model: spec.name,
      tokenCount: count,
      estimatedCostInputUSD: inputCost,
      estimatedCostOutputUSD: outputCost,
      contextUsagePercent: usagePercent,
    };
  });

  return {
    estimatedTokens: baseTokens,
    models,
  };
}

// --- 4. Keyword Density ---

export interface KeywordDensityItem {
  word: string;
  count: number;
  densityPercent: number;
}

const STOP_WORDS = new Set([
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
]);

export function calculateKeywordDensity(rawText: string, topLimit = 10): KeywordDensityItem[] {
  const words = rawText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const w of words) {
    counts[w] = (counts[w] || 0) + 1;
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topLimit);

  return sorted.map(([word, count]) => ({
    word,
    count,
    densityPercent: Math.round((count / words.length) * 1000) / 10,
  }));
}

// --- 5. Case Converter ---

export function convertCase(
  text: string,
  targetCase: "lower" | "upper" | "title" | "camel" | "snake" | "kebab" | "pascal",
): string {
  if (!text) return "";

  if (targetCase === "lower") return text.toLowerCase();
  if (targetCase === "upper") return text.toUpperCase();

  const words = text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (targetCase === "title") {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  if (targetCase === "camel") {
    return words
      .map((w, idx) =>
        idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
      )
      .join("");
  }

  if (targetCase === "pascal") {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  }

  if (targetCase === "snake") {
    return words.map((w) => w.toLowerCase()).join("_");
  }

  if (targetCase === "kebab") {
    return words.map((w) => w.toLowerCase()).join("-");
  }

  return text;
}
