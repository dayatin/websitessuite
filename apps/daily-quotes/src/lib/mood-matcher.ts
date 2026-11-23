import { QuoteCorpusLoader } from "./corpus/loader.ts";
import type { QuoteRecord } from "./db/schema.ts";

export interface UserEmotion {
  id: string;
  label: string;
  icon: string;
  mappedMood: string;
  mappedOccasion?: string;
  prescription: string;
}

export const EMOTION_MAP: UserEmotion[] = [
  {
    id: "overwhelmed",
    label: "Overwhelmed & Anxious",
    icon: "🌪️",
    mappedMood: "calm",
    mappedOccasion: "solitude",
    prescription:
      "Ground yourself in Stoic wisdom. Focus only on what is within your direct control.",
  },
  {
    id: "unmotivated",
    label: "Unmotivated & Sluggish",
    icon: "🔋",
    mappedMood: "resilience",
    mappedOccasion: "monday-motivation",
    prescription: "Ignite discipline over fleeting motivation. Action creates momentum.",
  },
  {
    id: "fearful",
    label: "Fearful of Failure",
    icon: "⚡",
    mappedMood: "courage",
    mappedOccasion: "adversity",
    prescription: "Turn obstacles into fuel. Defeat is merely education in disguise.",
  },
  {
    id: "distracted",
    label: "Scattered & Distracted",
    icon: "🎯",
    mappedMood: "focus",
    mappedOccasion: "leadership",
    prescription: "Eliminate the trivial. Guard your attention as your most finite currency.",
  },
  {
    id: "seeking_purpose",
    label: "Contemplative & Seeking Purpose",
    icon: "🌌",
    mappedMood: "wisdom",
    mappedOccasion: "graduation",
    prescription: "Look inward. The unexamined life lacks direction; virtue is its own reward.",
  },
];

/**
 * Recommends curated quotes matching the user's emotional state.
 */
export function matchQuotesToEmotion(
  emotionId: string,
  count = 3,
): {
  emotion: UserEmotion;
  quotes: QuoteRecord[];
} {
  const emotion = EMOTION_MAP.find((e) => e.id === emotionId) || EMOTION_MAP[0];
  const loader = new QuoteCorpusLoader();

  let matched = loader.getQuotesByMood(emotion.mappedMood);
  if (matched.length < count && emotion.mappedOccasion) {
    const byOccasion = loader.getQuotesByOccasion(emotion.mappedOccasion);
    matched = [...new Set([...matched, ...byOccasion])];
  }

  return {
    emotion,
    quotes: matched.slice(0, count),
  };
}
