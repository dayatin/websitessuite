/**
 * FocusFlow & BrainArcade Engine
 * Procedural ambient sound synthesis, binaural brainwave frequencies, pomodoro cycles, and cognitive focus mini-games.
 */

export interface FocusModeMeta {
  slug: string;
  title: string;
  category: "audio" | "productivity" | "cognitive";
  icon: string;
  badge: string;
  description: string;
  features: string[];
}

export const FOCUS_MODES: FocusModeMeta[] = [
  {
    slug: "deep-focus",
    title: "Deep Work Ambient Soundscapes",
    category: "audio",
    icon: "🎧",
    badge: "Acoustic Shield",
    description:
      "Procedurally generated Brown, Pink, and White noise soundscapes designed to mask distracting background office chatter.",
    features: [
      "Zero looped MP3 audio artifacts: 100% mathematically synthesized in Web Audio",
      "Brown Noise: Warm, deep low-frequency rumble ideal for ADHD focus and study",
      "Pink Noise: Balanced 1/f spectral density for reading comprehension and coding flow",
    ],
  },
  {
    slug: "pomodoro-timer",
    title: "Interval Focus & Rest Cycle Timer",
    category: "productivity",
    icon: "⏱️",
    badge: "Productivity",
    description:
      "Configurable interval timer utilizing evidence-backed ultradian rhythm cycles (25/5, 50/10, and 90/20 sprint protocols).",
    features: [
      "Custom work, short break, and long break intervals with audio bell chimes",
      "Keeps track of completed work intervals and cumulative flow hours",
      "Zero battery drain with lightweight requestAnimationFrame timing",
    ],
  },
  {
    slug: "binaural-beats",
    title: "Alpha & Theta Wave Binaural Synthesizer",
    category: "audio",
    icon: "🧠",
    badge: "Neuromodulation",
    description:
      "Generate stereo acoustic binaural beat frequencies targeting 10Hz Alpha (relaxed alertness) and 6Hz Theta (deep creative synthesis).",
    features: [
      "Dual stereo oscillator routing (Left/Right independent carrier separation)",
      "Alpha Waves (8-12 Hz) for sustained concentration and calm cognition",
      "Theta Waves (4-8 Hz) for problem-solving, insight meditation, and ideation",
    ],
  },
  {
    slug: "math-sprint",
    title: "Mental Arithmetic Cognitive Sprint",
    category: "cognitive",
    icon: "⚡",
    badge: "Mental Warmup",
    description:
      "60-second rapid-fire mental arithmetic challenges to stimulate prefrontal cortex working memory before deep work.",
    features: [
      "Dynamic difficulty scaling across addition, multiplication, and algebraic balance",
      "Tracks accuracy rate, reaction speed (ms), and streak multipliers",
      "Non-punitive game design optimized for focus activation",
    ],
  },
  {
    slug: "stroop-challenge",
    title: "Stroop Color-Word Attention Matrix",
    category: "cognitive",
    icon: "🎯",
    badge: "Executive Function",
    description:
      "Measure cognitive flexibility and selective attention inhibition using the gold-standard neuropsychological Stroop effect.",
    features: [
      "Presents color words rendered in conflicting font colors to challenge attention",
      "Quantifies Stroop interference delay and executive cognitive control",
      "Scientifically validated micro-break mental reset exercise",
    ],
  },
  {
    slug: "memory-matrix",
    title: "Spatial Working Memory Matrix",
    category: "cognitive",
    icon: "🧩",
    badge: "Spatial Memory",
    description:
      "Memorize and recall flashing spatial tile patterns on expanding grid dimensions to boost visual working memory capacity.",
    features: [
      "Progressively expanding 3x3 to 5x5 spatial grid matrices",
      "Strengthens parietal-frontal working memory pathways",
      "Instant visual feedback with zero tracking analytics",
    ],
  },
];

// --- 1. Procedural Noise Audio Synthesis ---

export function generateWhiteNoise(samplesCount: number): Float32Array {
  const samples = new Float32Array(samplesCount);
  for (let i = 0; i < samplesCount; i++) {
    samples[i] = Math.random() * 2 - 1;
  }
  return samples;
}

/**
 * Paul Kellet's filter algorithm for 1/f Pink Noise.
 */
export function generatePinkNoise(samplesCount: number): Float32Array {
  const samples = new Float32Array(samplesCount);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let i = 0; i < samplesCount; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    samples[i] = pink * 0.11; // Normalize peak to ~[-1, 1]
  }
  return samples;
}

/**
 * Integrated random walk for Brown/Red Noise (1/f^2).
 */
export function generateBrownNoise(samplesCount: number): Float32Array {
  const samples = new Float32Array(samplesCount);
  let lastOutput = 0.0;

  for (let i = 0; i < samplesCount; i++) {
    const white = Math.random() * 2 - 1;
    lastOutput = (lastOutput + 0.02 * white) / 1.02;
    samples[i] = lastOutput * 3.5; // Gain compensation
  }
  return samples;
}

export function calculateBinauralFrequencies(
  brainwave: "alpha" | "theta" | "beta" | "delta",
  carrierHz = 200,
): {
  leftFreqHz: number;
  rightFreqHz: number;
  beatDifferenceHz: number;
  waveType: string;
  cognitiveEffect: string;
} {
  const beatDiffs: Record<typeof brainwave, { diff: number; desc: string }> = {
    delta: { diff: 2.5, desc: "Deep sleep, restorative physical recovery and pain relief" },
    theta: {
      diff: 6.0,
      desc: "Deep relaxation, creative ideation, and subconscious memory access",
    },
    alpha: { diff: 10.0, desc: "Relaxed focus, reduced anxiety, and calm analytical flow" },
    beta: { diff: 18.0, desc: "Active problem solving, high alertness, and analytical processing" },
  };

  const selected = beatDiffs[brainwave] || beatDiffs.alpha;
  const leftFreqHz = carrierHz;
  const rightFreqHz = carrierHz + selected.diff;

  return {
    leftFreqHz,
    rightFreqHz,
    beatDifferenceHz: selected.diff,
    waveType: brainwave.toUpperCase(),
    cognitiveEffect: selected.desc,
  };
}

// --- 2. Pomodoro Focus Engine ---

export interface PomodoroCycleSchedule {
  totalMinutes: number;
  workMinutesTotal: number;
  breakMinutesTotal: number;
  intervals: {
    round: number;
    type: "work" | "shortBreak" | "longBreak";
    durationMinutes: number;
  }[];
}

export function calculatePomodoroCycles(
  workMinutes = 25,
  shortBreakMinutes = 5,
  longBreakMinutes = 15,
  totalRounds = 4,
): PomodoroCycleSchedule {
  const intervals: PomodoroCycleSchedule["intervals"] = [];
  let workMinutesTotal = 0;
  let breakMinutesTotal = 0;

  for (let r = 1; r <= totalRounds; r++) {
    // Work block
    intervals.push({ round: r, type: "work", durationMinutes: workMinutes });
    workMinutesTotal += workMinutes;

    // Break block
    if (r === totalRounds) {
      intervals.push({ round: r, type: "longBreak", durationMinutes: longBreakMinutes });
      breakMinutesTotal += longBreakMinutes;
    } else {
      intervals.push({ round: r, type: "shortBreak", durationMinutes: shortBreakMinutes });
      breakMinutesTotal += shortBreakMinutes;
    }
  }

  return {
    totalMinutes: workMinutesTotal + breakMinutesTotal,
    workMinutesTotal,
    breakMinutesTotal,
    intervals,
  };
}

// --- 3. Cognitive Micro-Break Puzzles ---

export interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

export function generateMathProblem(
  difficulty: "easy" | "medium" | "hard" = "medium",
): MathProblem {
  let a = 0;
  let b = 0;
  let op = "+";
  let answer = 0;

  if (difficulty === "easy") {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    op = Math.random() > 0.5 ? "+" : "-";
    answer = op === "+" ? a + b : a - b;
  } else if (difficulty === "medium") {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 12) + 2;
    op = "*";
    answer = a * b;
  } else {
    // Hard: e.g. (a * b) + c
    a = Math.floor(Math.random() * 15) + 3;
    b = Math.floor(Math.random() * 10) + 2;
    const c = Math.floor(Math.random() * 50) + 10;
    answer = a * b + c;
    return {
      question: `(${a} × ${b}) + ${c} = ?`,
      answer,
      options: [answer, answer + 5, Math.max(1, answer - 5), answer + 10].sort(
        () => Math.random() - 0.5,
      ),
    };
  }

  const symbol = op === "*" ? "×" : op;
  const options = [
    answer,
    answer + (Math.floor(Math.random() * 5) + 1),
    answer - (Math.floor(Math.random() * 5) + 1),
    answer + 10,
  ].sort(() => Math.random() - 0.5);

  return {
    question: `${a} ${symbol} ${b} = ?`,
    answer,
    options,
  };
}

export interface StroopItem {
  word: string;
  inkColor: string;
  isCongruent: boolean;
}

export function generateStroopItems(count = 10): StroopItem[] {
  const colors = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"];
  const colorMap: Record<string, string> = {
    RED: "#ef4444",
    BLUE: "#3b82f6",
    GREEN: "#10b981",
    YELLOW: "#eab308",
    PURPLE: "#a855f7",
    ORANGE: "#f97316",
  };

  const results: StroopItem[] = [];

  for (let i = 0; i < count; i++) {
    const word = colors[Math.floor(Math.random() * colors.length)];
    const isCongruent = Math.random() > 0.6; // 40% congruent, 60% incongruent
    let inkWord = word;

    if (!isCongruent) {
      const otherColors = colors.filter((c) => c !== word);
      inkWord = otherColors[Math.floor(Math.random() * otherColors.length)];
    }

    results.push({
      word,
      inkColor: colorMap[inkWord],
      isCongruent,
    });
  }

  return results;
}

export function generateMemoryMatrix(
  gridSize = 4,
  targetCount = 5,
): { row: number; col: number }[] {
  const targets: { row: number; col: number }[] = [];
  const selectedKeys = new Set<string>();

  while (targets.length < targetCount && targets.length < gridSize * gridSize) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    const key = `${row},${col}`;
    if (!selectedKeys.has(key)) {
      selectedKeys.add(key);
      targets.push({ row, col });
    }
  }

  return targets;
}
