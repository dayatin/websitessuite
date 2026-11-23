import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeMeetingFromQuery,
  encodeMeetingToQuery,
  formatToIcsDate,
  generateCalendarLinks,
  generateChatTimestampTags,
  generateICS,
} from "../src/lib/meeting-planner.ts";

test("formatToIcsDate formats timestamps to RFC 5545 UTC standard", () => {
  const d = new Date(Date.UTC(2026, 10, 25, 14, 30, 0));
  const icsDate = formatToIcsDate(d);
  assert.equal(icsDate, "20261125T143000Z");
});

test("generateICS creates RFC 5545 compliant VCALENDAR event", () => {
  const meeting = {
    title: "Quarterly Global Engineering Review",
    description: "Aligning roadmap across London, Tokyo, and San Francisco.",
    startTime: new Date(Date.UTC(2026, 10, 25, 14, 0, 0)),
    durationMinutes: 60,
    hostCityId: "london",
    participantCityIds: ["tokyo", "san-francisco"],
  };

  const ics = generateICS(meeting);

  assert.ok(ics.includes("BEGIN:VCALENDAR\r\n"));
  assert.ok(ics.includes("VERSION:2.0\r\n"));
  assert.ok(ics.includes("BEGIN:VEVENT\r\n"));
  assert.ok(ics.includes("SUMMARY:Quarterly Global Engineering Review\r\n"));
  assert.ok(ics.includes("DTSTART:20261125T140000Z\r\n"));
  assert.ok(ics.includes("DTEND:20261125T150000Z\r\n"));
  assert.ok(ics.includes("END:VEVENT\r\n"));
  assert.ok(ics.includes("END:VCALENDAR"));
});

test("generateCalendarLinks constructs valid Google & Outlook web URLs", () => {
  const meeting = {
    title: "Sprint Planning",
    startTime: new Date(Date.UTC(2026, 10, 25, 15, 0, 0)),
    durationMinutes: 45,
    hostCityId: "new-york",
    participantCityIds: ["london"],
  };

  const links = generateCalendarLinks(meeting);

  assert.ok(links.googleCalendarUrl.startsWith("https://calendar.google.com/calendar/render?"));
  assert.ok(links.googleCalendarUrl.includes("action=TEMPLATE"));
  assert.ok(links.googleCalendarUrl.includes("Sprint%20Planning"));
  assert.ok(links.googleCalendarUrl.includes("20261125T150000Z/20261125T154500Z"));

  assert.ok(links.outlookUrl.startsWith("https://outlook.live.com/calendar/0/deeplink/compose?"));
  assert.ok(
    links.office365Url.startsWith("https://outlook.office.com/calendar/0/deeplink/compose?"),
  );
  assert.ok(links.icsDownloadUrl.startsWith("data:text/calendar;charset=utf8,"));
});

test("generateChatTimestampTags constructs correct Discord and Slack syntax", () => {
  const startTime = new Date(Date.UTC(2026, 10, 25, 16, 0, 0));
  const unixSec = Math.floor(startTime.getTime() / 1000);

  const meeting = {
    title: "Townhall",
    startTime,
    durationMinutes: 30,
    hostCityId: "london",
    participantCityIds: [],
  };

  const tags = generateChatTimestampTags(meeting);

  assert.equal(tags.discordFull, `<t:${unixSec}:F>`);
  assert.equal(tags.discordRelative, `<t:${unixSec}:R>`);
  assert.ok(tags.slackDate.startsWith(`<!date^${unixSec}^`));
});

test("encodeMeetingToQuery and decodeMeetingFromQuery serialize losslessly", () => {
  const original = {
    title: "Cross-Border Architecture Sync",
    description: "Reviewing Cloudflare D1 disaster recovery replica latency.",
    startTime: new Date(Date.UTC(2026, 10, 25, 18, 0, 0)),
    durationMinutes: 45,
    hostCityId: "san-francisco",
    participantCityIds: ["london", "tokyo", "mumbai"],
  };

  const queryString = encodeMeetingToQuery(original);
  const searchParams = new URLSearchParams(queryString);
  const decoded = decodeMeetingFromQuery(searchParams);

  assert.equal(decoded.title, original.title);
  assert.equal(decoded.description, original.description);
  assert.equal(decoded.startTime.toISOString(), original.startTime.toISOString());
  assert.equal(decoded.durationMinutes, 45);
  assert.equal(decoded.hostCityId, "san-francisco");
  assert.deepEqual(decoded.participantCityIds, ["london", "tokyo", "mumbai"]);
});
