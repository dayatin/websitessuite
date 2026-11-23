import assert from "node:assert/strict";
import test from "node:test";
import { EMOTION_MAP, matchQuotesToEmotion } from "../src/lib/mood-matcher.ts";

test("Mood Matcher maps all emotional states to relevant quotes", () => {
  for (const emotion of EMOTION_MAP) {
    const result = matchQuotesToEmotion(emotion.id, 2);
    assert.equal(result.emotion.id, emotion.id);
    assert.ok(result.quotes.length > 0, `No quotes returned for emotion: ${emotion.id}`);
    assert.ok(result.emotion.prescription.length >= 20);
  }
});

test("Mood Matcher handles unknown emotion with safe fallback", () => {
  const result = matchQuotesToEmotion("unknown_mood_slug", 2);
  assert.equal(result.emotion.id, "overwhelmed");
  assert.ok(result.quotes.length > 0);
});
