import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { displayLook, isTwoToneSku, pairTitle, type Pair } from "@/lib/catalog";

export type PhotoSlide = {
  src: string;
  alt: string;
  kind?: "pair" | "last";
};

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0 });
  const moved = useRef(false);

  const snap = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    if (!kids.length) return;
    const left = kids.reduce((best, node) => {
      const at = node.offsetLeft;
      return Math.abs(at - el.scrollLeft) < Math.abs(best - el.scrollLeft) ? at : best;
    }, kids[0].offsetLeft);
    el.scrollTo({ left, behavior: "smooth" });
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    drag.current = { on: true, x: e.clientX, left: el.scrollLeft };
    moved.current = false;
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.on) return;
    const el = ref.current;
    if (!el) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 40) moved.current = true;
    el.scrollLeft = drag.current.left - dx;
  };

  const onPointerUp = () => {
    if (!drag.current.on) return;
    const el = ref.current;
    const dx = el ? Math.abs((drag.current.left || 0) - el.scrollLeft) : 0;
    if (dx < 40) moved.current = false;
    drag.current.on = false;
    snap();
  };

  return { ref, onPointerDown, onPointerMove, onPointerUp, didMove: () => moved.current };
}

export function PhotoCarousel({
  slides,
  overlay,
  imgClassName,
  className,
  toneClass,
}: {
  slides: PhotoSlide[];
  overlay?: ReactNode;
  imgClassName?: string;
  className?: string;
  toneClass?: string;
}) {
  const drag = useDragScroll();
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const slideKey = slides.map((s) => s.src).join("|");

  const onScroll = () => {
    const el = drag.ref.current;
    if (!el || !el.clientWidth) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.max(0, Math.min(n - 1, next)));
  };

  const go = (next: number) => {
    const el = drag.ref.current;
    if (!el) return;
    const i = Math.max(0, Math.min(n - 1, next));
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    setIndex(0);
    drag.ref.current?.scrollTo({ left: 0 });
  }, [slideKey]);

  if (!n) return null;

  return (
    <div className={`relative min-w-0 overflow-hidden ${className ?? ""}`}>
      <div
        ref={drag.ref}
        className="photo-stage"
        onScroll={onScroll}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={drag.onPointerUp}
      >
        {slides.map((slide) => (
          <div key={`${slide.src}-${slide.alt}`} className="photo-stage-slide relative">
            <img
              src={slide.src}
              alt={slide.alt}
              draggable={false}
              className={`${imgClassName ?? "h-full w-full object-contain"} ${toneClass ?? ""}`}
            />
          </div>
        ))}
      </div>
      {overlay && slides[index]?.kind !== "last" ? (
        <div className="pointer-events-none absolute inset-0 z-[2]">{overlay}</div>
      ) : null}
      {n > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            disabled={index === 0}
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-card/90 text-ink disabled:opacity-30"
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            disabled={index === n - 1}
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-card/90 text-ink disabled:opacity-30"
          >
            <ChevronRight className="size-5" strokeWidth={1.75} />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
            {slides.map((slide, i) => (
              <span
                key={`${slide.src}-dot`}
                className={`h-2 rounded-full ${i === index ? "w-6 bg-ink" : "w-2 bg-ink/30"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function PairStrip({
  pairs,
  onOpen,
  large = false,
}: {
  pairs: Pair[];
  onOpen: (pair: Pair) => void;
  large?: boolean;
}) {
  return (
    <div className="relative min-w-0">
      <div className="snap-row">
        {pairs.map((pair) => (
          <button
            key={pair.sku}
            type="button"
            onClick={() => onOpen(pair)}
            className={`snap-card overflow-hidden rounded-[18px] bg-card text-left shadow-[0_0_0_1px_rgb(28_24_20/0.08),0_12px_28px_rgb(28_24_20/0.07)] transition-transform duration-150 ease-out active:scale-[0.98] ${
              large ? "snap-card-lg" : ""
            }`}
          >
            <img
              src={pair.card}
              alt={`${displayLook(pair.look)}`}
              draggable={false}
              className="aspect-[4/5] w-full bg-bone object-contain object-center"
              loading={pair.fromBook ? "eager" : "lazy"}
            />
            <div className="px-3.5 pt-3 pb-3.5">
              <p className="font-display m-0 text-lg tracking-[-0.02em] text-ink">
                {pairTitle(pair)}
                {isTwoToneSku(pair.sku) ? (
                  <span className="ml-2 align-middle font-sans text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
                    Two-tone
                  </span>
                ) : null}
              </p>
              <p className="font-display mt-2 text-right text-base tracking-[-0.02em] text-ink">R{pair.price}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
