/**
 * Database Abstraction Layer (Cloudflare D1 Primary + LibSQL/SQLite DR Fallback)
 */

export interface QueryResult<T = unknown> {
  results: T[];
  success: boolean;
  meta?: {
    duration?: number;
    rowsRead?: number;
    rowsWritten?: number;
  };
}

export interface SQLDatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  first<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;
  exec(sql: string): Promise<void>;
}

/**
 * Creates a client from a native Cloudflare D1 Database binding
 */
export function createD1Client(d1Database: {
  prepare: (sql: string) => {
    bind: (...params: unknown[]) => {
      all: <T>() => Promise<{ results: T[]; success: boolean; meta: unknown }>;
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
  };
  exec: (sql: string) => Promise<unknown>;
}): SQLDatabaseClient {
  return {
    async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
      const stmt = d1Database.prepare(sql).bind(...params);
      const res = await stmt.all<T>();
      return {
        results: res.results || [],
        success: res.success,
        meta: res.meta as QueryResult["meta"],
      };
    },
    async first<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
      const stmt = d1Database.prepare(sql).bind(...params);
      return stmt.first<T>();
    },
    async exec(sql: string): Promise<void> {
      await d1Database.exec(sql);
    },
  };
}

/**
 * Memory / Generic DR SQLite mock client for standalone tests or local failover
 */
export function createMemorySQLiteClient(): SQLDatabaseClient {
  return {
    async query<T = unknown>(_sql: string, _params: unknown[] = []): Promise<QueryResult<T>> {
      return {
        results: [] as T[],
        success: true,
      };
    },
    async first<T = unknown>(_sql: string, _params: unknown[] = []): Promise<T | null> {
      return null;
    },
    async exec(_sql: string): Promise<void> {
      // Execute schema definition in mock mode
    },
  };
}
