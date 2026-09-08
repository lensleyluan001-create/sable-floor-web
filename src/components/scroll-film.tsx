import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Chapter } from "@/lib/film";
import { LEAD_URL } from "@/lib/order";
import { SableMark } from "@/components/sable-mark";

const LERP = 0.085;
const CROSS = 0.16;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function layerOpacity(index: number, pos: number, n: number) {
  if (index === n - 1 && pos >= n - 1) return 1;
  if (index === 0 && pos <= 0) return 1;
  const local = pos - index;
  if (local <= -CROSS) return 0;
  if (local >= 1 + CROSS) return 0;
  if (local < 0) return 1 + local / CROSS;
  if (local > 1) return 1 - (local - 1) / CROSS;
  if (local > 1 - CROSS) return 1 - (local - (1 - CROSS)) / CROSS;
  return 1;
}

export function ScrollFilm({
  chapters,
  orderLasts,
  peer,
  helpButton,
  onBack,
  modeToggle,
  scrollPerChapter = 1.55,
}: {
  chapters: Chapter[];
  orderLasts: readonly string[];
  peer: { href: "/" | "/how" | "/lasts"; label: string; current: string };
  helpButton?: { href: "/" | "/how" | "/lasts"; label: string };
  onBack?: () => void;
  modeToggle?: { label: string; onClick: () => void };
  scrollPerChapter?: number;
}) {
  const n = chapters.length;
  const spacerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const chapterRef = useRef(0);
  const reducedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [openOrder, setOpenOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState({ last: "Vellie", size: "8", name: "", phone: "" });
  const current = chapters[chapter] ?? chapters[0];

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setReady(true), 420);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const readTarget = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetRef.current = clamp(window.scrollY / max, 0, 1);
    };

    let raf = 0;
    const tick = () => {
      readTarget();
      const ease = reducedRef.current ? 1 : LERP;
      posRef.current += (targetRef.current - posRef.current) * ease;
      const progress = posRef.current;
      const pos = progress * Math.max(0, n - 1);
      let best = 0;
      let bestOp = -1;

      for (let i = 0; i < n; i++) {
        const op = layerOpacity(i, pos, n);
        if (op > bestOp) {
          bestOp = op;
          best = i;
        }
        const layer = layerRefs.current[i];
        if (layer) {
          layer.style.opacity = String(op);
          layer.style.visibility = op < 0.02 ? "hidden" : "visible";
        }
        const video = videoRefs.current[i];
        if (
          !reducedRef.current &&
          video &&
          op > 0.02 &&
          video.duration &&
          Number.isFinite(video.duration)
        ) {
          const local = clamp(pos - i, 0, 0.999);
          const nextTime = local * (video.duration - 0.05);
          if (Math.abs(video.currentTime - nextTime) > 0.04) {
            try {
              video.currentTime = nextTime;
            } catch {
              /* seek before ready */
            }
          }
        }
        const tickEl = tickRefs.current[i];
        if (tickEl) tickEl.setAttribute("aria-current", i === best ? "true" : "false");
      }

      if (best !== chapterRef.current) {
        chapterRef.current = best;
        setChapter(best);
      }

      if (progressRef.current) progressRef.current.style.transform = `scaleY(${progress})`;
      document.querySelectorAll<HTMLElement>("[data-film-hint]").forEach((el) => {
        const o = clamp(1 - progress * 10, 0, 1);
        el.style.opacity = String(o);
        el.style.visibility = o < 0.05 ? "hidden" : "visible";
      });

      raf = requestAnimationFrame(tick);
    };

    readTarget();
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", readTarget, { passive: true });
    window.addEventListener("resize", readTarget);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readTarget);
      window.removeEventListener("resize", readTarget);
    };
  }, [n, ready]);

  const message = [
    "SABLE.CO order",
    `Pair: ${order.last}`,
    `UK size: ${order.size}`,
    order.name ? `Name: ${order.name}` : "Name:",
    order.phone ? `WhatsApp: ${order.phone}` : "WhatsApp:",
    "Please confirm the pair, then EFT. Most pairs leave 10–14 working days after payment.",
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
    <div className="relative bg-ink text-paper">
      <div
        ref={spacerRef}
        aria-hidden="true"
        style={{ height: `${Math.max(1, n) * scrollPerChapter * 100}vh` }}
      />
      <div className="fixed inset-0 overflow-hidden">
        {chapters.map((ch, i) => (
          <div
            key={ch.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <img src={ch.still} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {ch.video ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                className="absolute inset-0 h-full w-full object-cover"
                src={ch.video}
                poster={ch.still}
                muted
                playsInline
                preload="metadata"
              />
            ) : null}
          </div>
        ))}
        <div className="film-scrim" />
        <div className="film-vignette" />
        <div className="film-grain" />

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
                  className="pointer-events-auto mt-3 inline-flex min-h-11 items-center bg-paper px-4 font-sans text-[11px] font-medium tracking-[0.14em] text-ink uppercase"
                >
                  {peer.label}
                </button>
              ) : helpButton ? (
                <Link
                  to={helpButton.href}
                  className="pointer-events-auto mt-3 inline-flex min-h-11 items-center bg-paper px-4 font-sans text-[11px] font-medium tracking-[0.14em] text-ink uppercase"
                >
                  {helpButton.label}
                </Link>
              ) : (
                <Link
                  to={peer.href}
                  className="pointer-events-auto mt-3 inline-flex min-h-11 items-center bg-paper px-4 font-sans text-[11px] font-medium tracking-[0.14em] text-ink uppercase"
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
              <p className="mt-2 font-sans text-[11px] tracking-[0.16em] text-dust">
                <span className="hidden sm:inline">
                  {String(chapter + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
                <span data-film-hint className="sm:hidden">
                  Scroll
                </span>
              </p>
            </div>
          </div>
          <p className="mt-6 font-sans text-[11px] font-medium tracking-[0.28em] text-dust uppercase">
            {current.last}
          </p>
          <p className="font-display mt-2 max-w-lg text-lg leading-snug font-medium tracking-[-0.02em] text-paper sm:text-xl">
            {current.why}
          </p>
        </header>

        <nav
          aria-label="Chapters"
          className="absolute top-1/2 right-3 z-30 hidden max-h-[70vh] -translate-y-1/2 flex-col justify-center lg:right-6 lg:flex"
        >
          <div className="relative mx-auto mb-3 h-16 w-px bg-line">
            <div
              ref={progressRef}
              className="absolute top-0 left-0 h-full w-px origin-top bg-paper"
              style={{ transform: "scaleY(0)" }}
            />
          </div>
          <ul className="flex flex-col">
            {chapters.map((ch, i) => (
              <li key={ch.id}>
                <button
                  ref={(el) => {
                    tickRefs.current[i] = el;
                  }}
                  type="button"
                  aria-label={ch.last}
                  onClick={() => {
                    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                    window.scrollTo({ top: (i / Math.max(1, n - 1)) * max, behavior: "smooth" });
                  }}
                  className="min-h-8 px-1 text-right font-sans text-[10px] tracking-[0.14em] text-dust uppercase transition-colors duration-150 aria-[current=true]:text-paper"
                >
                  {ch.last.replace(/^The /, "")}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(1.4rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-10 lg:pr-40">
          <div className="max-w-xl">
            <h1 className="font-display text-[2.2rem] leading-[1.05] font-medium tracking-[-0.03em] text-paper sm:text-5xl">
              {current.title}
            </h1>
            <p className="mt-4 max-w-md font-sans text-[15px] leading-relaxed text-paper-2 sm:text-base">
              {current.line}
            </p>
            <p className="mt-5 font-sans text-[11px] tracking-[0.2em] text-dust uppercase">
              {current.meta}
            </p>
            {chapter === n - 1 ? (
              <button
                type="button"
                onClick={() => setOpenOrder(true)}
                className="mt-6 inline-flex min-h-11 items-center bg-paper px-5 font-sans text-[12px] font-medium tracking-[0.18em] text-ink uppercase"
              >
                Send a pair
              </button>
            ) : null}
          </div>
        </div>

        <p
          data-film-hint
          className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 font-sans text-[11px] tracking-[0.28em] text-dust sm:block sm:bottom-8"
        >
          Scroll
        </p>
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

export function OrderSlip({
  order,
  lasts,
  message,
  copied,
  onChange,
  onCopy,
  onClose,
}: {
  order: { last: string; size: string; name: string; phone: string };
  lasts: string[];
  message: string;
  copied: boolean;
  onChange: (next: { last: string; size: string; name: string; phone: string }) => void;
  onCopy: () => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const ready = order.name.trim().length > 1 && order.phone.replace(/\D/g, "").length >= 9;
  const wa = `https://wa.me/27826001950?text=${encodeURIComponent(message)}`;

  const send = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(LEAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: order.name.trim(),
          phone: order.phone.trim(),
          look: order.last,
          size: order.size,
          qty: 1,
          source: "website",
          status: "new",
          nextAction: "Send the first WhatsApp",
          note: `${order.last} UK${order.size}`,
        }),
      });
      if (!res.ok) throw new Error("send");
      setSent(true);
    } catch {
      window.location.href = wa;
      setError("Could not send on the site. Opening WhatsApp to Sable.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center">
        <div role="dialog" aria-labelledby="order-title" className="w-full max-w-md border border-line bg-ink-2 p-6 sm:p-7">
          <p className="font-sans text-[11px] tracking-[0.28em] text-dust uppercase">Sent</p>
          <h2 id="order-title" className="font-display mt-2 text-3xl font-medium text-paper">
            We have the order.
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-paper-2">
            Sable will WhatsApp you on {order.phone} to confirm the pair. You pay after that. Most pairs leave 10–14
            working days after EFT.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center bg-paper px-4 font-sans text-[12px] font-medium tracking-[0.16em] text-ink uppercase"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="order-title"
        className="w-full max-w-md border border-line bg-ink-2 p-6 shadow-[0_24px_80px_rgb(0_0_0/0.45)] sm:p-7"
      >
        <p className="font-sans text-[11px] tracking-[0.28em] text-dust uppercase">SABLE</p>
        <h2 id="order-title" className="font-display mt-2 text-3xl font-medium text-paper">
          Send a pair
        </h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-paper-2">
          We reply on WhatsApp. You pay after we confirm the pair. 10–14 working days after EFT.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="col-span-1 flex flex-col gap-1.5 font-sans text-[11px] tracking-[0.16em] text-dust uppercase">
            Pair
            <select
              value={order.last}
              onChange={(e) => onChange({ ...order, last: e.target.value })}
              className="min-h-11 border border-line bg-ink px-3 font-sans text-sm tracking-normal text-paper normal-case"
            >
              {lasts.map((last) => (
                <option key={last} value={last}>
                  {last}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 font-sans text-[11px] tracking-[0.16em] text-dust uppercase">
            UK size
            <input
              value={order.size}
              onChange={(e) => onChange({ ...order, size: e.target.value })}
              className="min-h-11 border border-line bg-ink px-3 font-sans text-sm tracking-normal text-paper outline-none focus:border-dust"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 font-sans text-[11px] tracking-[0.16em] text-dust uppercase">
            Name
            <input
              value={order.name}
              onChange={(e) => onChange({ ...order, name: e.target.value })}
              autoComplete="name"
              className="min-h-11 border border-line bg-ink px-3 font-sans text-sm tracking-normal text-paper outline-none focus:border-dust"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 font-sans text-[11px] tracking-[0.16em] text-dust uppercase">
            WhatsApp
            <input
              value={order.phone}
              onChange={(e) => onChange({ ...order, phone: e.target.value })}
              inputMode="tel"
              className="min-h-11 border border-line bg-ink px-3 font-sans text-sm tracking-normal text-paper outline-none focus:border-dust"
            />
          </label>
        </div>

        {error ? <p className="mt-3 font-sans text-sm text-hide">{error}</p> : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={!ready || busy}
            onClick={send}
            className="inline-flex min-h-11 flex-1 items-center justify-center bg-paper px-4 font-sans text-[12px] font-medium tracking-[0.16em] text-ink uppercase disabled:opacity-40"
          >
            {busy ? "Sending…" : "Send to Sable"}
          </button>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center border border-line px-4 font-sans text-[12px] font-medium tracking-[0.16em] text-paper uppercase"
          >
            WhatsApp Sable
          </a>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="mt-2 min-h-11 w-full font-sans text-[12px] tracking-[0.16em] text-dust uppercase"
        >
          {copied ? "Copied" : "Copy order"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-1 min-h-11 w-full font-sans text-[12px] tracking-[0.16em] text-dust uppercase"
        >
          Close
        </button>
      </div>
    </div>
  );
}
