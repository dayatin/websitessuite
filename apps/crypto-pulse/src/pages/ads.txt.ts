import { generateAdsTxt } from "@suite/monetization";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(generateAdsTxt([]), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
