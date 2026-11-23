# SEO, AdSense Compliance & Accessibility Rules

## 1. Google AdSense Compliance Guidelines
- **Zero CLS Ad Reservation**: All ad units must be rendered within reserved aspect-ratio skeleton containers with fixed min-heights. No layout shifts are permitted when ads load (`CLS = 0.000`).
- **Interactive Separation**: Ad slots must maintain at least 24px of clear whitespace from all interactive elements (buttons, inputs, sliders, download links) to prevent accidental clicks.
- **Mandatory Trust Pages**: Every public website domain must provide accessible `/about`, `/contact`, `/privacy-policy` (with explicit AdSense cookie disclosure), `/terms-of-service`, and `/editorial-policy`.
- **Editorial Context**: Utility tools and programmatic pages must include 300+ words of genuine explanatory editorial content, FAQs, and guides below the fold to avoid "Low-Value Content" policy rejections.

## 2. Technical SEO Mandates
- **Canonical Tags**: Every route must specify an absolute `<link rel="canonical" href="...">`.
- **JSON-LD Structured Data**: Mandatory Schema.org markup for each page type (`WebApplication`, `FAQPage`, `ClaimReview`, `Quotation`, `BreadcrumbList`).
- **Meta Hierarchy**: Page title (50–60 chars), meta description (120–155 chars), OpenGraph images (`1200x630`), Twitter card tags, and semantic `H1` -> `H2` -> `H3` heading trees.
- **Sitemap & Robots**: Clean `/robots.txt` pointing to `/sitemap-index.xml`.

## 3. Accessibility (WCAG 2.2 AA)
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text across all 5 themes (*Light, Dark, Glass, Cyberpunk, AAA*).
- **Touch Targets**: All interactive elements must measure at least 44x44 CSS pixels on mobile.
- **Keyboard Operability**: Full Tab navigation with visible, high-contrast focus rings. No keyboard traps.
- **Screen Reader Support**: Meaningful `aria-label`, `alt` attributes on all non-decorative images, and `aria-live` for dynamic state updates.
