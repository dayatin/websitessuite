/**
 * D1 SQLite Relational Schema & Migration Definitions
 */

export const DDL_SCHEMA = `
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  title TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  click_count INTEGER NOT NULL DEFAULT 0,
  is_preview_mode INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug);
CREATE INDEX IF NOT EXISTS idx_links_created ON links(created_at);

CREATE TABLE IF NOT EXISTS click_aggregates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  country TEXT,
  referrer TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON click_aggregates(link_id);

CREATE TABLE IF NOT EXISTS bio_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT NOT NULL DEFAULT 'glass-aurora',
  links_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bio_handle ON bio_profiles(handle);
`;

export interface LinkRecord {
  id: number;
  slug: string;
  target_url: string;
  title: string | null;
  created_at: number;
  expires_at: number | null;
  is_active: number;
  click_count: number;
  is_preview_mode: number;
  password_hash: string | null;
}

export interface BioProfileRecord {
  id: number;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  links_json: string;
  created_at: number;
}
