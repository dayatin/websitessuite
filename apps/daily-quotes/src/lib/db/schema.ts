/**
 * D1 SQLite Relational Schema for Daily Quotes
 */

export const QUOTES_DDL = `
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  born_year TEXT,
  died_year TEXT,
  nationality TEXT,
  profession TEXT NOT NULL,
  wikipedia_url TEXT,
  avatar_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  quote_text TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  work_title TEXT,
  work_year TEXT,
  historical_era TEXT NOT NULL,
  mood_tags TEXT NOT NULL DEFAULT '[]',
  occasion_tags TEXT NOT NULL DEFAULT '[]',
  character_count INTEGER NOT NULL,
  day_of_year INTEGER NOT NULL,
  share_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quotes_slug ON quotes(slug);
CREATE INDEX IF NOT EXISTS idx_quotes_author ON quotes(author_id);
CREATE INDEX IF NOT EXISTS idx_quotes_day ON quotes(day_of_year);
`;

export interface AuthorRecord {
  id: number;
  slug: string;
  name: string;
  bio: string;
  born_year?: string;
  died_year?: string;
  nationality?: string;
  profession: string;
  wikipedia_url?: string;
  avatar_url?: string;
}

export interface QuoteRecord {
  id: number;
  slug: string;
  quote_text: string;
  author: AuthorRecord;
  work_title?: string;
  work_year?: string;
  historical_era: "ancient-classical" | "renaissance" | "enlightenment" | "19th-century" | "modern";
  mood_tags: string[];
  occasion_tags: string[];
  character_count: number;
  language?: string;
  day_of_year: number; // 1 - 366
  share_count?: number;
  favorite_count?: number;
}
