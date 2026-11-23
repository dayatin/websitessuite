import assert from "node:assert/strict";
import test from "node:test";
import {
  generateAdsTxt,
  getConsentModeScript,
  renderAdSlotHTML,
  renderAffiliateCardHTML,
  renderConsentBannerHTML,
  renderNewsletterCaptureHTML,
} from "../src/index.ts";

test("AdSlot renders zero-CLS reserved container and required label", () => {
  const slot = renderAdSlotHTML({
    client: "ca-pub-1234567890123456",
    slotId: "9876543210",
    format: "leaderboard",
    testMode: true,
  });
  assert.ok(slot.includes("min-height: 90px"));
  assert.ok(slot.includes("max-width: 728px"));
  assert.ok(slot.includes("Advertisement"));
  assert.ok(slot.includes("margin-block: 28px"));
});

test("Google Consent Mode v2 script contains required storage keys", () => {
  const script = getConsentModeScript({ defaultStatus: "denied" });
  assert.ok(script.includes("'ad_storage': 'denied'"));
  assert.ok(script.includes("'ad_user_data': 'denied'"));
  assert.ok(script.includes("'ad_personalization': 'denied'"));
  assert.ok(script.includes("'analytics_storage': 'denied'"));

  const banner = renderConsentBannerHTML();
  assert.ok(banner.includes("suite-consent-accept"));
  assert.ok(banner.includes("/privacy-policy"));
});

test("Affiliate card contains sponsored nofollow tag and FTC disclosure", () => {
  const card = renderAffiliateCardHTML({
    title: "1-Click Passport Photo Printing",
    description: "Get 4x6 biometric prints delivered to your door.",
    ctaText: "Order Prints",
    affiliateUrl: "https://partner.suite/prints",
    merchantName: "PrintMate",
    badge: "Official Partner",
  });
  assert.ok(card.includes('rel="sponsored nofollow noopener"'));
  assert.ok(card.includes("Disclosure:"));
  assert.ok(card.includes("PrintMate"));
});

test("Newsletter and ads.txt generate valid output", () => {
  const nl = renderNewsletterCaptureHTML({
    headline: "Daily Wisdom in Your Inbox",
    subheadline: "Get 1 verified fact and 1 quote every morning.",
    actionUrl: "/api/subscribe",
  });
  assert.ok(nl.includes('action="/api/subscribe"'));
  assert.ok(nl.includes('type="email"'));

  const adsTxt = generateAdsTxt([
    {
      domain: "google.com",
      publisherId: "pub-1111222233334444",
      accountType: "DIRECT",
      certificationAuthorityId: "f08c47fec0942fa0",
    },
  ]);
  assert.ok(adsTxt.includes("google.com, pub-1111222233334444, DIRECT, f08c47fec0942fa0"));
});
