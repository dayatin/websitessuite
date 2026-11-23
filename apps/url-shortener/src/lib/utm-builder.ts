/**
 * UTM Campaign Builder Engine & Preset Templates
 */

export interface UTMParams {
  source: string; // utm_source (e.g. "newsletter", "linkedin")
  medium: string; // utm_medium (e.g. "email", "social", "cpc")
  campaign: string; // utm_campaign (e.g. "black_friday_2026")
  term?: string; // utm_term (e.g. "cloud-hosting")
  content?: string; // utm_content (e.g. "hero_cta_button")
}

export interface UTMPreset {
  id: string;
  label: string;
  source: string;
  medium: string;
  defaultCampaign: string;
}

export const UTM_PRESETS: UTMPreset[] = [
  {
    id: "linkedin",
    label: "LinkedIn Post / Bio",
    source: "linkedin",
    medium: "social",
    defaultCampaign: "linkedin_organic",
  },
  {
    id: "tiktok",
    label: "TikTok Bio / Video Link",
    source: "tiktok",
    medium: "social_bio",
    defaultCampaign: "tiktok_bio",
  },
  {
    id: "youtube",
    label: "YouTube Description",
    source: "youtube",
    medium: "video_description",
    defaultCampaign: "youtube_video",
  },
  {
    id: "twitter",
    label: "Twitter / X Post",
    source: "x",
    medium: "social",
    defaultCampaign: "x_post",
  },
  {
    id: "newsletter",
    label: "Email Newsletter",
    source: "newsletter",
    medium: "email",
    defaultCampaign: "weekly_digest",
  },
  {
    id: "qr_print",
    label: "Physical Print / Flyer QR",
    source: "offline_print",
    medium: "qr_code",
    defaultCampaign: "event_flyer",
  },
];

/**
 * Builds a clean, correctly encoded URL with UTM tracking parameters.
 */
export function buildUTMUrl(baseUrl: string, params: UTMParams): string {
  let url: URL;
  try {
    url = new URL(baseUrl.trim());
  } catch {
    throw new Error("Invalid base URL provided for UTM building");
  }

  if (params.source) url.searchParams.set("utm_source", params.source.trim());
  if (params.medium) url.searchParams.set("utm_medium", params.medium.trim());
  if (params.campaign) url.searchParams.set("utm_campaign", params.campaign.trim());
  if (params.term) url.searchParams.set("utm_term", params.term.trim());
  if (params.content) url.searchParams.set("utm_content", params.content.trim());

  return url.toString();
}
