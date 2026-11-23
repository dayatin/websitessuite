/**
 * Contextual Affiliate Cards & FTC Compliance
 */

export interface AffiliateOffer {
  title: string;
  description: string;
  ctaText: string;
  affiliateUrl: string;
  badge?: string; // e.g. "Featured Partner", "Recommended"
  merchantName: string;
}

/**
 * Renders high-converting affiliate card with strict FTC compliance disclosures.
 */
export function renderAffiliateCardHTML(offer: AffiliateOffer): string {
  return `
<aside class="suite-card suite-affiliate-card" style="margin-block: 24px; border: 1px solid var(--border-subtle); padding: 1.25rem;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
    ${offer.badge ? `<span style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: var(--accent-glow); color: var(--accent-primary); padding: 2px 8px; border-radius: 9999px;">${offer.badge}</span>` : "<span></span>"}
    <span style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase;">Sponsored</span>
  </div>
  <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 6px;">${offer.title}</h3>
  <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5;">${offer.description}</p>
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
    <span style="font-size: 0.75rem; color: var(--text-muted);">Partner: ${offer.merchantName}</span>
    <a href="${offer.affiliateUrl}" target="_blank" rel="sponsored nofollow noopener" class="suite-btn-primary" style="font-size: 0.875rem; padding: 8px 16px;">
      ${offer.ctaText} &rarr;
    </a>
  </div>
  <p style="font-size: 0.6875rem; color: var(--text-muted); margin-top: 10px; border-top: 1px solid var(--border-subtle); padding-top: 6px; font-style: italic;">
    Disclosure: When you purchase through our links, we may earn an affiliate commission at no extra cost to you.
  </p>
</aside>
  `.trim();
}
