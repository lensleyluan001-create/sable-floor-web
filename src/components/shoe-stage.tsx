import { PhotoCarousel } from "@/components/photo-carousel";
import {
  GOLF_TONES,
  HIDE_FILTER,
  HIDES,
  isTwoToneSku,
  pairPhotos,
  pairTitle,
  type Pair,
} from "@/lib/catalog";
import { LASER_PLACE_CLASS, laserPreview, type LaserKind, type LaserPlace } from "@/lib/laser";
import { SOLE_OPTS, hideToneClass, stitchSwatch, type SpecDraft } from "@/lib/custom";

function StitchVeil({ color }: { color: string }) {
  return (
    <svg className="stitch-veil" viewBox="0 0 400 500" aria-hidden="true">
      <path
        className="stitch-path"
        d="M64 396 C 140 434, 260 436, 338 392"
        stroke={color}
        strokeWidth="1.6"
        strokeDasharray="1.8 5.8"
      />
      <path
        className="stitch-path"
        d="M96 252 C 132 238, 162 242, 184 262"
        stroke={color}
        strokeWidth="1.25"
        strokeDasharray="1.4 5.2"
      />
      <path
        className="stitch-path"
        d="M248 254 C 280 240, 312 244, 330 266"
        stroke={color}
        strokeWidth="1.25"
        strokeDasharray="1.4 5.2"
      />
    </svg>
  );
}

export function ShoeStage({
  pair,
  draft,
  compact = false,
  caption,
}: {
  pair: Pair;
  draft: SpecDraft;
  compact?: boolean;
  caption?: string;
}) {
  const twoTone = isTwoToneSku(pair.sku);
  const golfTone = twoTone ? GOLF_TONES.find((t) => t.id === draft.hide) : null;
  const photos = golfTone?.photo
    ? [{ src: golfTone.photo, alt: `${pairTitle(pair)} — ${golfTone.label}`, kind: "pair" as const }]
    : pairPhotos(pair);
  const toneClass = twoTone ? "" : (HIDE_FILTER[draft.hide as (typeof HIDES)[number]] ?? hideToneClass(draft.hide));
  const laserOn = draft.extras.includes("laser");
  const stitchOn = draft.extras.includes("stitch");
  const soleOn = draft.extras.includes("sole");
  const mark = { kind: draft.laserKind as LaserKind, text: draft.laserText, place: draft.laserPlace as LaserPlace };
  const burn = laserPreview(mark);
  const placeClass = LASER_PLACE_CLASS[mark.place];
  const stitch = stitchOn ? stitchSwatch(draft.stitchId) : "";
  const sole = SOLE_OPTS.find((s) => s.id === draft.soleId)?.swatch ?? "#5a3a28";

  return (
    <div>
      <div className="relative overflow-hidden rounded-md bg-bone">
        <PhotoCarousel
          slides={photos}
          toneClass={toneClass}
          overlay={
            <>
              {stitchOn ? <StitchVeil color={stitch} /> : null}
              {laserOn ? (
                <>
                  <span className="laser-scan" aria-hidden="true" />
                  <p
                    key={`${burn}-${draft.laserPlace}-${draft.laserKind}`}
                    className={`laser-burn pointer-events-none absolute ${placeClass}`}
                    aria-hidden="true"
                  >
                    {burn}
                  </p>
                </>
              ) : null}
            </>
          }
          imgClassName={
            compact
              ? "h-[min(36vh,240px)] w-full bg-bone object-contain object-center"
              : "aspect-[4/5] w-full bg-bone object-contain object-center"
          }
        />
        {soleOn ? (
          <span
            className="pointer-events-none absolute inset-x-8 bottom-[7%] z-[2] h-1.5 rounded-full opacity-80"
            style={{ background: sole }}
          />
        ) : null}
      </div>
      {caption && caption !== "As photographed" ? (
        <p className="mt-0 rounded-b-md bg-ink px-3 py-2 font-sans text-[11px] leading-snug tracking-[0.04em] text-paper">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
