import { PhotoCarousel } from "@/components/photo-carousel";
import { GOLF_TONES, isTwoToneSku, pairPhotos, pairTitle, type Pair } from "@/lib/catalog";
import { LASER_PLACE_CLASS, laserPreview, type LaserKind, type LaserPlace } from "@/lib/laser";
import type { SpecDraft } from "@/lib/custom";

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
  const laserOn = draft.extras.includes("laser");
  const mark = { kind: draft.laserKind as LaserKind, text: draft.laserText, place: draft.laserPlace as LaserPlace };
  const burn = laserPreview(mark);
  const placeClass = LASER_PLACE_CLASS[mark.place];

  return (
    <div>
      <div className="relative overflow-hidden rounded-md bg-bone">
        <PhotoCarousel
          slides={photos}
          overlay={
            laserOn ? (
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
            ) : null
          }
          imgClassName={
            compact
              ? "h-[min(36vh,240px)] w-full bg-bone object-contain object-center"
              : "aspect-[4/5] w-full bg-bone object-contain object-center"
          }
        />
      </div>
      {caption ? (
        <p className="mt-0 rounded-b-md bg-ink px-3 py-2 font-sans text-[11px] leading-snug tracking-[0.04em] text-paper">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
