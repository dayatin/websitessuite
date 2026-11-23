/**
 * Meeting Planner, RFC 5545 .ics Exporter, Calendar Deep-Links & Chat Timestamp Tags
 */

export interface MeetingDetails {
  title: string;
  description?: string;
  startTime: Date;
  durationMinutes: number;
  hostCityId: string;
  participantCityIds: string[];
}

export interface CalendarLinks {
  googleCalendarUrl: string;
  outlookUrl: string;
  office365Url: string;
  icsDownloadUrl: string;
}

export interface ChatTimestampTags {
  discordFull: string;
  discordRelative: string;
  discordShortTime: string;
  slackDate: string;
  markdownMeetingSummary: string;
}

/**
 * Formats a Date object into UTC iCalendar format: YYYYMMDDTHHMMSSZ
 */
export function formatToIcsDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

/**
 * Generates an RFC 5545 compliant .ics iCalendar file string.
 */
export function generateICS(meeting: MeetingDetails): string {
  const dtStart = formatToIcsDate(meeting.startTime);
  const endTime = new Date(meeting.startTime.getTime() + meeting.durationMinutes * 60000);
  const dtEnd = formatToIcsDate(endTime);
  const dtStamp = formatToIcsDate(new Date());
  const uid = `chronospatial-${meeting.startTime.getTime()}-${Math.random().toString(36).substring(2, 9)}@suite.local`;

  const safeTitle = (meeting.title || "Global Team Meeting").replace(/[\r\n]/g, " ");
  const safeDesc = (
    meeting.description ||
    `Cross-timezone meeting scheduled via ChronoSpatial.\nCities: ${[meeting.hostCityId, ...meeting.participantCityIds].join(", ")}`
  )
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ChronoSpatial//Global Meeting Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${safeTitle}`,
    `DESCRIPTION:${safeDesc}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Builds 1-Click calendar invitation deep-links for Google Calendar and Outlook.
 */
export function generateCalendarLinks(meeting: MeetingDetails): CalendarLinks {
  const startIso = formatToIcsDate(meeting.startTime);
  const endTime = new Date(meeting.startTime.getTime() + meeting.durationMinutes * 60000);
  const endIso = formatToIcsDate(endTime);

  const title = encodeURIComponent(meeting.title || "Global Team Meeting");
  const description = encodeURIComponent(
    meeting.description ||
      `Meeting coordinated across timezones via ChronoSpatial.\nLocations: ${[meeting.hostCityId, ...meeting.participantCityIds].join(", ")}`,
  );

  // Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${description}`;

  // Outlook Live URL
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startIso}&enddt=${endIso}&body=${description}`;

  // Office 365 URL
  const office365Url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startIso}&enddt=${endIso}&body=${description}`;

  // Data URI for instant browser download of .ics
  const icsContent = generateICS(meeting);
  const icsDownloadUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  return {
    googleCalendarUrl,
    outlookUrl,
    office365Url,
    icsDownloadUrl,
  };
}

/**
 * Generates dynamic time tags for developer communities (Discord, Slack, Markdown).
 */
export function generateChatTimestampTags(meeting: MeetingDetails): ChatTimestampTags {
  const unixSeconds = Math.floor(meeting.startTime.getTime() / 1000);
  const fallbackStr = meeting.startTime.toUTCString();

  return {
    // Discord dynamic timestamp: expands to viewer's local timezone automatically
    discordFull: `<t:${unixSeconds}:F>`, // e.g. "Wednesday, November 25, 2026 2:00 PM"
    discordRelative: `<t:${unixSeconds}:R>`, // e.g. "in 2 days"
    discordShortTime: `<t:${unixSeconds}:t>`, // e.g. "2:00 PM"
    // Slack dynamic date token
    slackDate: `<!date^${unixSeconds}^{date_num} at {time}|${fallbackStr}>`,
    // Markdown
    markdownMeetingSummary: `📅 **${meeting.title}**\n🕒 <t:${unixSeconds}:F> (<t:${unixSeconds}:R>)`,
  };
}

/**
 * Encodes meeting parameters into a shareable query string.
 */
export function encodeMeetingToQuery(meeting: MeetingDetails): string {
  const params = new URLSearchParams();
  params.set("title", meeting.title);
  params.set("start", meeting.startTime.toISOString());
  params.set("dur", meeting.durationMinutes.toString());
  params.set("host", meeting.hostCityId);
  if (meeting.participantCityIds.length > 0) {
    params.set("cities", meeting.participantCityIds.join(","));
  }
  if (meeting.description) {
    params.set("desc", meeting.description);
  }
  return params.toString();
}

/**
 * Decodes meeting parameters from URLSearchParams with safe fallbacks.
 */
export function decodeMeetingFromQuery(params: URLSearchParams): MeetingDetails {
  const title = params.get("title") || "Global Team Sync";
  const desc = params.get("desc") || undefined;
  const startParam = params.get("start");

  let startTime = new Date();
  if (startParam) {
    const parsed = new Date(startParam);
    if (!Number.isNaN(parsed.getTime())) {
      startTime = parsed;
    }
  }

  const durParam = Number.parseInt(params.get("dur") || "45", 10);
  const durationMinutes = Number.isFinite(durParam) && durParam > 0 ? durParam : 45;

  const hostCityId = params.get("host") || "london";
  const citiesParam = params.get("cities");
  const participantCityIds = citiesParam
    ? citiesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : ["new-york", "tokyo", "mumbai"];

  return {
    title,
    description: desc,
    startTime,
    durationMinutes,
    hostCityId,
    participantCityIds,
  };
}
