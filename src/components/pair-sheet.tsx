import { useEffect, useState } from "react";
import { extraPrice, GOLF_TONES, isTwoToneSku, pairTitle, type Pair } from "@/lib/catalog";
import {
  applyClerkPatch,
  emptyDraft,
  localClerk,
  orderExtrasPayload,
  orderSpecLine,
  parseBrief,
  specCaption,
  type SpecDraft,
} from "@/lib/custom";
import {
  DELIVERY,
  orderMessage,
  orderTotal,
  submitOrder,
  useOrder,
  type OrderLine,
} from "@/lib/order";
import { Field, SheetFrame } from "@/components/sheet-frame";
import { ShoeStage } from "@/components/shoe-stage";
import { SpecControls } from "@/components/spec-controls";

export function PairSheet({
  pair,
  onClose,
  onAdded,
  onTalk,
}: {
  pair: Pair;
  onClose: () => void;
  onAdded: () => void;
  onTalk?: (draft: SpecDraft) => void;
}) {
  const add = useOrder((s) => s.add);
  const [draft, setDraft] = useState<SpecDraft>(() => emptyDraft(pair.look));
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    setDraft(emptyDraft(pair.look));
    setGuide(false);
  }, [pair.sku, pair.look]);

  const twoTone = isTwoToneSku(pair.sku);
  const hideLabel = twoTone ? (GOLF_TONES.find((t) => t.id === draft.hide)?.label ?? draft.hide) : draft.hide;
  const due = pair.price + extraPrice(draft.extras);
  const brief = parseBrief(draft.note);

  const applySpec = (value: string) => {
    setDraft((d) => {
      const merged = applyClerkPatch(d, localClerk(value, pair.sku), pair.look);
      return { ...merged, note: value };
    });
  };

  return (
    <SheetFrame onClose={onClose} labelledBy="pair-title">
      <ShoeStage pair={pair} draft={draft} caption={specCaption(draft)} />
      {pair.views.length > 1 ? (
        <p className="mt-2 text-center font-sans text-[11px] tracking-[0.2em] text-muted uppercase">
          {pair.views.length} photos · swipe
        </p>
      ) : null}
      <p className="mt-4 font-sans text-[11px] font-medium tracking-[0.28em] text-muted">No. {pair.sku}</p>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <h2 id="pair-title" className="font-display text-[1.85rem] leading-none font-medium tracking-[-0.03em] text-ink">
          {pairTitle(pair)}
        </h2>
        <p className="font-display text-xl tracking-[-0.02em] text-ink">R{due}</p>
      </div>
      {due !== pair.price ? (
        <p className="mt-1 font-sans text-[13px] text-muted">
          Pair R{pair.price} · extras R{due - pair.price}
        </p>
      ) : (
        <p className="mt-1 font-sans text-sm text-muted">
          {twoTone ? "Two-tone. Body and vamp — pick a colour." : "As photographed. Other hides are a preview."}
        </p>
      )}

      <SpecControls pair={pair} draft={draft} onChange={setDraft} guide={guide} onGuide={() => setGuide((v) => !v)} />

      <div className="mt-5 rounded-md border border-rule bg-bone px-3.5 py-3.5">
        <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">Your spec</p>
        <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-muted">
          This last. Hide, stitch, laces, sole, laser — as you want them. The photo stays this pair.
        </p>
        <textarea
          value={draft.note}
          onChange={(e) => applySpec(e.target.value)}
          rows={3}
          placeholder="Grey hide, aqua stitch, black laces."
          className="mt-3 min-h-20 w-full resize-none rounded-sm border border-rule bg-paper px-3 py-2.5 font-sans text-sm leading-relaxed text-ink outline-none focus:border-ink"
        />
        <p className="mt-2 font-sans text-[13px] leading-relaxed text-ink">
          {draft.note.trim() ? brief.spoken : "Example: grey hide, aqua stitch. We write it on the order and confirm."}
        </p>
        {onTalk ? (
          <button
            type="button"
            onClick={() => onTalk(draft)}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-ink px-4 font-sans text-[12px] tracking-[0.14em] text-ink uppercase"
          >
            Talk it through
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => {
          add(pair, draft.size, hideLabel, orderExtrasPayload(draft), orderSpecLine(draft));
          onAdded();
        }}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 font-sans text-[12px] font-semibold tracking-[0.16em] text-bone uppercase transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        Add {pairTitle(pair)} · R{due}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 min-h-11 w-full font-sans text-[12px] tracking-[0.16em] text-muted uppercase"
      >
        Keep looking
      </button>
    </SheetFrame>
  );
}

export function ReviewSheet({ onClose }: { onClose: () => void }) {
  const lines = useOrder((s) => s.lines);
  const name = useOrder((s) => s.name);
  const phone = useOrder((s) => s.phone);
  const delivery = useOrder((s) => s.delivery);
  const setName = useOrder((s) => s.setName);
  const setPhone = useOrder((s) => s.setPhone);
  const setDelivery = useOrder((s) => s.setDelivery);
  const remove = useOrder((s) => s.remove);
  const clear = useOrder((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const message = orderMessage(lines, name, phone, delivery);
  const ready = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 9 && lines.length > 0;

  const send = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      await submitOrder({ lines, name, phone, delivery });
      setSent(true);
      clear();
    } catch {
      const wa = `https://wa.me/27826001950?text=${encodeURIComponent(message)}`;
      window.location.href = wa;
      setError("Could not send on the site. Opening WhatsApp to Sable.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <SheetFrame onClose={onClose} labelledBy="review-title">
        <p className="font-sans text-[11px] font-medium tracking-[0.28em] text-muted">Sent</p>
        <h2 id="review-title" className="font-display mt-1 text-[1.85rem] leading-none font-medium tracking-[-0.03em] text-ink">
          We have the order.
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
          Sable will WhatsApp you on {phone} to confirm the pair, then the listed rand. Most pairs leave 10–14 working
          days after you pay.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 font-sans text-[12px] font-semibold tracking-[0.16em] text-bone uppercase"
        >
          Back to the shoes
        </button>
      </SheetFrame>
    );
  }

  return (
    <SheetFrame onClose={onClose} labelledBy="review-title">
      <p className="font-sans text-[11px] font-medium tracking-[0.28em] text-muted">Your order</p>
      <h2 id="review-title" className="font-display mt-1 text-[1.85rem] leading-none font-medium tracking-[-0.03em] text-ink">
        Send to Sable
      </h2>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
        We reply on WhatsApp. You pay after we confirm the pair. 10–14 working days after EFT.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {lines.length === 0 ? (
          <li className="font-sans text-sm text-muted">No pairs yet. Open one and add it.</li>
        ) : (
          lines.map((line) => <ReviewLine key={line.id} line={line} onRemove={() => remove(line.id)} />)
        )}
      </ul>

      <div className="mt-4">
        <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">Collect or send</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DELIVERY.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDelivery(d.id)}
              className={`min-h-11 rounded-full border px-3.5 font-sans text-[12px] ${
                delivery === d.id ? "border-ink bg-ink text-bone" : "border-rule bg-transparent text-muted"
              }`}
            >
              {d.label}
              {d.fee ? ` · R${d.fee}` : " · free"}
            </button>
          ))}
        </div>
      </div>

      {lines.length > 0 ? (
        <p className="font-display mt-3 text-right text-lg tracking-[-0.02em] text-ink">
          R{orderTotal(lines, delivery)}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        <Field label="Your name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="min-h-11 w-full rounded-sm border border-rule bg-paper px-3 font-sans text-sm text-ink outline-none focus:border-ink"
          />
        </Field>
        <Field label="WhatsApp number">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="08 or 27"
            className="min-h-11 w-full rounded-sm border border-rule bg-paper px-3 font-sans text-sm text-ink outline-none focus:border-ink"
          />
        </Field>
      </div>

      {error ? <p className="mt-3 font-sans text-sm text-hide">{error}</p> : null}

      <button
        type="button"
        disabled={!ready || busy}
        onClick={send}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 font-sans text-[12px] font-semibold tracking-[0.16em] text-bone uppercase disabled:opacity-40"
      >
        {busy ? "Sending…" : "Send to Sable"}
      </button>
      <p className="mt-2 text-center font-sans text-[12px] text-muted">
        Goes to the floor. We WhatsApp you — not a blank chat.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 min-h-11 w-full font-sans text-[12px] tracking-[0.16em] text-muted uppercase"
      >
        Add another pair
      </button>
    </SheetFrame>
  );
}

function ReviewLine({ line, onRemove }: { line: OrderLine; onRemove: () => void }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-md bg-bone px-3 py-3">
      <div>
        <p className="font-display text-lg tracking-[-0.02em] text-ink">{line.title}</p>
        <p className="font-sans text-[13px] text-muted">
          No. {line.sku} · UK {line.size} · {line.hide}
          {line.spec ? ` · ${line.spec}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className="font-display text-base text-ink">R{line.price}</p>
        <button type="button" onClick={onRemove} className="mt-1 font-sans text-[11px] tracking-[0.12em] text-muted uppercase">
          Remove
        </button>
      </div>
    </li>
  );
}
