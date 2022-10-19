// deno-lint-ignore-file no-explicit-any
import { Handler, serve } from "https://deno.land/std@0.160.0/http/mod.ts";

async function fetchData(
  count: number,
  map = new Map<string, any>()
): Promise<Map<string, any>> {
  const responses = await Promise.all(
    Array.from({ length: count }).map((_) =>
      fetch("https://api.chucknorris.io/jokes/random").then(
        async (res) => await res.json()
      )
    )
  );
  for (const obj of responses) {
    map.set(obj.id, obj);
  }
  if (map.size != count) {
    return await fetchData(count - map.size, map);
  }
  return map;
}

const handler: Handler = async (req) => {
  const count = +(new URL(req.url).searchParams.get("count") || 25);
  const res = [...(await fetchData(count)).entries()].map(([_k, v]) => v);
  return new Response(JSON.stringify(res, null, "  "), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
};

await serve(handler);
