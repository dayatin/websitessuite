import { TimeEngine } from "./time-engine.ts";
import { classifyHour, getStatusStyle } from "./timeline-math.ts";

export interface PairwiseRouteConfig {
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
  fromTz: string;
  toTz: string;
  description: string;
}

export interface PairwiseRow {
  hourIndex: number;
  fromTimeFormatted: string;
  toTimeFormatted: string;
  fromStatus: string;
  toStatus: string;
  dayShiftLabel: string;
}

export const PAIRWISE_ROUTES: PairwiseRouteConfig[] = [
  {
    fromSlug: "utc",
    toSlug: "est",
    fromName: "UTC (Coordinated Universal Time)",
    toName: "EST (Eastern Standard Time)",
    fromTz: "UTC",
    toTz: "America/New_York",
    description: "Convert Coordinated Universal Time (UTC) to Eastern Standard Time (EST/EDT).",
  },
  {
    fromSlug: "est",
    toSlug: "utc",
    fromName: "EST (Eastern Standard Time)",
    toName: "UTC (Coordinated Universal Time)",
    fromTz: "America/New_York",
    toTz: "UTC",
    description: "Convert Eastern Time to Coordinated Universal Time (UTC).",
  },
  {
    fromSlug: "gmt",
    toSlug: "ist",
    fromName: "GMT (Greenwich Mean Time)",
    toName: "IST (India Standard Time)",
    fromTz: "Europe/London",
    toTz: "Asia/Kolkata",
    description: "Convert Greenwich Mean Time (London) to India Standard Time (IST).",
  },
  {
    fromSlug: "ist",
    toSlug: "gmt",
    fromName: "IST (India Standard Time)",
    toName: "GMT (Greenwich Mean Time)",
    fromTz: "Asia/Kolkata",
    toTz: "Europe/London",
    description: "Convert India Standard Time (IST) to Greenwich Mean Time (London).",
  },
  {
    fromSlug: "pst",
    toSlug: "est",
    fromName: "PST (Pacific Standard Time)",
    toName: "EST (Eastern Standard Time)",
    fromTz: "America/Los_Angeles",
    toTz: "America/New_York",
    description: "Convert US Pacific Time (California) to US Eastern Time (New York).",
  },
  {
    fromSlug: "est",
    toSlug: "pst",
    fromName: "EST (Eastern Standard Time)",
    toName: "PST (Pacific Standard Time)",
    fromTz: "America/New_York",
    toTz: "America/Los_Angeles",
    description: "Convert US Eastern Time (New York) to US Pacific Time (California).",
  },
  {
    fromSlug: "pst",
    toSlug: "cet",
    fromName: "PST (Pacific Standard Time)",
    toName: "CET (Central European Time)",
    fromTz: "America/Los_Angeles",
    toTz: "Europe/Paris",
    description: "Convert Pacific Time (San Francisco) to Central European Time (Paris/Berlin).",
  },
  {
    fromSlug: "cet",
    toSlug: "pst",
    fromName: "CET (Central European Time)",
    toName: "PST (Pacific Standard Time)",
    fromTz: "Europe/Paris",
    toTz: "America/Los_Angeles",
    description: "Convert Central European Time (Paris/Berlin) to Pacific Time (San Francisco).",
  },
  {
    fromSlug: "london",
    toSlug: "new-york",
    fromName: "London (GMT/BST)",
    toName: "New York (EST/EDT)",
    fromTz: "Europe/London",
    toTz: "America/New_York",
    description: "Convert London local time to New York local time across 24 hours.",
  },
  {
    fromSlug: "new-york",
    toSlug: "london",
    fromName: "New York (EST/EDT)",
    toName: "London (GMT/BST)",
    fromTz: "America/New_York",
    toTz: "Europe/London",
    description: "Convert New York local time to London local time across 24 hours.",
  },
  {
    fromSlug: "tokyo",
    toSlug: "london",
    fromName: "Tokyo (JST)",
    toName: "London (GMT/BST)",
    fromTz: "Asia/Tokyo",
    toTz: "Europe/London",
    description: "Convert Tokyo time (Japan) to London time (United Kingdom).",
  },
  {
    fromSlug: "london",
    toSlug: "tokyo",
    fromName: "London (GMT/BST)",
    toName: "Tokyo (JST)",
    fromTz: "Europe/London",
    toTz: "Asia/Tokyo",
    description: "Convert London time (United Kingdom) to Tokyo time (Japan).",
  },
];

export function buildPairwiseTable(
  config: PairwiseRouteConfig,
  date: Date = new Date(),
): {
  rows: PairwiseRow[];
  hourOffsetMinutes: number;
  offsetSummary: string;
} {
  const engine = new TimeEngine();
  const fromInfo = engine.getTimeForZone(date, config.fromTz);
  const toInfo = engine.getTimeForZone(date, config.toTz);

  const hourOffsetMinutes = toInfo.utcOffsetMinutes - fromInfo.utcOffsetMinutes;
  const absMins = Math.abs(hourOffsetMinutes);
  const diffHours = Math.floor(absMins / 60);
  const diffMins = absMins % 60;

  const timeUnit = diffMins > 0 ? `${diffHours}h ${diffMins}m` : `${diffHours} hours`;
  const offsetSummary =
    hourOffsetMinutes > 0
      ? `${config.toName} is ${timeUnit} ahead of ${config.fromName}`
      : hourOffsetMinutes < 0
        ? `${config.toName} is ${timeUnit} behind ${config.fromName}`
        : `${config.toName} and ${config.fromName} are in the same time offset`;

  const rows: PairwiseRow[] = [];
  const baseYear = date.getUTCFullYear();
  const baseMonth = date.getUTCMonth();
  const baseDay = date.getUTCDate();

  for (let h = 0; h < 24; h++) {
    // Generate an absolute instant where fromTz local hour is h:00
    // Approximate UTC time:
    const fromUtcOffset = fromInfo.utcOffsetMinutes;
    const utcMs = Date.UTC(baseYear, baseMonth, baseDay, h, 0, 0) - fromUtcOffset * 60000;
    const instant = new Date(utcMs);

    const fInfo = engine.getTimeForZone(instant, config.fromTz);
    const tInfo = engine.getTimeForZone(instant, config.toTz);

    const fStatus = classifyHour(fInfo.hours);
    const tStatus = classifyHour(tInfo.hours);

    // Compute relative day shift between fInfo date and tInfo date
    let dayShiftLabel = "Same day";
    if (tInfo.day > fInfo.day || (fInfo.month !== tInfo.month && tInfo.day === 1)) {
      dayShiftLabel = "+1 Day (Tomorrow)";
    } else if (tInfo.day < fInfo.day) {
      dayShiftLabel = "-1 Day (Yesterday)";
    }

    rows.push({
      hourIndex: h,
      fromTimeFormatted: fInfo.formattedTime12,
      toTimeFormatted: tInfo.formattedTime12,
      fromStatus: fStatus,
      toStatus: tStatus,
      dayShiftLabel,
    });
  }

  return {
    rows,
    hourOffsetMinutes,
    offsetSummary,
  };
}

export function generatePairwiseFAQs(config: PairwiseRouteConfig, offsetSummary: string) {
  return [
    {
      question: `What is the time difference between ${config.fromName} and ${config.toName}?`,
      answer: `${offsetSummary}. When converting time between these zones, remember to take into account daylight saving shifts during transition periods.`,
    },
    {
      question: `What are the best working hours for meetings between ${config.fromName} and ${config.toName}?`,
      answer:
        "The optimal meeting window typically occurs when both zones overlap within 9:00 AM to 6:00 PM local time. You can use our 24-hour overlap scrubber to instantly pinpoint convenient sync hours.",
    },
    {
      question: `Do both ${config.fromName} and ${config.toName} observe Daylight Saving Time (DST)?`,
      answer:
        "Daylight saving rules depend on regional legislation. For instance, UTC, Arizona, and India (IST) do not observe DST, whereas the United Kingdom and US Eastern Time shift by one hour in spring and autumn.",
    },
  ];
}
