import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Chapter } from "@/lib/film";
import { filmSrc } from "@/lib/film";
import { OrderSlip } from "@/components/scroll-film";
import { SableMark } from "@/components/sable-mark";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function CarouselFilm({
  chapters,
  orderLasts,
  peer,
  helpButton,
  onBack,
  modeToggle,
}: {
  chapters: Chapter[];
  orderLasts: readonly string[];
  peer: { href: "/" | "/how" | "/lasts"; label: string; current: string };
  helpButton?: { href: "/" | "/how" | "/lasts"; label: string };
  onBack?: () => void;
  modeToggle?: { label: string; onClick: () => void };
}) {
  const n = chapters.length;
  const [chapter, setChapter] = useState(0);
  const [ready, setReady] = useState(false);
  const [openOrder, setOpenOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState({ last: "Vellie", size: "8", name: "", phone: "" });
  const startX = useRef(0);
  const dragging = useRef(false);
  const reduced = useRef(false);
  const current = chapters[chapter] ?? chapters[0];

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setReady(true), 420);
    return () => window.clearTimeout(t);
  }, []);

  const go = useCallback(
    (next: number) => {
      setChapter(clamp(next, 0, n - 1));
    },
    [n],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(chapter + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(chapter - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, go]);

  const onPointerDown = (e: PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - startX.current;
    if (dx < -56) go(chapter + 1);
    else if (dx > 56) go(chapter - 1);
  };

  const message = [
    "SABLE.CO order",
    `Pair: ${order.last}`,
    `UK size: ${order.size}`,
    order.name ? `Name: ${order.name}` : "Name:",
    order.phone ? `WhatsApp: ${order.phone}` : "WhatsApp:",
    "Please confirm the pair is on the bench.",
  ].join("\n");

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-ink text-paper">
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        {chapters.map((ch, i) => {
          const on = i === chapter;
          const nearby = Math.abs(i - chapter) <= 1;
          return (
            <div
              key={ch.id}
              className="absolute inset-0"
              style={{
                opacity: on ? 1 : 0,
                visibility: on ? "visible" : "hidden",
                transition: reduced.current ? "none" : "opacity 380ms var(--ease-out-film)",
              }}
              aria-hidden={!on}
            >
              <img
                src={filmSrc(ch.still)}
                alt=""
                draggable={false}
                className={`absolute inset-0 h-full w-full object-cover ${on && !reduced.current ? "carousel-ken" : ""}`}
              />
              {nearby && on && ch.video ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={filmSrc(ch.video)}
                  poster={filmSrc(ch.still)}
                  muted
                  playsInline
                  loop
                  autoPlay={!reduced.current}
                  preload="metadata"
                />
              ) : null}
            </div>
          );
        })}
        <div className="film-scrim" />
        <div className="film-vignette" />
        <div className="film-grain" />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-5 pt-5 sm:px-8 sm:pt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-sans text-[11px] font-medium tracking-[0.32em] text-paper">
              <Link to="/login" className="pointer-events-auto flex min-h-11 items-center gap-2" aria-label="SABLE — log in">
                <SableMark className="h-7 w-7" />
                SABLE
              </Link>
            </p>
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="pointer-events-auto mt-3 inline-flex min-h-11 items-center bg-paper px-4 font-sans text-[11px] font-medium tracking-[0.14em] text-ink uppercase transition-transform duration-150 hover:bg-paper-2 active:scale-[0.96]"
              >
                {peer.label}
              </button>
            ) : helpButton ? (
              <Link
                to={helpButton.href}
                className="pointer-events-auto mt-3 inline-flex min-h-11 items-center bg-paper px-4 font-sans text-[11px] font-medium tracking-[0.14em] text-ink uppercase transition-transform duration-150 hover:bg-paper-2 active:scale-[0.96]"
              >
                {helpButton.label}
              </Link>
            ) : (
              <Link
                to={peer.href}
                className="pointer-events-auto mt-3 inline-flex min-h-11 items-center bg-paper px-4 font-sans text-[11px] font-medium tracking-[0.14em] text-ink uppercase transition-transform duration-150 hover:bg-paper-2 active:scale-[0.96]"
              >
                {peer.label}
              </Link>
            )}
            {modeToggle ? (
              <button
                type="button"
                onClick={modeToggle.onClick}
                className="pointer-events-auto mt-2 block min-h-11 font-sans text-[11px] tracking-[0.16em] text-dust uppercase"
              >
                {modeToggle.label}
              </button>
            ) : null}
          </div>
          <p className="shrink-0 font-sans text-[11px] tracking-[0.16em] text-dust uppercase">
            {String(chapter + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </p>
        </div>
        <p className="mt-6 font-sans text-[11px] font-medium tracking-[0.28em] text-dust uppercase">{current.last}</p>
        <p className="font-display mt-2 max-w-lg text-lg leading-snug font-medium tracking-[-0.02em] text-paper sm:text-xl">
          {current.why}
        </p>
      </header>

      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(1.2rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-8">
        <div className="max-w-xl">
          <h1 className="font-display text-[2.2rem] leading-[1.05] font-medium tracking-[-0.03em] text-paper sm:text-5xl">
            {current.title}
          </h1>
          <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-paper-2 sm:text-base">{current.line}</p>
          <p className="mt-5 font-sans text-[11px] tracking-[0.2em] text-dust uppercase">{current.meta}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Previous slide"
            disabled={chapter === 0}
            onClick={() => go(chapter - 1)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-ink/40 text-paper disabled:opacity-30"
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} />
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                type="button"
                aria-label={ch.last}
                aria-current={i === chapter}
                onClick={() => go(i)}
                className={`h-2 min-h-2 rounded-full transition-[width,background-color] duration-200 ${
                  i === chapter ? "w-6 bg-paper" : "w-2 bg-dust/50"
                }`}
              />
            ))}
          </div>
          {chapter === n - 1 ? (
            <button
              type="button"
              onClick={() => setOpenOrder(true)}
              className="inline-flex min-h-11 items-center bg-paper px-4 font-sans text-[11px] font-medium tracking-[0.14em] text-ink uppercase"
            >
              Send a pair
            </button>
          ) : (
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(chapter + 1)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-ink/40 text-paper"
            >
              <ChevronRight className="size-5" strokeWidth={1.75} />
            </button>
          )}
        </div>
        {chapter === 0 ? (
          <p className="mt-3 text-center font-sans text-[11px] tracking-[0.28em] text-dust uppercase">Swipe</p>
        ) : null}
      </div>

      {!ready ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink">
          <p className="flex items-center gap-3 font-display text-3xl font-medium tracking-[0.22em] text-paper">
            <SableMark className="h-10 w-10" />
            SABLE
          </p>
        </div>
      ) : null}

      {openOrder ? (
        <OrderSlip
          order={order}
          lasts={[...orderLasts]}
          message={message}
          copied={copied}
          onChange={setOrder}
          onCopy={copyOrder}
          onClose={() => setOpenOrder(false)}
        />
      ) : null}
    </div>
  );
}
