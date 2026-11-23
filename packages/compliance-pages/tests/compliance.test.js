import assert from "node:assert/strict";
import test from "node:test";
import {
  generateAboutPageHTML,
  generateContactPageHTML,
  generateEditorialPolicyHTML,
  generatePrivacyPolicyHTML,
  generateTermsOfServiceHTML,
} from "../src/index.ts";

const siteInfo = {
  siteName: "FactSphere",
  siteUrl: "https://factsphere.suite",
  supportEmail: "support@factsphere.suite",
};

test("Privacy Policy includes mandatory Google AdSense and cookie disclosures", () => {
  const html = generatePrivacyPolicyHTML(siteInfo);
  assert.ok(html.includes("Google AdSense"));
  assert.ok(html.includes("cookies"));
  assert.ok(html.includes("opt out"));
  assert.ok(html.includes(siteInfo.supportEmail));
});

test("Editorial Policy includes fact-checking and corrections protocols", () => {
  const html = generateEditorialPolicyHTML(siteInfo);
  assert.ok(html.includes("Verification Standards"));
  assert.ok(html.includes("Corrections & Updates Policy"));
});

test("About, Terms, and Contact templates render cleanly", () => {
  const about = generateAboutPageHTML(siteInfo);
  const terms = generateTermsOfServiceHTML(siteInfo);
  const contact = generateContactPageHTML(siteInfo);
  assert.ok(about.includes(siteInfo.siteName));
  assert.ok(terms.includes("Terms of Service"));
  assert.ok(contact.includes(siteInfo.supportEmail));
});
