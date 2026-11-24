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
<div id="suite-consent-banner" class="suite-card" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 680px; z-index: 9999; box-shadow: 0 16px 48px rgba(0,0,0,0.3); background: var(--bg-surface-elevated, #ffffff); color: var(--text-primary, #0f172a); border: 1px solid var(--border-strong, #cbd5e1); display: flex; flex-direction: column; gap: 12px; padding: 18px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);" role="dialog" aria-modal="true" aria-label="Privacy & Cookie Preferences">
  <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">Privacy & Cookie Preferences</div>
  <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">
    We use cookies and third-party advertising partners (including Google AdSense) to deliver fast, free utilities and personalize content. Learn more in our <a href="/privacy-policy" style="text-decoration: underline; color: var(--accent-primary);">Privacy Policy</a>.
  </p>
  <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
    <button type="button" id="suite-consent-reject" class="suite-btn-secondary" style="min-height: 38px; font-size: 0.875rem; padding: 6px 14px; border-radius: 6px;">Reject Non-Essential</button>
    <button type="button" id="suite-consent-accept" class="suite-btn-primary" style="min-height: 38px; font-size: 0.875rem; padding: 6px 18px; border-radius: 6px;">Accept All</button>
  </div>
</div>
<script is:inline>
  (function() {
    function initConsent() {
      var banner = document.getElementById('suite-consent-banner');
      if (!banner) return;
      var stored = null;
      try { stored = localStorage.getItem('suite_consent_status'); } catch(e) {}
      if (stored) {
        banner.style.display = 'none';
        return;
      }
      var acceptBtn = document.getElementById('suite-consent-accept');
      var rejectBtn = document.getElementById('suite-consent-reject');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
          try { localStorage.setItem('suite_consent_status', 'accepted'); } catch(e) {}
          if (typeof gtag === 'function') {
            gtag('consent', 'update', {
              'ad_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted',
              'analytics_storage': 'granted'
            });
          }
          banner.style.display = 'none';
        });
      }
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
          try { localStorage.setItem('suite_consent_status', 'rejected'); } catch(e) {}
          banner.style.display = 'none';
        });
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initConsent);
    } else {
      initConsent();
    }
  })();
</script>
  `.trim();
}
