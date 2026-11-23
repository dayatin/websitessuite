import type { AuthorRecord, QuoteRecord } from "../db/schema.ts";
import { MOODS, OCCASIONS, SEED_AUTHORS, SEED_QUOTES } from "./seed-quotes.ts";

export class QuoteCorpusLoader {
  private quotes: QuoteRecord[];
  private authors: Record<string, AuthorRecord>;

  constructor(customQuotes?: QuoteRecord[], customAuthors?: Record<string, AuthorRecord>) {
    this.quotes = customQuotes || SEED_QUOTES;
    this.authors = customAuthors || SEED_AUTHORS;
  }

  getAllMoods() {
    return MOODS;
  }

  getAllOccasions() {
    return OCCASIONS;
  }

  getAllAuthors(): AuthorRecord[] {
    return Object.values(this.authors);
  }

  getAuthorBySlug(slug: string): AuthorRecord | null {
    return this.authors[slug.toLowerCase().trim()] || null;
  }

  getQuoteById(id: number): QuoteRecord | null {
    return this.quotes.find((q) => q.id === id) || null;
  }

  getQuoteBySlug(slug: string): QuoteRecord | null {
    return this.quotes.find((q) => q.slug === slug.toLowerCase().trim()) || null;
  }

  getQuotesByAuthor(authorSlug: string): QuoteRecord[] {
    const s = authorSlug.toLowerCase().trim();
    return this.quotes.filter((q) => q.author.slug === s);
  }

  getQuotesByMood(moodSlug: string): QuoteRecord[] {
    const m = moodSlug.toLowerCase().trim();
    return this.quotes.filter((q) => q.mood_tags.includes(m));
  }

  getQuotesByOccasion(occasionSlug: string): QuoteRecord[] {
    const o = occasionSlug.toLowerCase().trim();
    return this.quotes.filter((q) => q.occasion_tags.includes(o));
  }

  /**
   * Deterministically resolves Quote of the Day (#QOTD) for any calendar date.
   */
  getQuoteOfTheDay(date: Date = new Date()): QuoteRecord {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const index = Math.abs(dayOfYear) % this.quotes.length;
    return this.quotes[index];
  }

  getRandomQuote(filter?: { mood?: string; occasion?: string; author?: string }): QuoteRecord {
    let pool = this.quotes;
    if (filter?.mood) {
      const mood = filter.mood;
      pool = pool.filter((q) => q.mood_tags.includes(mood));
    }
    if (filter?.occasion) {
      const occasion = filter.occasion;
      pool = pool.filter((q) => q.occasion_tags.includes(occasion));
    }
    if (filter?.author) {
      const author = filter.author;
      pool = pool.filter((q) => q.author.slug === author);
    }

    const targetPool = pool.length > 0 ? pool : this.quotes;
    const randomIndex = Math.floor(Math.random() * targetPool.length);
    return targetPool[randomIndex];
  }

  searchQuotes(query: string, limit = 10): QuoteRecord[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return this.quotes
      .filter(
        (item) =>
          item.quote_text.toLowerCase().includes(q) ||
          item.author.name.toLowerCase().includes(q) ||
          item.work_title?.toLowerCase().includes(q),
      )
      .slice(0, limit);
  }
}
