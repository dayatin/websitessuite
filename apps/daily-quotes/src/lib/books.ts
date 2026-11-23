import type { AffiliateOffer } from "@suite/monetization";

export const AUTHOR_BOOK_RECOMMENDATIONS: Record<string, AffiliateOffer> = {
  "marcus-aurelius": {
    title: "Meditations (Penguin Classics)",
    description:
      "The private journal of the Roman Emperor, offering profound reflections on Stoic virtue, self-control, mental discipline, and inner tranquility.",
    ctaText: "Get Meditations",
    affiliateUrl: "https://partner.suite.local/books/marcus-aurelius-meditations",
    merchantName: "Bookshop.org / Independent Booksellers",
    badge: "Essential Philosophy",
  },
  seneca: {
    title: "Letters from a Stoic (Epistulae Morales)",
    description:
      "Seneca's timeless moral essays exploring friendship, anger, the value of time, and tranquility in an unpredictable world.",
    ctaText: "Get Seneca's Letters",
    affiliateUrl: "https://partner.suite.local/books/seneca-letters",
    merchantName: "Bookshop.org / Independent Booksellers",
    badge: "Stoic Classic",
  },
  "ralph-waldo-emerson": {
    title: "Self-Reliance and Other Essays",
    description:
      "Emerson's definitive call for non-conformity, original thought, trust in one's intuition, and individual sovereignty.",
    ctaText: "Get Self-Reliance",
    affiliateUrl: "https://partner.suite.local/books/emerson-self-reliance",
    merchantName: "Bookshop.org / Independent Booksellers",
    badge: "Transcendental Masterpiece",
  },
  "maya-angelou": {
    title: "I Know Why the Caged Bird Sings",
    description:
      "Maya Angelou's legendary memoir celebrating resilience, the transformative power of literature, and the triumph of the human spirit.",
    ctaText: "Get Memoir",
    affiliateUrl: "https://partner.suite.local/books/maya-angelou-caged-bird",
    merchantName: "Bookshop.org / Independent Booksellers",
    badge: "Literary Landmark",
  },
  "leonardo-da-vinci": {
    title: "The Notebooks of Leonardo da Vinci",
    description:
      "Dive into the mind of history's greatest polymath with his original sketches, scientific observations, and creative maxims.",
    ctaText: "Get Leonardo's Notebooks",
    affiliateUrl: "https://partner.suite.local/books/da-vinci-notebooks",
    merchantName: "Bookshop.org / Independent Booksellers",
    badge: "Universal Genius",
  },
};

export const TOPIC_BOOK_RECOMMENDATIONS: Record<string, AffiliateOffer> = {
  wisdom: {
    title: "The Daily Stoic: 366 Meditations",
    description:
      "Daily translations and commentary on Seneca, Epictetus, and Marcus Aurelius designed to cultivate mental strength and clarity.",
    ctaText: "Explore Book",
    affiliateUrl: "https://partner.suite.local/books/daily-stoic",
    merchantName: "Bookshop.org",
    badge: "Bestseller",
  },
  resilience: {
    title: "Man's Search for Meaning by Viktor E. Frankl",
    description:
      "A renowned psychiatrist's account of finding spiritual purpose and unshakeable resilience through life's deepest trials.",
    ctaText: "Read Landmark Book",
    affiliateUrl: "https://partner.suite.local/books/mans-search-for-meaning",
    merchantName: "Bookshop.org",
    badge: "Life-Changing",
  },
  focus: {
    title: "Deep Work: Rules for Focused Success by Cal Newport",
    description:
      "The definitive guide to eliminating digital noise, cultivating intense concentration, and producing high-value creative work.",
    ctaText: "Master Deep Work",
    affiliateUrl: "https://partner.suite.local/books/deep-work",
    merchantName: "Bookshop.org",
    badge: "Productivity",
  },
  creativity: {
    title: "The Creative Act: A Way of Being by Rick Rubin",
    description:
      "A generous framework for cultivating presence, listening deeply, and connecting with creative inspiration from legendary music producer Rick Rubin.",
    ctaText: "Explore Creativity",
    affiliateUrl: "https://partner.suite.local/books/creative-act",
    merchantName: "Bookshop.org",
    badge: "Creative Guide",
  },
};

export function getBookRecommendationForAuthor(authorSlug: string): AffiliateOffer {
  return (
    AUTHOR_BOOK_RECOMMENDATIONS[authorSlug.toLowerCase().trim()] || {
      title: "Great Thinkers on Life, Wisdom & Purpose",
      description:
        "Curated anthologies of classic literature, philosophical dialogues, and historical reflections curated by world-class scholars.",
      ctaText: "Browse Collection",
      affiliateUrl: "https://partner.suite.local/books/classics",
      merchantName: "Bookshop.org",
      badge: "Curated Classics",
    }
  );
}

export function getBookRecommendationForTopic(topicSlug: string): AffiliateOffer {
  const t = topicSlug.toLowerCase().trim();
  if (t === "courage" || t === "adversity") {
    return TOPIC_BOOK_RECOMMENDATIONS.resilience;
  }
  if (t === "leadership" || t === "monday-motivation") {
    return TOPIC_BOOK_RECOMMENDATIONS.focus;
  }
  return TOPIC_BOOK_RECOMMENDATIONS[t] || TOPIC_BOOK_RECOMMENDATIONS.wisdom;
}
