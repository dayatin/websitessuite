import assert from "node:assert/strict";
import test from "node:test";
import {
  FOCUS_MODES,
  calculateBinauralFrequencies,
  calculatePomodoroCycles,
  generateBrownNoise,
  generateMathProblem,
  generateMemoryMatrix,
  generatePinkNoise,
  generateStroopItems,
  generateWhiteNoise,
} from "../src/lib/arcade-engine.ts";

test("FOCUS_MODES metadata catalog integrity", () => {
  assert.equal(FOCUS_MODES.length, 6);
  for (const mode of FOCUS_MODES) {
    assert.ok(mode.slug.length > 0);
    assert.ok(mode.title.length > 0);
    assert.ok(["audio", "productivity", "cognitive"].includes(mode.category));
    assert.ok(mode.badge.length > 0);
    assert.ok(mode.icon.length > 0);
    assert.ok(mode.description.length > 0);
    assert.ok(mode.features.length >= 3);
  }
});

test("procedural noise generators produce non-empty Float32Array buffers with valid amplitude", () => {
  const sampleLength = 1000;

  const white = generateWhiteNoise(sampleLength);
  assert.equal(white.length, sampleLength);
  assert.ok(white.some((v) => v !== 0));

  const pink = generatePinkNoise(sampleLength);
  assert.equal(pink.length, sampleLength);
  assert.ok(pink.some((v) => v !== 0));

  const brown = generateBrownNoise(sampleLength);
  assert.equal(brown.length, sampleLength);
  assert.ok(brown.some((v) => v !== 0));
});

test("calculateBinauralFrequencies computes exact auditory beat offsets", () => {
  const alpha = calculateBinauralFrequencies("alpha", 200);
  assert.equal(alpha.leftFreqHz, 200);
  assert.equal(alpha.rightFreqHz, 210);
  assert.equal(alpha.beatDifferenceHz, 10);
  assert.equal(alpha.waveType, "ALPHA");

  const theta = calculateBinauralFrequencies("theta", 220);
  assert.equal(theta.leftFreqHz, 220);
  assert.equal(theta.rightFreqHz, 226);
  assert.equal(theta.beatDifferenceHz, 6);

  const delta = calculateBinauralFrequencies("delta", 150);
  assert.equal(delta.beatDifferenceHz, 2.5);

  const beta = calculateBinauralFrequencies("beta", 250);
  assert.equal(beta.beatDifferenceHz, 18);
});

test("calculatePomodoroCycles plans structured work and rest intervals", () => {
  // 4 rounds of 25 min work, 5 min short break, 15 min long break
  const cycle = calculatePomodoroCycles(25, 5, 15, 4);
  assert.equal(cycle.workMinutesTotal, 100);
  assert.equal(cycle.breakMinutesTotal, 30); // 3 * 5 + 15
  assert.equal(cycle.totalMinutes, 130);
  assert.equal(cycle.intervals.length, 8); // 4 work + 3 short + 1 long

  assert.equal(cycle.intervals[0].type, "work");
  assert.equal(cycle.intervals[0].durationMinutes, 25);
  assert.equal(cycle.intervals[1].type, "shortBreak");
  assert.equal(cycle.intervals[7].type, "longBreak");
  assert.equal(cycle.intervals[7].durationMinutes, 15);
});

test("generateMathProblem generates arithmetic challenges with options", () => {
  const problem = generateMathProblem("medium");
  assert.ok(problem.question.includes("="));
  assert.equal(typeof problem.answer, "number");
  assert.ok(problem.options.includes(problem.answer));
  assert.ok(problem.options.length >= 4);

  const hardProblem = generateMathProblem("hard");
  assert.ok(hardProblem.question.includes("("));
  assert.ok(hardProblem.options.includes(hardProblem.answer));
});

test("generateStroopItems produces cognitive interference stimulus pairs", () => {
  const items = generateStroopItems(10);
  assert.equal(items.length, 10);
  for (const item of items) {
    assert.ok(["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"].includes(item.word));
    assert.ok(item.inkColor.startsWith("#"));
    assert.equal(typeof item.isCongruent, "boolean");
  }
});

test("generateMemoryMatrix creates unique spatial coordinates on grid", () => {
  const matrix = generateMemoryMatrix(4, 5);
  assert.equal(matrix.length, 5);
  const keys = new Set();
  for (const cell of matrix) {
    assert.ok(cell.row >= 0 && cell.row < 4);
    assert.ok(cell.col >= 0 && cell.col < 4);
    const key = `${cell.row},${cell.col}`;
    assert.ok(!keys.has(key), "Grid coordinates must be unique");
    keys.add(key);
  }
});
