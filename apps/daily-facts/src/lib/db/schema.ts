/**
 * D1 SQLite Relational Schema for Daily Facts
 */

export const FACTS_DDL = `
CREATE TABLE IF NOT EXISTS facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  fact_text TEXT NOT NULL,
  category TEXT NOT NULL,
  subtopic TEXT,
  explanation TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  reading_time_seconds INTEGER NOT NULL DEFAULT 30,
  is_myth INTEGER NOT NULL DEFAULT 0,
  myth_misconception TEXT,
  day_of_year INTEGER NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_facts_slug ON facts(slug);
CREATE INDEX IF NOT EXISTS idx_facts_category ON facts(category);
CREATE INDEX IF NOT EXISTS idx_facts_day ON facts(day_of_year);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fact_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  is_fact INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  FOREIGN KEY (fact_id) REFERENCES facts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_fact_id ON quiz_questions(fact_id);
`;

export interface FactRecord {
  id: number;
  slug: string;
  fact_text: string;
  category: string;
  subtopic?: string;
  explanation: string;
  source_url: string;
  source_name: string;
  reading_time_seconds: number;
  is_myth: boolean;
  myth_misconception?: string;
  day_of_year: number; // 1 - 366
  view_count?: number;
  upvotes?: number;
}

export interface QuizQuestion {
  id: number;
  fact_id: number;
  question_text: string;
  is_fact: boolean;
  explanation: string;
}
