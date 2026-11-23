import { FactCorpusLoader } from "./corpus/loader.ts";

export interface ScheduledEnv {
  CACHE?: {
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  };
}

/**
 * Cloudflare Cron Trigger Worker Handler (`0 0 * * *`)
 * Runs every day at 00:00 UTC to deterministically advance and cache the Fact of the Day.
 */
export async function handleScheduledDailyRotation(
  env?: ScheduledEnv,
  testDate?: Date,
): Promise<{
  success: boolean;
  dateKey: string;
  factId: number;
  factSlug: string;
}> {
  const targetDate = testDate || new Date();
  const dateKey = targetDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const loader = new FactCorpusLoader();
  const dailyFact = loader.getFactOfTheDay(targetDate);

  if (env?.CACHE) {
    // Cache for 48 hours to ensure resilient edge availability
    await env.CACHE.put("fact:today", JSON.stringify(dailyFact), { expirationTtl: 172800 });
    await env.CACHE.put(`fact:${dateKey}`, JSON.stringify(dailyFact), { expirationTtl: 172800 });
  }

  return {
    success: true,
    dateKey,
    factId: dailyFact.id,
    factSlug: dailyFact.slug,
  };
}
