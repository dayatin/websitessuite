import { TimeEngine } from "./time-engine.ts";

export type HourStatus = "work" | "awake" | "sleep";

export interface TimelineSlot {
  utcHour: number;
  localHour: number;
  formatted12: string;
  formatted24: string;
  dayOffset: number; // -1 for yesterday, 0 for today, +1 for tomorrow
  status: HourStatus;
  statusLabel: string;
}

export interface MeetingFitness {
  score: number; // 0 - 100
  rating: "golden" | "good" | "fair" | "poor";
  label: string;
  cityBreakdown: {
    cityId?: string;
    timezone: string;
    localHour: number;
    formattedTime: string;
    status: HourStatus;
  }[];
}

export function classifyHour(hour: number): HourStatus {
  const h = (hour + 24) % 24;
  if (h >= 9 && h < 18) return "work";
  if ((h >= 8 && h < 9) || (h >= 18 && h < 22)) return "awake";
  return "sleep";
}

export function getStatusStyle(status: HourStatus): {
  bg: string;
  fg: string;
  border: string;
  label: string;
} {
  switch (status) {
    case "work":
      return {
        bg: "rgba(16, 185, 129, 0.22)",
        fg: "#10b981",
        border: "rgba(16, 185, 129, 0.4)",
        label: "Working Hours (9am-6pm)",
      };
    case "awake":
      return {
        bg: "rgba(245, 158, 11, 0.18)",
        fg: "#f59e0b",
        border: "rgba(245, 158, 11, 0.35)",
        label: "Awake / Extended (8-9am, 6-10pm)",
      };
    case "sleep":
      return {
        bg: "rgba(100, 116, 139, 0.12)",
        fg: "#94a3b8",
        border: "rgba(100, 116, 139, 0.2)",
        label: "Sleep / Outside Hours (10pm-8am)",
      };
  }
}

/**
 * Builds 24-slot timeline relative to UTC hours (0..23) for any timezone.
 */
export function build24HourTimeline(
  timezone: string,
  baseUtcDate: Date = new Date(),
): TimelineSlot[] {
  const engine = new TimeEngine();
  const slots: TimelineSlot[] = [];

  const baseYear = baseUtcDate.getUTCFullYear();
  const baseMonth = baseUtcDate.getUTCMonth();
  const baseDay = baseUtcDate.getUTCDate();

  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const slotUtc = new Date(Date.UTC(baseYear, baseMonth, baseDay, utcHour, 0, 0));
    const info = engine.getTimeForZone(slotUtc, timezone);

    // Compute relative day offset between UTC base day and local day
    const localMidnight = new Date(Date.UTC(info.year, info.month - 1, info.day));
    const utcMidnight = new Date(Date.UTC(baseYear, baseMonth, baseDay));
    const dayDiffMs = localMidnight.getTime() - utcMidnight.getTime();
    const dayOffset = Math.round(dayDiffMs / 86400000);

    const status = classifyHour(info.hours);
    const style = getStatusStyle(status);

    slots.push({
      utcHour,
      localHour: info.hours,
      formatted12: info.formattedTime12,
      formatted24: info.formattedTime24,
      dayOffset,
      status,
      statusLabel: style.label,
    });
  }

  return slots;
}

/**
 * Calculates meeting suitability across a set of timezones for a given UTC hour.
 */
export function evaluateMeetingHour(
  timezones: string[],
  utcHour: number,
  baseDate: Date = new Date(),
): MeetingFitness {
  const engine = new TimeEngine();
  const baseYear = baseDate.getUTCFullYear();
  const baseMonth = baseDate.getUTCMonth();
  const baseDay = baseDate.getUTCDate();
  const slotDate = new Date(Date.UTC(baseYear, baseMonth, baseDay, utcHour, 0, 0));

  const cityBreakdown = timezones.map((tz) => {
    const info = engine.getTimeForZone(slotDate, tz);
    const status = classifyHour(info.hours);
    return {
      timezone: tz,
      localHour: info.hours,
      formattedTime: info.formattedTime12,
      status,
    };
  });

  const workCount = cityBreakdown.filter((c) => c.status === "work").length;
  const awakeCount = cityBreakdown.filter((c) => c.status === "awake").length;
  const sleepCount = cityBreakdown.filter((c) => c.status === "sleep").length;
  const total = timezones.length;

  let score = 0;
  let rating: MeetingFitness["rating"] = "poor";
  let label = "Sub-optimal: Outside working hours for some participants";

  if (sleepCount === 0) {
    if (workCount === total) {
      score = 100;
      rating = "golden";
      label = "Golden Overlap: Standard working hours for all participants (9am-6pm)";
    } else {
      score = 80;
      rating = "good";
      label = "Acceptable: All participants are awake (8am-10pm)";
    }
  } else if (sleepCount === 1 && total > 2) {
    score = 45;
    rating = "fair";
    label = "Fair: 1 participant is in early morning or late evening";
  } else {
    score = Math.max(10, Math.round((workCount * 50 + awakeCount * 25) / total));
    rating = "poor";
    label = "Unfavorable: Multiple participants are asleep";
  }

  return {
    score,
    rating,
    label,
    cityBreakdown,
  };
}
