/**
 * Programmatic SEO Data Catalog for URL Shortener & QR Studio
 */

export interface PlatformSEOData {
  slug: string;
  name: string;
  title: string;
  description: string;
  defaultMedium: string;
  defaultCampaign: string;
  bestPractices: string[];
}

export const PLATFORMS_DATA: PlatformSEOData[] = [
  {
    slug: "tiktok",
    name: "TikTok",
    title: "UTM Builder for TikTok Ads & Bio Links",
    description:
      "Build clean, trackable UTM campaign URLs for TikTok bio links, Spark Ads, and video descriptions. Accurately measure TikTok ROAS in Google Analytics 4.",
    defaultMedium: "social_bio",
    defaultCampaign: "tiktok_viral_traffic",
    bestPractices: [
      "Keep short links concise to fit within strict TikTok bio character limits.",
      "Use 'utm_source=tiktok' and 'utm_medium=video_link' or 'spark_ad' for accurate GA4 channel grouping.",
      "Enable security preview mode if promoting new external products to preserve user trust.",
    ],
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    title: "UTM Builder for LinkedIn Posts, Newsletter & Ads",
    description:
      "Generate professional UTM campaign links optimized for LinkedIn organic posts, personal creator bios, and Sponsored Content campaigns.",
    defaultMedium: "social",
    defaultCampaign: "b2b_thought_leadership",
    bestPractices: [
      "Use branded short links (e.g. yourname.to/whitepaper) to boost B2B click-through rates by up to 34%.",
      "Tag 'utm_content' with post themes (e.g. carousel_infographic vs text_post) to run A/B format analytics.",
      "Always include clean UTM parameters when linking out in the post body rather than the first comment.",
    ],
  },
  {
    slug: "youtube",
    name: "YouTube",
    title: "UTM Builder for YouTube Video Descriptions & Community Posts",
    description:
      "Create tracked short links for YouTube video descriptions, pinned comments, channel headers, and Community tab updates.",
    defaultMedium: "video_description",
    defaultCampaign: "youtube_sponsorship",
    bestPractices: [
      "Place critical short links in the top 3 lines of your video description before the 'Show more' fold.",
      "Add unique 'utm_term' or 'utm_content' tags for each sponsored integration to report exact conversion metrics to sponsors.",
      "Pair with high-contrast QR codes displayed on-screen during sponsor shout-outs for mobile TV viewers.",
    ],
  },
  {
    slug: "newsletter",
    name: "Email Newsletters",
    title: "UTM Builder for Email Newsletters & Substack/Beehiiv",
    description:
      "Build trackable email links for newsletters, Substack, Beehiiv, Mailchimp, and ConvertKit. Measure subscriber click-throughs and sponsor conversions.",
    defaultMedium: "email",
    defaultCampaign: "weekly_digest",
    bestPractices: [
      "Set 'utm_source=newsletter' and 'utm_medium=email' to isolate newsletter traffic from general web referrals.",
      "Label sponsor links with 'utm_campaign=sponsor_[brand]' for effortless post-campaign reporting.",
      "Use clean vanity short links to prevent corporate email spam filters from penalizing long URL query strings.",
    ],
  },
];

export interface QRCodeUseCaseData {
  slug: string;
  name: string;
  title: string;
  description: string;
  recommendedSize: string;
  errorCorrection: "L" | "M" | "Q" | "H";
  guidelines: string[];
}

export const QR_USECASES_DATA: QRCodeUseCaseData[] = [
  {
    slug: "restaurants-and-menus",
    name: "Restaurants & Menus",
    title: "Custom QR Code Generator for Restaurant Menus & Table Ordering",
    description:
      "Generate stylish, waterproof table QR codes for digital restaurant menus, contactless ordering, and Google Review prompts.",
    recommendedSize: "4x4 cm (Table sticker) or 10x10 cm (Table tent)",
    errorCorrection: "H",
    guidelines: [
      "Use High ('H') error correction level so codes remain 100% scannable even if smudged or scratched on dining tables.",
      "Maintain a 10:1 distance-to-size scanning ratio (a 3 cm code scans easily from 30 cm away).",
      "Always print an explicit call-to-action underneath: 'Scan with camera for food & drink menu'.",
    ],
  },
  {
    slug: "real-estate-signage",
    name: "Real Estate Signage",
    title: "Custom QR Code Generator for Real Estate Yard Signs & Fliers",
    description:
      "Create high-visibility vector QR codes for real estate yard signs, open-house property fliers, and virtual 3D tour landing pages.",
    recommendedSize: "15x15 cm (Yard sign riders) or 5x5 cm (Brochures)",
    errorCorrection: "Q",
    guidelines: [
      "Export as vector SVG to ensure crisp rendering at 300+ DPI across large yard sign print formats.",
      "Link directly to a mobile-optimized virtual tour or property spec sheet without requiring app downloads.",
      "Attach UTM parameters ('utm_source=yard_sign') to track which neighborhood signage generates the most inquiries.",
    ],
  },
  {
    slug: "business-cards-and-vcard",
    name: "Business Cards & vCard",
    title: "Custom QR Code Generator for Digital Business Cards & vCard",
    description:
      "Generate compact, elegant QR codes for modern business cards linking to digital contact vCards, portfolios, and LinkedIn profiles.",
    recommendedSize: "2.5x2.5 cm (Standard business card corner)",
    errorCorrection: "M",
    guidelines: [
      "Avoid embedding large raw vCard strings directly into the matrix, which causes dense dots that fail on older cameras.",
      "Instead, link to your clean OmniLink Bio profile (`/bio/yourname`) for instant 1-tap contact saving.",
      "Ensure high contrast between the code dark dots and card background color (WCAG AAA compliant).",
    ],
  },
];
