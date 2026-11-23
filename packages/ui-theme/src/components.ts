import { THEMES, type ThemeId } from "./theme-engine.ts";

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface HeaderConfig {
  siteTitle?: string;
  logoIcon?: string;
  navItems?: NavItem[];
  currentPath?: string;
}

export interface FooterConfig {
  siteTitle?: string;
  tagline?: string;
  copyrightYear?: number;
}

/**
 * Renders semantic header markup compatible with vanilla, Astro, or SSR templates.
 */
export function renderHeaderHTML(config?: HeaderConfig): string {
  const cfg = config || {};
  const title = cfg.siteTitle || "Suite Platform";
  const navItems = cfg.navItems || [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  const navLinks = navItems
    .map(
      (item) =>
        `<li><a href="${item.href}" class="suite-nav-link" ${item.external ? 'target="_blank" rel="noopener"' : ""}>${item.label}</a></li>`,
    )
    .join("");

  return `
<header class="suite-navbar">
  <div class="suite-container suite-nav-container">
    <a href="/" class="suite-brand">
      ${cfg.logoIcon ? `<span class="suite-brand-icon">${cfg.logoIcon}</span>` : ""}
      <span class="suite-brand-title">${title}</span>
    </a>
    <nav class="suite-nav">
      <ul class="suite-nav-list">
        ${navLinks}
      </ul>
    </nav>
    <div class="suite-header-actions">
      <button type="button" id="suite-theme-toggle" class="suite-btn-secondary suite-theme-btn" aria-label="Toggle visual theme" title="Switch Theme">
        <span class="suite-theme-icon">🎨</span>
        <span class="suite-theme-label">Theme</span>
      </button>
    </div>
  </div>
</header>
  `.trim();
}

/**
 * Renders AdSense-compliant footer with mandatory legal and trust links.
 */
export function renderFooterHTML(config?: FooterConfig): string {
  const cfg = config || {};
  const title = cfg.siteTitle || "Suite Platform";
  const tagline = cfg.tagline || "Fast, accessible & privacy-first digital utilities.";
  const year = cfg.copyrightYear || new Date().getFullYear();
  return `
<footer class="suite-footer">
  <div class="suite-container suite-footer-content">
    <div class="suite-footer-col">
      <div class="suite-footer-brand">${title}</div>
      <p class="suite-footer-tagline">${tagline}</p>
      <p class="suite-copyright">&copy; ${year} ${title}. All rights reserved.</p>
    </div>
    <div class="suite-footer-col">
      <h4 class="suite-footer-heading">Trust & Legal</h4>
      <ul class="suite-footer-links">
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <li><a href="/terms-of-service">Terms of Service</a></li>
        <li><a href="/editorial-policy">Editorial Standards</a></li>
        <li><a href="/contact">Contact Support</a></li>
        <li><a href="/about">About Us</a></li>
      </ul>
    </div>
  </div>
</footer>
  `.trim();
}
