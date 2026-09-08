import { createServerFn } from "@tanstack/react-start";
import { localClerk, type ClerkPatch } from "@/lib/custom";

export type ClerkTurn = { role: "user" | "assistant"; content: string };

type ClerkInput = {
  messages: ClerkTurn[];
  sku?: string;
};

function asTurns(raw: unknown): ClerkTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ClerkTurn[] = [];
  for (const item of raw.slice(-10)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      const text = content.trim().slice(0, 400);
      if (text) out.push({ role, content: text });
    }
  }
  return out;
}

const SYSTEM = `You are the spec clerk at SABLE, a shoe factory in South Africa.
You write a spec on an existing last from the book. You never redesign, never invent a last, never change the shape, never generate a new shoe.
You MAY change any extra the customer asks: hide colour, stitch colour, lace colour, elastic colour, sole, lining, hardware (eyelets/zip pull), laser (initials/name/logo on heel/quarter/vamp), UK size.
You MAY take extras off when asked (no laser, without laces).
You may pick a last from this list only:
Vellie 45001, Golfer 45004, Chelsea 45015, Derby 45013, Loafer 45043, Sandal 45027, Hiking boot 45011, Combat boot 45065, Zip boot 45032, Wool-lined boot 45008, Kids vellie 45078.
Hides: As photographed, Tan, Brown, Dark brown, Black, Olive, Grey, Navy, White, Cream, Wine.
Stitch and elastic: Cream, Tan, Brown, Black, Olive, White, Aqua, Navy.
Laces: Rawhide, Tan, Brown, Black, Olive, White, Aqua, Navy.
Sole: Leather, Crepe, Rubber, Commando.
Lining: Leather, Wool.
Hardware: Brass, Black, Nickel.
Voice: short. Factory floor. No emoji. No marketing.
Reply JSON only:
{"reply":"...","sku":"45001"|null,"hide":"Grey"|null,"stitch":"aqua"|null,"laces":"black"|null,"elastic":"aqua"|null,"sole":"crepe"|null,"lining":"wool"|null,"hardware":"brass"|null,"laser":{"kind":"Initials","text":"ML","place":"Heel"}|null,"size":"8"|null,"clear":["laser"]|null}
Use ids: stitch/laces/elastic lowercase colour ids (rawhide laces = "natural"). sole leather|crepe|rubber|commando. lining leather|wool. hardware brass|black|nickel.
Null means unchanged. clear is extras to take off.
reply is 1-3 short sentences. Confirm what you wrote. The last stays. Ask only for what is missing (size, or which last if unclear).
If they ask you to invent a new design: {"reply":"We keep this last. Hide, stitch, laces, sole, laser — that is the spec. We do not redraw the shape.","refuseDesign":true}
Example: "gray shoe with aqua stitching" → hide Grey, stitch aqua, default vellie 45001 if no last named.`;

function parsePatch(raw: string, fallback: ClerkPatch): ClerkPatch {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return fallback;
  try {
    const json = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    const laserRaw = json.laser;
    let laser: ClerkPatch["laser"] = null;
    if (laserRaw && typeof laserRaw === "object") {
      const o = laserRaw as Record<string, unknown>;
      const kind = o.kind === "Name" || o.kind === "Logo" || o.kind === "Initials" ? o.kind : "Initials";
      const place = o.place === "Quarter" || o.place === "Vamp" || o.place === "Heel" ? o.place : "Heel";
      laser = { kind, text: typeof o.text === "string" ? o.text.slice(0, 16) : "", place };
    }
    const clear = Array.isArray(json.clear)
      ? json.clear.filter(
          (id): id is NonNullable<ClerkPatch["clear"]>[number] =>
            id === "laces" ||
            id === "stitch" ||
            id === "elastic" ||
            id === "sole" ||
            id === "lining" ||
            id === "hardware" ||
            id === "laser",
        )
      : fallback.clear;
    return {
      reply: str(json.reply) || fallback.reply,
      sku: str(json.sku),
      hide: str(json.hide),
      stitch: str(json.stitch),
      laces: str(json.laces),
      elastic: str(json.elastic),
      sole: str(json.sole),
      lining: str(json.lining),
      hardware: str(json.hardware),
      laser,
      size: str(json.size),
      refuseDesign: json.refuseDesign === true,
      clear,
    };
  } catch {
    return fallback;
  }
}

export const askSpecClerk = createServerFn({ method: "POST" })
  .validator((input: unknown): ClerkInput => {
    const obj = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
    return {
      messages: asTurns(obj.messages),
      sku: typeof obj.sku === "string" ? obj.sku.slice(0, 8) : undefined,
    };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; patch: ClerkPatch; source: "grok" | "local" }> => {
    const lastUser = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const fallback = localClerk(lastUser, data.sku);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || !lastUser) return { ok: true, patch: fallback, source: "local" };

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.2,
          max_tokens: 280,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            ...data.messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return { ok: true, patch: fallback, source: "local" };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content ?? "";
      return { ok: true, patch: parsePatch(text, fallback), source: "grok" };
    } catch {
      return { ok: true, patch: fallback, source: "local" };
    }
  });
