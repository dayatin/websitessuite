import type { APIRoute } from "astro";
import { FactCorpusLoader } from "../../lib/corpus/loader.ts";

export const GET: APIRoute = async ({ url }) => {
  const dateParam = url.searchParams.get("date");
  const targetDate = dateParam ? new Date(dateParam) : new Date();

  const loader = new FactCorpusLoader();
  const fact = loader.getFactOfTheDay(targetDate);

  return new Response(
    JSON.stringify({
      success: true,
      date: targetDate.toISOString().split("T")[0],
      fact: {
        id: fact.id,
        slug: fact.slug,
        text: fact.fact_text,
        category: fact.category,
        subtopic: fact.subtopic,
        explanation: fact.explanation,
        source: {
          name: fact.source_name,
          url: fact.source_url,
        },
        isMyth: fact.is_myth,
        readingTimeSeconds: fact.reading_time_seconds,
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
};
