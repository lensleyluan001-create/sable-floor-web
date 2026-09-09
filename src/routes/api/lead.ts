import { createFileRoute } from "@tanstack/react-router";

const CRM = "https://sable-floor.vercel.app/api/lead";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

type Bag = { leads: Record<string, unknown>[] };
const bag: Bag = ((globalThis as { __sableShopLeads?: Bag }).__sableShopLeads ||= { leads: [] });
(globalThis as { __sableShopLeads?: Bag }).__sableShopLeads = bag;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function post({ request }: { request: Request }) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "bad json" }, 400);
  }
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  if (!name || !phone) return json({ ok: false, error: "name and phone required" }, 400);

  const lead = { ...body, name, phone, id: "ld-" + Math.random().toString(36).slice(2, 10), receivedAt: Date.now() };
  bag.leads.unshift(lead);
  if (bag.leads.length > 400) bag.leads.length = 400;

  let floor = false;
  try {
    const res = await fetch(CRM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    floor = res.ok;
  } catch {
    floor = false;
  }

  return json({ ok: true, floor, lead }, 201);
}

export const Route = createFileRoute("/api/lead")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: post,
      GET: async () => json({ ok: true, n: bag.leads.length }),
    },
  },
});
