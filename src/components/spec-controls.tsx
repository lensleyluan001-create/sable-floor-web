import {
  GOLF_TONES,
  HIDE_SWATCH,
  HIDES,
  extrasFor,
  isTwoToneSku,
  sizeLabel,
  sizesFor,
  type ExtraId,
  type Pair,
} from "@/lib/catalog";
import { LASER_KINDS, LASER_PLACES, type LaserKind, type LaserPlace } from "@/lib/laser";
import {
  ELASTIC_COLS,
  HARDWARE_OPTS,
  LACE_COLS,
  LINING_OPTS,
  MORE_HIDES,
  SOLE_OPTS,
  STITCH_COLS,
  type SpecDraft,
} from "@/lib/custom";
import { Field } from "@/components/sheet-frame";

const chip = (on: boolean) =>
  `inline-flex min-h-11 items-center gap-2 rounded-full border px-3 font-sans text-[12px] ${
    on ? "border-ink bg-ink text-bone" : "border-rule bg-transparent text-muted"
  }`;

function Dot({ color }: { color: string }) {
  return <span className="size-3.5 rounded-full border border-rule" style={{ background: color }} />;
}

export function SpecControls({
  pair,
  draft,
  onChange,
  guide,
  onGuide,
}: {
  pair: Pair;
  draft: SpecDraft;
  onChange: (next: SpecDraft) => void;
  guide?: boolean;
  onGuide?: () => void;
}) {
  const twoTone = isTwoToneSku(pair.sku);
  const available = extrasFor(pair.look);
  const set = (patch: Partial<SpecDraft>) => onChange({ ...draft, ...patch });
  const toggle = (id: ExtraId) => {
    const extras = draft.extras.includes(id) ? draft.extras.filter((x) => x !== id) : [...draft.extras, id];
    onChange({ ...draft, extras });
  };
  const on = (id: ExtraId) => draft.extras.includes(id);

  return (
    <>
      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">Size</p>
          {onGuide ? (
            <button type="button" onClick={onGuide} className="font-sans text-[11px] tracking-[0.12em] text-muted uppercase">
              {guide ? "Hide chart" : "UK / EU chart"}
            </button>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizesFor(pair.look).map((s) => (
            <button key={s} type="button" onClick={() => set({ size: s })} className={chip(draft.size === s)}>
              {sizeLabel(pair.look, s)}
            </button>
          ))}
        </div>
        {guide ? (
          <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted">
            Sizes are UK. EU is next to each one. If you sit between, take the larger. Unsure? Put it in the note — we will
            check.
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">{twoTone ? "Two-tone" : "Hide"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(twoTone
            ? GOLF_TONES
            : HIDES.map((h) => ({ id: h, label: h, a: HIDE_SWATCH[h], b: HIDE_SWATCH[h] }))
          ).map((tone) => (
            <button key={tone.id} type="button" onClick={() => set({ hide: tone.id })} className={chip(draft.hide === tone.id)}>
              <span className="relative size-3.5 overflow-hidden rounded-full border border-rule">
                <i className="absolute inset-y-0 left-0 w-1/2" style={{ background: tone.a }} />
                <i className="absolute inset-y-0 right-0 w-1/2" style={{ background: tone.b }} />
              </span>
              {tone.label}
            </button>
          ))}
        </div>
        {!twoTone ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {MORE_HIDES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => set({ hide: tone.label })}
                className={chip(draft.hide === tone.label)}
              >
                <Dot color={tone.swatch} />
                {tone.label}
              </button>
            ))}
          </div>
        ) : null}
        {twoTone && draft.hide !== "As photographed" ? (
          <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted">
            The picture is the pair in that colour — saddle and vamp, not a straight split.
          </p>
        ) : !twoTone && draft.hide !== "As photographed" ? (
          <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted">
            Preview only — the photo is tinted so you can see the idea. Final hide depends on what the tannery sends.
          </p>
        ) : null}
      </div>

      <p className="mt-4 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">Extras · R50 each</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {available.map((item) => (
          <button key={item.id} type="button" onClick={() => toggle(item.id)} className={chip(on(item.id))}>
            {item.label} · R{item.price}
          </button>
        ))}
      </div>

      {on("laces") ? (
        <SwatchRow
          label="Lace colour"
          options={LACE_COLS}
          value={draft.laceId}
          onPick={(id) => set({ laceId: id })}
        />
      ) : null}
      {on("stitch") ? (
        <SwatchRow
          label="Stitch colour"
          options={STITCH_COLS}
          value={draft.stitchId}
          onPick={(id) => set({ stitchId: id })}
        />
      ) : null}
      {on("elastic") ? (
        <SwatchRow
          label="Elastic colour"
          options={ELASTIC_COLS}
          value={draft.elasticId}
          onPick={(id) => set({ elasticId: id })}
        />
      ) : null}
      {on("sole") ? (
        <SwatchRow label="Sole" options={SOLE_OPTS} value={draft.soleId} onPick={(id) => set({ soleId: id })} />
      ) : null}
      {on("lining") ? (
        <SwatchRow
          label="Lining"
          options={LINING_OPTS}
          value={draft.liningId}
          onPick={(id) => set({ liningId: id })}
        />
      ) : null}
      {on("hardware") ? (
        <SwatchRow
          label="Hardware"
          options={HARDWARE_OPTS}
          value={draft.hardwareId}
          onPick={(id) => set({ hardwareId: id })}
        />
      ) : null}

      {on("laser") ? (
        <div className="mt-4 rounded-md border border-rule bg-bone px-3.5 py-3.5">
          <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">Laser · R50 · outside only</p>
          <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-muted">
            Heel, quarter or vamp. Initials and a name are R50. A logo we confirm before we burn.
          </p>
          <p className="mt-3 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">The mark</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LASER_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => set({ laserKind: kind as LaserKind })}
                className={chip(draft.laserKind === kind)}
              >
                {kind}
              </button>
            ))}
          </div>
          {draft.laserKind !== "Logo" ? (
            <Field label={draft.laserKind === "Initials" ? "Initials" : "Name"}>
              <input
                value={draft.laserText}
                onChange={(e) =>
                  set({ laserText: e.target.value.slice(0, draft.laserKind === "Initials" ? 4 : 16) })
                }
                placeholder={draft.laserKind === "Initials" ? "LL" : "As you say it"}
                className="mt-2 min-h-11 w-full rounded-sm border border-rule bg-paper px-3 font-sans text-sm text-ink outline-none focus:border-ink"
              />
            </Field>
          ) : (
            <p className="mt-3 font-sans text-[13px] leading-relaxed text-muted">
              Send the logo on WhatsApp after the order. Vector if you have it.
            </p>
          )}
          <p className="mt-3 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">On the outside</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LASER_PLACES.map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => set({ laserPlace: place as LaserPlace })}
                className={chip(draft.laserPlace === place)}
              >
                {place}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function SwatchRow({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: { id: string; label: string; swatch: string }[];
  value: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="mt-4">
      <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((col) => (
          <button key={col.id} type="button" onClick={() => onPick(col.id)} className={chip(value === col.id)}>
            <Dot color={col.swatch} />
            {col.label}
          </button>
        ))}
      </div>
    </div>
  );
}
