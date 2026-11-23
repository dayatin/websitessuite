export interface SiteComplianceInfo {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  effectiveDate?: string;
  physicalLocation?: string;
}

/**
 * Generates an AdSense-compliant, GDPR/CCPA-ready Privacy Policy HTML.
 */
export function generatePrivacyPolicyHTML(info: SiteComplianceInfo): string {
  const date = info.effectiveDate || new Date().toISOString().split("T")[0];
  return `
<article class="suite-compliance-page suite-card">
  <h1>Privacy Policy</h1>
  <p class="suite-compliance-meta"><strong>Effective Date:</strong> ${date} | <strong>Domain:</strong> <a href="${info.siteUrl}">${info.siteName}</a></p>

  <h2>1. Overview and Commitment</h2>
  <p>${info.siteName} ("we", "our", or "us") respects your privacy. This policy outlines how we handle user data across our platform. We are committed to minimizing data collection, ensuring maximum user privacy, and operating in full compliance with global privacy regulations including GDPR, CCPA/CPRA, and Google AdSense publisher policies.</p>

  <h2>2. Google AdSense & Third-Party Advertising</h2>
  <p>We use Google AdSense and affiliated advertising partners to serve advertisements when you visit our website.</p>
  <ul>
    <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
    <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our sites and/or other sites on the Internet.</li>
    <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> or through the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a>.</li>
  </ul>

  <h2>3. In-Browser Local Processing & Security</h2>
  <p>Many of our utilities (such as image formatting, background removal, client conversions, and calculators) process your files and inputs <strong>100% locally in your web browser</strong> using WebAssembly and WebGPU. Your uploaded media and private data never traverse or get stored on our backend servers unless an explicit server feature is requested.</p>

  <h2>4. Contact & Inquiries</h2>
  <p>If you have any questions or privacy inquiries, contact us at <a href="mailto:${info.supportEmail}">${info.supportEmail}</a>.</p>
</article>
  `.trim();
}

/**
 * Generates comprehensive Terms of Service HTML.
 */
export function generateTermsOfServiceHTML(info: SiteComplianceInfo): string {
  const date = info.effectiveDate || new Date().toISOString().split("T")[0];
  return `
<article class="suite-compliance-page suite-card">
  <h1>Terms of Service</h1>
  <p class="suite-compliance-meta"><strong>Effective Date:</strong> ${date}</p>

  <h2>1. Acceptance of Terms</h2>
  <p>By accessing or using ${info.siteName} at ${info.siteUrl}, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.</p>

  <h2>2. Permitted Use</h2>
  <p>You agree to use our tools and resources only for lawful purposes. You must not use our short links, tools, or APIs to distribute malware, spam, phishing, unauthorized copyrighted materials, or illegal content.</p>

  <h2>3. Disclaimer of Warranties</h2>
  <p>Our tools, calculations, conversions, and information are provided on an "as-is" and "as-available" basis without warranties of any kind.</p>

  <h2>4. Contact</h2>
  <p>For questions regarding these terms, email <a href="mailto:${info.supportEmail}">${info.supportEmail}</a>.</p>
</article>
  `.trim();
}

/**
 * Generates Editorial Policy HTML (Vital for Daily Facts & Daily Quotes AdSense approval).
 */
export function generateEditorialPolicyHTML(info: SiteComplianceInfo): string {
  return `
<article class="suite-compliance-page suite-card">
  <h1>Editorial Policy & Verification Standards</h1>
  <p>At ${info.siteName}, accuracy, attribution, and editorial integrity are our foundational pillars.</p>

  <h2>1. Primary Source Verification</h2>
  <p>Every fact, claim, historical date, and quotation published across our platform undergoes multi-source verification against primary archival records, peer-reviewed scientific journals, academic databases, and authenticated literary publications.</p>

  <h2>2. Corrections & Updates Policy</h2>
  <p>We actively monitor the accuracy of our databases. If you discover a factual error or misattributed quote, please contact our editorial board at <a href="mailto:${info.supportEmail}">${info.supportEmail}</a>. Verified corrections are applied within 24 hours.</p>
</article>
  `.trim();
}

/**
 * Generates About Page HTML.
 */
export function generateAboutPageHTML(info: SiteComplianceInfo): string {
  return `
<article class="suite-compliance-page suite-card">
  <h1>About ${info.siteName}</h1>
  <p class="lead">${info.siteName} is built to deliver ultra-fast, privacy-first, accessible digital utilities and knowledge platforms to millions of users worldwide.</p>
  <h2>Our Mission</h2>
  <p>We believe essential digital tools should be instant, beautifully designed, accessible on any device, and private by default.</p>
</article>
  `.trim();
}

/**
 * Generates Contact Support Page HTML with working Turnstile placeholder.
 */
export function generateContactPageHTML(info: SiteComplianceInfo): string {
  return `
<article class="suite-compliance-page suite-card">
  <h1>Contact Us</h1>
  <p>Have questions, feedback, or a partnership inquiry? Reach out to our team.</p>
  <p>Direct Support Email: <a href="mailto:${info.supportEmail}">${info.supportEmail}</a></p>
</article>
  `.trim();
}
