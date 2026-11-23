import assert from "node:assert/strict";
import test from "node:test";
import {
  DIMENSIONS,
  POPULAR_CONVERSIONS,
  convertUnit,
  generateReferenceTable,
} from "../src/lib/unit-engine.ts";

test("DIMENSIONS metadata catalog integrity", () => {
  const dimensionKeys = Object.keys(DIMENSIONS);
  assert.equal(dimensionKeys.length, 7);

  for (const key of dimensionKeys) {
    const dim = DIMENSIONS[key];
    assert.equal(dim.key, key);
    assert.ok(dim.name.length > 0);
    assert.ok(dim.icon.length > 0);
    assert.ok(dim.units.length >= 4);
    assert.ok(dim.units.some((u) => u.key === dim.baseUnit));
  }
});

test("POPULAR_CONVERSIONS catalog contains valid pairwise routes", () => {
  assert.equal(POPULAR_CONVERSIONS.length, 10);
  for (const pair of POPULAR_CONVERSIONS) {
    assert.ok(pair.slug.length > 0);
    assert.ok(pair.title.length > 0);
    assert.ok(pair.description.length > 0);

    const dim = DIMENSIONS[pair.dimension];
    assert.ok(dim, `Unknown dimension in pair: ${pair.dimension}`);
    assert.ok(dim.units.some((u) => u.key === pair.fromKey));
    assert.ok(dim.units.some((u) => u.key === pair.toKey));
  }
});

test("convertUnit converts Length & Distance units with precision", () => {
  // 1 meter to feet
  const mToFt = convertUnit(1, "length", "m", "ft");
  assert.ok(Math.abs(mToFt.result - 3.2808399) < 0.0001);
  assert.equal(mToFt.fromUnit.symbol, "m");
  assert.equal(mToFt.toUnit.symbol, "ft");

  // 1 kilometer to meters
  const kmToM = convertUnit(1, "length", "km", "m");
  assert.equal(kmToM.result, 1000);

  // 1 mile to kilometers
  const miToKm = convertUnit(1, "length", "mi", "km");
  assert.ok(Math.abs(miToKm.result - 1.609344) < 0.00001);
});

test("convertUnit converts Mass & Weight with international standards", () => {
  // 1 kg to pounds
  const kgToLb = convertUnit(1, "mass", "kg", "lb");
  assert.ok(Math.abs(kgToLb.result - 2.20462262) < 0.0001);

  // 1 metric ton to kg
  const tToKg = convertUnit(1, "mass", "t", "kg");
  assert.equal(tToKg.result, 1000);

  // 1 stone to pounds (14 lbs)
  const stToLb = convertUnit(1, "mass", "st", "lb");
  assert.ok(Math.abs(stToLb.result - 14) < 0.0001);
});

test("convertUnit handles affine Temperature calculations accurately", () => {
  // 0°C to °F = 32°F
  const cToF = convertUnit(0, "temperature", "c", "f");
  assert.equal(cToF.result, 32);

  // 100°C to °F = 212°F
  const boiling = convertUnit(100, "temperature", "c", "f");
  assert.equal(boiling.result, 212);

  // -40°C = -40°F
  const parity = convertUnit(-40, "temperature", "c", "f");
  assert.equal(parity.result, -40);

  // 0°C to Kelvin = 273.15 K
  const kelvin = convertUnit(0, "temperature", "c", "k");
  assert.equal(kelvin.result, 273.15);
});

test("convertUnit handles Digital Storage (Decimal vs Binary)", () => {
  // 1 GB decimal = 1000 MB
  const gbToMb = convertUnit(1, "digital", "GB", "MB");
  assert.equal(gbToMb.result, 1000);

  // 1 GiB binary = 1024 MiB
  const gibToMib = convertUnit(1, "digital", "GiB", "MiB");
  assert.equal(gibToMib.result, 1024);
});

test("convertUnit handles Speed, Pressure & Energy physical quantities", () => {
  // 60 mph in km/h = ~96.56064 km/h
  const speed = convertUnit(60, "speed", "mph", "km/h");
  assert.ok(Math.abs(speed.result - 96.56064) < 0.01);

  // 1 atm in Pa = 101325 Pa
  const pressure = convertUnit(1, "pressure", "atm", "Pa");
  assert.equal(pressure.result, 101325);

  // 1 kWh in Joules = 3,600,000 J
  const energy = convertUnit(1, "energy", "kWh", "J");
  assert.equal(energy.result, 3600000);
});

test("generateReferenceTable constructs table rows accurately", () => {
  const table = generateReferenceTable("length", "m", "ft", [1, 2, 5, 10]);
  assert.equal(table.length, 4);
  assert.equal(table[0].input, 1);
  assert.ok(table[0].output > 3.28);
  assert.equal(table[3].input, 10);
  assert.ok(table[3].output > 32.8);
});

test("convertUnit throws on invalid dimensions or unit keys", () => {
  // Invalid dimension
  // @ts-expect-error testing invalid dimension
  assert.throws(() => convertUnit(1, "invalid-dim", "m", "ft"), /Invalid dimension/);

  // Invalid unit key
  assert.throws(() => convertUnit(1, "length", "m", "unknown-unit"), /Invalid unit keys/);
});
