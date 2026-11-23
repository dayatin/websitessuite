import type { FactRecord, QuizQuestion } from "../db/schema.ts";
import { CATEGORIES, SEED_FACTS } from "./seed-data.ts";

export class FactCorpusLoader {
  private facts: FactRecord[];

  constructor(customFacts?: FactRecord[]) {
    this.facts = customFacts || SEED_FACTS;
  }

  getAllCategories() {
    return CATEGORIES;
  }

  getFactById(id: number): FactRecord | null {
    return this.facts.find((f) => f.id === id) || null;
  }

  getFactBySlug(slug: string): FactRecord | null {
    return this.facts.find((f) => f.slug === slug.toLowerCase().trim()) || null;
  }

  getFactsByCategory(category: string, limit = 20, offset = 0): FactRecord[] {
    const filtered = this.facts.filter((f) => f.category === category.toLowerCase().trim());
    return filtered.slice(offset, offset + limit);
  }

  /**
   * Deterministically returns the Fact of the Day for any given Date.
   */
  getFactOfTheDay(date: Date = new Date()): FactRecord {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Seeded modulo across available facts
    const index = Math.abs(dayOfYear) % this.facts.length;
    return this.facts[index];
  }

  getRandomFact(category?: string): FactRecord {
    const pool = category ? this.facts.filter((f) => f.category === category) : this.facts;
    const targetPool = pool.length > 0 ? pool : this.facts;
    const randomIndex = Math.floor(Math.random() * targetPool.length);
    return targetPool[randomIndex];
  }

  searchFacts(query: string, limit = 10): FactRecord[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return this.facts
      .filter(
        (f) =>
          f.fact_text.toLowerCase().includes(q) ||
          f.explanation.toLowerCase().includes(q) ||
          f.category.includes(q),
      )
      .slice(0, limit);
  }

  getDailyQuiz(date: Date = new Date(), count = 5): QuizQuestion[] {
    // Generate 5 deterministically selected quiz questions for the date
    const seed = date.getFullYear() * 1000 + (date.getMonth() + 1) * 100 + date.getDate();
    const shuffled = [...this.facts].sort((a, b) => {
      const hashA = (a.id * 9301 + seed) % 49297;
      const hashB = (b.id * 9301 + seed) % 49297;
      return hashA - hashB;
    });

    return shuffled.slice(0, count).map((fact, idx) => ({
      id: idx + 1,
      fact_id: fact.id,
      question_text:
        fact.is_myth && fact.myth_misconception ? fact.myth_misconception : fact.fact_text,
      is_fact: !fact.is_myth,
      explanation: fact.explanation,
    }));
  }
}
