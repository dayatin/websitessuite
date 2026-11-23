/**
 * Typed Schema.org JSON-LD Generators
 */

export interface WebApplicationSchemaOptions {
  name: string;
  url: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

export function buildWebApplicationSchema(options: WebApplicationSchemaOptions): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: options.name,
    url: options.url,
    description: options.description,
    applicationCategory: options.applicationCategory,
    operatingSystem: options.operatingSystem || "All Modern Browsers",
    offers: {
      "@type": "Offer",
      price: options.offers?.price || "0",
      priceCurrency: options.offers?.priceCurrency || "USD",
    },
  };
  return JSON.stringify(schema);
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQSchema(items: FAQItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  return JSON.stringify(schema);
}

export interface ClaimReviewOptions {
  claimReviewed: string;
  reviewUrl: string;
  ratingValue: string;
  bestRating?: string;
  alternateName?: string;
  authorName: string;
  authorUrl: string;
  appearanceDate?: string;
}

export function buildClaimReviewSchema(options: ClaimReviewOptions): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url: options.reviewUrl,
    claimReviewed: options.claimReviewed,
    datePublished: options.appearanceDate || new Date().toISOString().split("T")[0],
    author: {
      "@type": "Organization",
      name: options.authorName,
      url: options.authorUrl,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: options.ratingValue,
      bestRating: options.bestRating || "5",
      alternateName: options.alternateName || "Verified Fact",
    },
  };
  return JSON.stringify(schema);
}

export interface QuotationOptions {
  quoteText: string;
  authorName: string;
  authorSameAs?: string;
  workTitle?: string;
}

export function buildQuotationSchema(options: QuotationOptions): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    text: options.quoteText,
    creator: {
      "@type": "Person",
      name: options.authorName,
      ...(options.authorSameAs ? { sameAs: options.authorSameAs } : {}),
    },
    ...(options.workTitle
      ? {
          citation: {
            "@type": "CreativeWork",
            name: options.workTitle,
          },
        }
      : {}),
  };
  return JSON.stringify(schema);
}

export interface PersonSchemaOptions {
  name: string;
  url?: string;
  description?: string;
  jobTitle?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  sameAs?: string;
  image?: string;
}

export function buildPersonSchema(options: PersonSchemaOptions): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: options.name,
    ...(options.url ? { url: options.url } : {}),
    ...(options.description ? { description: options.description } : {}),
    ...(options.jobTitle ? { jobTitle: options.jobTitle } : {}),
    ...(options.birthDate ? { birthDate: options.birthDate } : {}),
    ...(options.deathDate ? { deathDate: options.deathDate } : {}),
    ...(options.nationality ? { nationality: options.nationality } : {}),
    ...(options.sameAs ? { sameAs: options.sameAs } : {}),
    ...(options.image ? { image: options.image } : {}),
  };
  return JSON.stringify(schema);
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return JSON.stringify(schema);
}
