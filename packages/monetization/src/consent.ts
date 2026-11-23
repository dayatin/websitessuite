/**
 * Google Consent Mode v2 & GDPR/CCPA CMP Helper
 */

export interface ConsentConfig {
  defaultStatus?: "granted" | "denied";
  gpcSupport?: boolean;
}

/**
 * Returns inline script that MUST be loaded BEFORE Google tags to set up Consent Mode v2 defaults.
 */
export function getConsentModeScript(config?: ConsentConfig): string {
  const defaultStatus = config?.defaultStatus || "denied";
  return `
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': '${defaultStatus}',
    'ad_user_data': '${defaultStatus}',
    'ad_personalization': '${defaultStatus}',
    'analytics_storage': '${defaultStatus}',
    'wait_for_update': 500
  });
  gtag('set', 'ads_data_redaction', true);
</script>
  `.trim();
}

/**
 * Returns accessible, lightweight Cookie & Privacy Banner HTML.
 */
export function renderConsentBannerHTML(): string {
  return `
<div id="suite-consent-banner" class="suite-card" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 680px; z-index: 9999; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 1px solid var(--border-strong); display: flex; flex-direction: column; gap: 12px; padding: 18px;" role="dialog" aria-modal="true" aria-label="Privacy & Cookie Preferences">
  <div style="font-weight: 600; font-size: 1rem;">Privacy & Cookie Preferences</div>
  <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">
    We use cookies and third-party advertising partners (including Google AdSense) to deliver fast, free utilities and personalize content. Learn more in our <a href="/privacy-policy" style="text-decoration: underline;">Privacy Policy</a>.
  </p>
  <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
    <button type="button" id="suite-consent-reject" class="suite-btn-secondary" style="min-height: 38px; font-size: 0.875rem; padding: 6px 14px;">Reject Non-Essential</button>
    <button type="button" id="suite-consent-accept" class="suite-btn-primary" style="min-height: 38px; font-size: 0.875rem; padding: 6px 18px;">Accept All</button>
  </div>
</div>
  `.trim();
}
