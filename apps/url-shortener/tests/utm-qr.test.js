import assert from "node:assert/strict";
import test from "node:test";
import { generateQRCodeSVG } from "../src/lib/qr-generator.ts";
import { UTM_PRESETS, buildUTMUrl } from "../src/lib/utm-builder.ts";

test("UTM Builder attaches parameters accurately and preserves existing queries", () => {
  const url = buildUTMUrl("https://example.com/pricing?ref=header", {
    source: "linkedin",
    medium: "social",
    campaign: "q4_sale",
    term: "saas",
    content: "cta_button",
  });

  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get("ref"), "header");
  assert.equal(parsed.searchParams.get("utm_source"), "linkedin");
  assert.equal(parsed.searchParams.get("utm_medium"), "social");
  assert.equal(parsed.searchParams.get("utm_campaign"), "q4_sale");
  assert.equal(parsed.searchParams.get("utm_term"), "saas");
  assert.equal(parsed.searchParams.get("utm_content"), "cta_button");
});

test("UTM Presets catalog contains all mandatory channels", () => {
  const presetIds = UTM_PRESETS.map((p) => p.id);
  assert.ok(presetIds.includes("linkedin"));
  assert.ok(presetIds.includes("tiktok"));
  assert.ok(presetIds.includes("youtube"));
  assert.ok(presetIds.includes("newsletter"));
  assert.ok(presetIds.includes("qr_print"));
});

test("QR Code Generator produces valid vector SVG markup", async () => {
  const svg = await generateQRCodeSVG("https://omnilink.to/x9K2", {
    darkColor: "#00f0ff",
    lightColor: "#000000",
    errorCorrectionLevel: "H",
  });

  assert.ok(svg.includes("<svg"));
  assert.ok(svg.includes("</svg>"));
  assert.ok(svg.includes("#00f0ff"));
});
