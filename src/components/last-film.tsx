import { useEffect, useRef, useState, type PointerEvent } from "react";
import { displayLook } from "@/lib/catalog";
import { filmSrc, themeForLook } from "@/lib/film";

const HOLD_MS = 8000;

export function LastFilm({ look, count }: { look: string; count: number }) {
  const theme = themeForLook(look);
  const [beat, setBeat] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const reduced = useRef(false);
  const current = theme.beats[beat] ?? theme.beats[0];
  const n = theme.beats.length;
  const name = displayLook(look);
  const fit = current.fit ?? "50% 68%";

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    setBeat(0);
  }, [theme.id]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.32)),
      { threshold: [0, 0.32, 0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView && !reduced.current) v.play().catch(() => {});
    else v.pause();
  }, [inView, beat]);

  useEffect(() => {
    if (!inView || reduced.current || n < 2) return;
    const t = window.setInterval(() => setBeat((b) => (b + 1) % n), HOLD_MS);
    return () => window.clearInterval(t);
  }, [inView, beat, n]);

  const go = (next: number) => setBeat(((next % n) + n) % n);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (n < 2) return;
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) go(beat + 1);
    else go(beat - 1);
  };

  return (
    <article ref={rootRef} className="relative mx-4 overflow-hidden rounded-lg bg-ink text-paper sm:mx-6" aria-label={`${name} film`}>
      <div
        className="relative h-[min(58dvh,420px)] sm:h-[min(54dvh,480px)]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <img
          src={filmSrc(current.still)}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: fit }}
          loading="lazy"
          draggable={false}
        />
        {inView && current.video && !reduced.current ? (
          <video
            key={current.video}
            ref={videoRef}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: fit }}
            src={filmSrc(current.video)}
            poster={filmSrc(current.still)}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : null}
        <div className="film-scrim" />
        <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
          <p className="self-end font-sans text-[11px] tracking-[0.16em] text-dust uppercase">
            {count} {count === 1 ? "pair" : "pairs"}
          </p>
          <div className="max-w-[26rem]">
            <h2 className="font-display text-[1.65rem] leading-[0.98] font-medium tracking-[-0.03em] text-paper sm:text-[1.9rem]">
              {name}
            </h2>
            <p className="mt-2 max-w-[28em] font-sans text-[14px] leading-relaxed text-paper-2">{current.line}</p>
            {n > 1 ? (
              <div className="mt-3 flex items-center">
                {theme.beats.map((item, i) => (
                  <button
                    key={`${item.video}-${i}`}
                    type="button"
                    aria-label={item.title}
                    aria-current={i === beat ? "true" : undefined}
                    onClick={() => go(i)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center"
                  >
                    <span className={`block h-1.5 rounded-full ${i === beat ? "w-5 bg-paper" : "w-1.5 bg-paper/40"}`} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
