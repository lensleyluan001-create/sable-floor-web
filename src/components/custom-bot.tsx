import { useEffect, useRef, useState } from "react";
import { extraPrice, pairBySku, pairTitle, type Pair } from "@/lib/catalog";
import { GOLF_TONES, isTwoToneSku } from "@/lib/catalog";
import {
  CLERK_LASTS,
  applyClerkPatch,
  clerkPair,
  emptyDraft,
  localClerk,
  orderExtrasPayload,
  orderSpecLine,
  pairForLook,
  parseBrief,
  specCaption,
  suggestionsFor,
  type SpecDraft,
} from "@/lib/custom";
import { askSpecClerk } from "@/lib/custom-bot.functions";
import { useOrder } from "@/lib/order";
import { SheetFrame } from "@/components/sheet-frame";
import { ShoeStage } from "@/components/shoe-stage";
import { SpecControls } from "@/components/spec-controls";

type Turn = { role: "clerk" | "you"; text: string };

export function CustomBot({
  pair: lockedPair,
  draft: incoming,
  locked = false,
  onClose,
  onAdded,
}: {
  pair?: Pair;
  draft?: SpecDraft;
  locked?: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const add = useOrder((s) => s.add);
  const start = lockedPair ?? clerkPair();
  const [pair, setPair] = useState<Pair>(start);
  const [draft, setDraft] = useState<SpecDraft>(() => incoming ?? emptyDraft(start.look));
  const [turns, setTurns] = useState<Turn[]>(() => [
    {
      role: "clerk",
      text: locked
        ? "This last. Hide, stitch, laces, sole, laser — as you want them. The photo stays this pair. Example: grey hide, aqua stitch."
        : "Tell us the pair. A last from the book. Then hide, stitch, laces, sole, laser. We do not redraw the shape. Example: grey vellie, aqua stitch.",
    },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [guide, setGuide] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  const hideLabel = isTwoToneSku(pair.sku)
    ? (GOLF_TONES.find((t) => t.id === draft.hide)?.label ?? draft.hide)
    : draft.hide;
  const due = pair.price + extraPrice(draft.extras);
  const caption = specCaption(draft);
  const chips = suggestionsFor(draft, pair, locked);

  const send = async (raw: string) => {
    const value = raw.trim();
    if (!value || busy) return;
    if (turns.filter((t) => t.role === "you").length >= 12) {
      setTurns((cur) => [...cur, { role: "clerk", text: "Write the rest on the spec below. Twelve notes is enough for the bench." }]);
      return;
    }
    setText("");
    setTurns((cur) => [...cur, { role: "you", text: value }]);
    setBusy(true);
    setDraft((d) => {
      const patch = localClerk(value, pair.sku);
      const look = pair.look;
      const merged = applyClerkPatch(d, patch, look);
      return { ...merged, note: d.note ? `${d.note} · ${value}` : value };
    });
    if (!locked) {
      const brief = parseBrief(value);
      if (!brief.refuseDesign && (brief.sku || brief.look)) {
        const next = brief.sku ? pairBySku(brief.sku) : brief.look ? pairForLook(brief.look) : null;
        if (next && next.sku !== pair.sku) {
          setPair(next);
          setDraft((d) => {
            const merged = applyClerkPatch(d, localClerk(value, next.sku), next.look);
            const kidsChanged = next.look.startsWith("Kids") !== pair.look.startsWith("Kids");
            return kidsChanged ? { ...merged, size: emptyDraft(next.look).size } : merged;
          });
        }
      }
    }
    const history = [...turns, { role: "you" as const, text: value }]
      .filter((t) => t.text)
      .slice(-8)
      .map((t) => ({ role: t.role === "you" ? ("user" as const) : ("assistant" as const), content: t.text }));
    try {
      const res = await askSpecClerk({ data: { messages: history, sku: pair.sku } });
      const patch = res.patch;
      if (!locked && patch.sku && patch.sku !== pair.sku && !patch.refuseDesign) {
        const next = pairBySku(patch.sku);
        if (next) {
          setPair(next);
          setDraft((d) => applyClerkPatch(d, patch, next.look));
        }
      } else {
        setDraft((d) => applyClerkPatch(d, patch, pair.look));
      }
      setTurns((cur) => [...cur, { role: "clerk", text: patch.reply }]);
    } catch {
      const local = localClerk(value, pair.sku);
      setTurns((cur) => [...cur, { role: "clerk", text: local.reply }]);
    } finally {
      setBusy(false);
    }
  };

  const addPair = () => {
    add(pair, draft.size, hideLabel, orderExtrasPayload(draft), orderSpecLine(draft));
    onAdded();
  };

  return (
    <SheetFrame
      onClose={onClose}
      labelledBy="clerk-title"
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 400))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(text);
                }
              }}
              rows={2}
              placeholder="Grey hide, aqua stitch, black laces."
              className="min-h-11 w-full resize-none rounded-sm border border-rule bg-paper px-3 py-2.5 font-sans text-sm leading-relaxed text-ink outline-none focus:border-ink"
            />
            <button
              type="button"
              disabled={busy || !text.trim()}
              onClick={() => void send(text)}
              className="inline-flex min-h-11 shrink-0 items-center rounded-md bg-ink px-3.5 font-sans text-[11px] font-semibold tracking-[0.14em] text-bone uppercase disabled:opacity-40"
            >
              Write
            </button>
          </div>
          <button
            type="button"
            onClick={addPair}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 font-sans text-[12px] font-semibold tracking-[0.16em] text-bone uppercase transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            Add {pairTitle(pair)} · R{due}
          </button>
        </div>
      }
    >
      <ShoeStage pair={pair} draft={draft} compact caption={caption} />
      <p className="mt-3 font-sans text-[11px] font-medium tracking-[0.28em] text-muted">Your spec</p>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <h2 id="clerk-title" className="font-display text-[1.85rem] leading-none font-medium tracking-[-0.03em] text-ink">
          {pairTitle(pair)}
        </h2>
        <p className="font-display text-xl tracking-[-0.02em] text-ink">R{due}</p>
      </div>
      <p className="mt-1 font-sans text-[13px] text-muted">No. {pair.sku} · UK {draft.size}</p>

      {!locked ? (
        <div className="mt-4">
          <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">This last</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CLERK_LASTS.map((look) => {
              const hit = pairForLook(look);
              const on = pair.look === hit.look;
              return (
                <button
                  key={look}
                  type="button"
                  onClick={() => {
                    setPair(hit);
                    setDraft((d) => {
                      const kidsChanged = hit.look.startsWith("Kids") !== pair.look.startsWith("Kids");
                      return {
                        ...d,
                        soleId: /golfer/i.test(hit.look) ? "crepe" : /hiking|combat/i.test(hit.look) ? "commando" : d.soleId,
                        size: kidsChanged ? emptyDraft(hit.look).size : d.size,
                      };
                    });
                  }}
                  className={`min-h-11 rounded-full border px-3.5 font-sans text-[12px] ${
                    on ? "border-ink bg-ink text-bone" : "border-rule bg-transparent text-muted"
                  }`}
                >
                  {look.replace(" boot", "")}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div ref={scroller} className="mt-4 max-h-48 space-y-3 overflow-y-auto">
        {turns.map((turn, i) => (
          <p key={`${turn.role}-${i}`} className="font-sans text-[13px] leading-relaxed text-ink">
            <span className="block font-sans text-[10px] tracking-[0.18em] text-muted uppercase">
              {turn.role === "clerk" ? "Sable" : "You"}
            </span>
            {turn.text}
          </p>
        ))}
        {busy ? (
          <p className="clerk-writing font-sans text-[13px] text-muted">Writing the spec…</p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={busy}
            onClick={() => void send(chip)}
            className="min-h-11 rounded-full border border-rule px-3.5 font-sans text-[12px] text-muted"
          >
            {chip}
          </button>
        ))}
      </div>

      <SpecControls pair={pair} draft={draft} onChange={setDraft} guide={guide} onGuide={() => setGuide((v) => !v)} />
    </SheetFrame>
  );
}
