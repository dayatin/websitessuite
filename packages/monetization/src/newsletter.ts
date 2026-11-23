/**
 * Newsletter & Daily Digest Capture Widget
 */

export interface NewsletterConfig {
  headline: string;
  subheadline: string;
  actionUrl: string; // e.g. "/api/newsletter/subscribe"
  placeholder?: string;
  privacyText?: string;
}

export function renderNewsletterCaptureHTML(config: NewsletterConfig): string {
  return `
<section class="suite-card suite-newsletter-box" style="margin-block: 32px; padding: 1.75rem; text-align: center; border: 1px solid var(--border-strong);">
  <h3 style="font-size: 1.375rem; font-weight: 700; margin-bottom: 8px;">${config.headline}</h3>
  <p style="font-size: 0.9375rem; color: var(--text-secondary); max-width: 540px; margin-inline: auto; margin-bottom: 20px;">
    ${config.subheadline}
  </p>
  <form action="${config.actionUrl}" method="POST" style="display: flex; gap: 8px; justify-content: center; max-width: 480px; margin-inline: auto; flex-wrap: wrap;">
    <input type="email" name="email" required placeholder="${config.placeholder || "Enter your email address..."}"
      style="flex: 1 1 240px; min-height: 44px; padding: 8px 14px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); color: var(--text-primary);" />
    <button type="submit" class="suite-btn-primary" style="padding: 10px 20px;">Subscribe Free</button>
  </form>
  <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 10px;">
    ${config.privacyText || "No spam ever. 1-click unsubscribe anytime."}
  </p>
</section>
  `.trim();
}
