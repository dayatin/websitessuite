import assert from "node:assert/strict";
import test from "node:test";
import {
  build24HourTimeline,
  classifyHour,
  evaluateMeetingHour,
  getStatusStyle,
} from "../src/lib/timeline-math.ts";

test("Hour classification adheres to global workplace standards", () => {
  // Working hours: 9am - 6pm (17:59)
  assert.equal(classifyHour(9), "work");
  assert.equal(classifyHour(12), "work");
  assert.equal(classifyHour(17), "work");

  // Extended / awake hours: 8am - 9am, 6pm - 10pm (21:59)
  assert.equal(classifyHour(8), "awake");
  assert.equal(classifyHour(18), "awake");
  assert.equal(classifyHour(21), "awake");

  // Sleeping / off-hours: 10pm - 8am
  assert.equal(classifyHour(22), "sleep");
  assert.equal(classifyHour(0), "sleep");
  assert.equal(classifyHour(4), "sleep");
  assert.equal(classifyHour(7), "sleep");
});

test("Status styling provides high-contrast WCAG-compliant colors", () => {
  const workStyle = getStatusStyle("work");
  assert.ok(workStyle.fg.includes("#10b981"));
  assert.ok(workStyle.label.includes("Working Hours"));

  const awakeStyle = getStatusStyle("awake");
  assert.ok(awakeStyle.fg.includes("#f59e0b"));

  const sleepStyle = getStatusStyle("sleep");
  assert.ok(sleepStyle.fg.includes("#94a3b8"));
});

test("build24HourTimeline generates exactly 24 slots across UTC range", () => {
  const fixedUtc = new Date(Date.UTC(2026, 0, 15));
  const nyTimeline = build24HourTimeline("America/New_York", fixedUtc);

  assert.equal(nyTimeline.length, 24);

  // UTC 14:00 corresponds to 09:00 EST (work)
  const slot14 = nyTimeline.find((s) => s.utcHour === 14);
  assert.ok(slot14);
  assert.equal(slot14.localHour, 9);
  assert.equal(slot14.status, "work");

  // UTC 05:00 corresponds to 00:00 EST (sleep)
  const slot05 = nyTimeline.find((s) => s.utcHour === 5);
  assert.ok(slot05);
  assert.equal(slot05.localHour, 0);
  assert.equal(slot05.status, "sleep");
});

test("evaluateMeetingHour detects golden overlap vs sub-optimal hours", () => {
  const fixedUtc = new Date(Date.UTC(2026, 0, 15));
  const timezones = ["Europe/London", "America/New_York"];

  // At UTC 14:00 -> London is 14:00 (work), NY is 09:00 (work) => Golden
  const goldenEval = evaluateMeetingHour(timezones, 14, fixedUtc);
  assert.equal(goldenEval.rating, "golden");
  assert.equal(goldenEval.score, 100);
  assert.ok(goldenEval.label.includes("Golden Overlap"));

  // At UTC 04:00 -> London is 04:00 (sleep), NY is 23:00 (sleep) => Poor
  const poorEval = evaluateMeetingHour(timezones, 4, fixedUtc);
  assert.equal(poorEval.rating, "poor");
  assert.ok(poorEval.score < 50);
});
