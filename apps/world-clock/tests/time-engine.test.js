import assert from "node:assert/strict";
import test from "node:test";
import { TimeEngine, WORLD_CITIES } from "../src/lib/time-engine.ts";

test("TimeEngine initializes with comprehensive world city corpus", () => {
  const engine = new TimeEngine();
  const allCities = engine.getAllCities();
  assert.ok(allCities.length >= 20);

  const ny = engine.getCityById("new-york");
  assert.ok(ny);
  assert.equal(ny.name, "New York");
  assert.equal(ny.timezone, "America/New_York");
  assert.equal(ny.countryCode, "US");

  const searchResults = engine.searchCities("tokyo");
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, "tokyo");

  const popular = engine.getPopularCities();
  assert.ok(popular.length >= 10);
  assert.ok(popular.some((c) => c.id === "london"));
  assert.ok(popular.some((c) => c.id === "tokyo"));
});

test("TimeEngine formats timezone time and UTC offsets accurately", () => {
  const engine = new TimeEngine();
  // Fixed winter date: 2026-01-15 12:00:00 UTC
  const fixedUtc = new Date(Date.UTC(2026, 0, 15, 12, 0, 0));

  // UTC check
  const utcTime = engine.getTimeForZone(fixedUtc, "UTC");
  assert.equal(utcTime.hours, 12);
  assert.equal(utcTime.minutes, 0);
  assert.equal(utcTime.formattedUtcOffset, "UTC+00:00");
  assert.equal(utcTime.formattedTime24, "12:00");

  // New York in January is EST (UTC-5)
  const nyTime = engine.getTimeForZone(fixedUtc, "America/New_York");
  assert.equal(nyTime.hours, 7);
  assert.equal(nyTime.formattedUtcOffset, "UTC-05:00");
  assert.equal(nyTime.formattedTime12, "07:00 AM");

  // Tokyo is JST (UTC+9)
  const tokyoTime = engine.getTimeForZone(fixedUtc, "Asia/Tokyo");
  assert.equal(tokyoTime.hours, 21);
  assert.equal(tokyoTime.formattedUtcOffset, "UTC+09:00");

  // Mumbai is IST (UTC+5:30)
  const mumbaiTime = engine.getTimeForZone(fixedUtc, "Asia/Kolkata");
  assert.equal(mumbaiTime.hours, 17);
  assert.equal(mumbaiTime.minutes, 30);
  assert.equal(mumbaiTime.formattedUtcOffset, "UTC+05:30");
  assert.equal(mumbaiTime.formattedTime12, "05:30 PM");
});

test("Astronomical solar calculator approximates sunrise, sunset & solar noon", () => {
  const engine = new TimeEngine();
  const date = new Date(Date.UTC(2026, 5, 21, 12, 0, 0)); // Summer solstice
  const london = engine.getCityById("london");
  assert.ok(london);

  const solar = engine.calculateSolarTimes(date, london.lat, london.lng, london.timezone);
  assert.ok(solar.sunriseTime.length > 0);
  assert.ok(solar.sunsetTime.length > 0);
  assert.ok(solar.solarNoonTime.length > 0);
  assert.ok(solar.dayLengthMinutes > 14 * 60, "London summer solstice has > 14h daylight");
});

test("Overlap finder detects optimal working windows between London and New York", () => {
  const engine = new TimeEngine();
  const date = new Date(Date.UTC(2026, 0, 15));
  const slots = engine.findOverlapHours(["london", "new-york"], date);

  assert.equal(slots.length, 24);

  // UTC 14:00 = 14:00 in London (working) and 09:00 in NY (working) -> optimal
  const slot14Utc = slots.find((s) => s.hourUtc === 14);
  assert.ok(slot14Utc);
  assert.equal(slot14Utc.quality, "optimal");

  // UTC 03:00 = 03:00 in London and 22:00 in NY -> sleeping
  const slot03Utc = slots.find((s) => s.hourUtc === 3);
  assert.ok(slot03Utc);
  assert.equal(slot03Utc.quality, "sleeping");
});
