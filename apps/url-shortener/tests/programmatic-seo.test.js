import assert from "node:assert/strict";
import test from "node:test";
import { PLATFORMS_DATA, QR_USECASES_DATA } from "../src/lib/programmatic-data.ts";

test("Programmatic SEO platforms catalog is populated and valid", () => {
  assert.ok(PLATFORMS_DATA.length >= 4);
  for (const platform of PLATFORMS_DATA) {
    assert.ok(platform.slug.length > 0);
    assert.ok(platform.title.length > 10);
    assert.ok(platform.bestPractices.length >= 2);
  }
});

test("Programmatic QR usecases catalog contains valid print specs", () => {
  assert.ok(QR_USECASES_DATA.length >= 3);
  for (const usecase of QR_USECASES_DATA) {
    assert.ok(usecase.slug.length > 0);
    assert.ok(usecase.recommendedSize.length > 0);
    assert.ok(["L", "M", "Q", "H"].includes(usecase.errorCorrection));
    assert.ok(usecase.guidelines.length >= 2);
  }
});
