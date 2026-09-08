import { useEffect, useMemo, useState } from "react";
import { FEATURED, PAIRS, SHOP_FILTERS, displayLook, type Pair } from "@/lib/catalog";
import { orderTotal, useOrder } from "@/lib/order";
import type { SpecDraft } from "@/lib/custom";
import { PairSheet, ReviewSheet } from "@/components/pair-sheet";
import { CustomBot } from "@/components/custom-bot";
import { PairStrip } from "@/components/photo-carousel";
import { ProcessFilm } from "@/components/process-film";
import { LastFilm } from "@/components/last-film";
import { SableLockup } from "@/components/sable-lockup";
import { ORDER_LASTS, filmSrc, themeForLook } from "@/lib/film";
import { PROCESS_CHAPTERS } from "@/lib/process";

export function Collection() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<Pair | null>(null);
  const [review, setReview] = useState(false);
  const [help, setHelp] = useState(false);
  const [clerk, setClerk] = useState<{ pair?: Pair; draft?: SpecDraft; locked: boolean } | null>(null);
  const lines = useOrder((s) => s.lines);
  const delivery = useOrder((s) => s.delivery);

  const groups = useMemo(() => {
    const shop = SHOP_FILTERS.find((f) => f.id === filter);
    const rows = !shop || !shop.looks ? PAIRS : PAIRS.filter((p) => shop.looks!.includes(p.look));
    const map = new Map<string, typeof PAIRS>();
    for (const pair of rows) {
      const list = map.get(pair.look) ?? [];
      list.push(pair);
      map.set(pair.look, list);
    }
    return Array.from(map.entries());
  }, [filter]);

  useEffect(() => {
    if (!help) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelp(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [help]);

  if (help) {
    return (
      <ProcessFilm
        chapters={PROCESS_CHAPTERS}
        orderLasts={ORDER_LASTS}
        peer={{ href: "/", label: "Back to the shoes", current: "How an order works" }}
        onBack={() => setHelp(false)}
      />
    );
  }

  return (
    <div className="collection min-h-dvh bg-bone font-body text-ink">
      <a
        href="#grid"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to pairs
      </a>

      <header className="relative isolate min-h-[min(88dvh,760px)] overflow-hidden bg-ink text-paper">
        <img
          src={filmSrc("/film/vellie.jpg")}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[52%_42%]"
        />
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[52%_42%]"
          src={filmSrc("/film/vellie.mp4")}
          poster={filmSrc("/film/vellie.jpg")}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="film-scrim" />
        <div className="relative z-10 mx-auto flex min-h-[min(88dvh,760px)] max-w-[1080px] flex-col justify-between px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8 sm:px-6 sm:pb-10">
          <div className="flex items-center justify-between gap-3">
            <SableLockup tone="paper" />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setClerk({ locked: false })}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/25 bg-ink/35 px-3.5 font-sans text-[11px] font-medium tracking-[0.14em] text-paper uppercase backdrop-blur-sm"
              >
                Your spec
              </button>
              <button
                type="button"
                onClick={() => setHelp(true)}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/25 bg-ink/35 px-3.5 font-sans text-[11px] font-medium tracking-[0.14em] text-paper uppercase backdrop-blur-sm"
              >
                How an order works
              </button>
            </div>
          </div>
          <div className="max-w-[24rem] sm:max-w-[30rem]">
            <p className="font-sans text-[11px] tracking-[0.28em] text-dust uppercase">Made in South Africa</p>
            <h1 className="font-display mt-3 text-[2.7rem] leading-[0.96] font-medium tracking-[-0.04em] text-paper sm:text-6xl">
              Leather shoes. Yours to pick.
            </h1>
            <p className="mt-4 max-w-[28em] font-sans text-[15px] leading-relaxed text-paper-2">
              Tap a pair. Hide, stitch, laces, a laser — as you want them. The last stays. We WhatsApp you, then you pay once we confirm it. Most pairs leave 10–14 working days after EFT.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOpen(FEATURED)}
                className="inline-flex min-h-11 items-center rounded-full bg-paper px-5 font-sans text-[11px] font-semibold tracking-[0.16em] text-ink uppercase"
              >
                Open the chelsea
              </button>
              <button
                type="button"
                onClick={() => setClerk({ locked: false })}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/35 px-5 font-sans text-[11px] font-semibold tracking-[0.16em] text-paper uppercase"
              >
                Your spec
              </button>
              <a
                href="#grid"
                className="inline-flex min-h-11 items-center rounded-full border border-paper/35 px-5 font-sans text-[11px] font-semibold tracking-[0.16em] text-paper uppercase"
              >
                See the shoes
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-rule bg-bone/92 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1080px] gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
          {SHOP_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFilter(item.id);
                document.getElementById("grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`min-h-11 shrink-0 rounded-full border px-3.5 font-sans text-[11px] font-medium tracking-[0.08em] uppercase ${
                filter === item.id ? "border-ink bg-ink text-bone" : "border-rule bg-transparent text-muted"
              }`}
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      <div id="grid" className={`mx-auto max-w-[1080px] px-0 pt-6 ${lines.length ? "pb-28" : "pb-16"}`}>
        {groups.map(([name, pairs], i) => {
          const themeId = themeForLook(name).id;
          const prevId = i > 0 ? themeForLook(groups[i - 1][0]).id : null;
          const showFilm = themeId !== prevId;
          return (
          <section key={name} className="mb-10">
            {showFilm ? (
              <LastFilm look={name} count={pairs.length} />
            ) : (
              <div className="mx-4 mb-3 flex items-end justify-between gap-3 sm:mx-6">
                <h2 className="font-display text-[1.45rem] font-medium tracking-[-0.02em] text-ink sm:text-[1.9rem]">
                  {displayLook(name)}
                </h2>
                <p className="font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
                  {pairs.length} {pairs.length === 1 ? "pair" : "pairs"}
                </p>
              </div>
            )}
            <div className={showFilm ? "mt-3" : undefined}>
              <PairStrip pairs={pairs} onOpen={setOpen} large={groups.length === 1} />
            </div>
            {filter === "All" && i === 0 ? (
              <button
                type="button"
                onClick={() => setClerk({ locked: false })}
                className="mx-4 mt-5 flex w-[calc(100%-2rem)] items-center justify-between gap-4 overflow-hidden rounded-lg bg-ink px-4 py-4 text-left sm:mx-6 sm:w-[calc(100%-3rem)] sm:px-5"
              >
                <span>
                  <span className="block font-sans text-[11px] tracking-[0.2em] text-dust uppercase">Your spec</span>
                  <span className="font-display mt-1 block text-xl tracking-[-0.02em] text-paper">
                    Grey hide. Aqua stitch. This last.
                  </span>
                </span>
                <span className="shrink-0 font-sans text-[11px] tracking-[0.14em] text-paper uppercase">Tell us</span>
              </button>
            ) : null}
            {filter === "All" && i === 1 ? (
              <button
                type="button"
                onClick={() => setHelp(true)}
                className="mx-4 mt-5 flex w-[calc(100%-2rem)] items-center justify-between gap-4 overflow-hidden rounded-lg bg-ink px-4 py-4 text-left sm:mx-6 sm:w-[calc(100%-3rem)] sm:px-5"
              >
                <span>
                  <span className="block font-sans text-[11px] tracking-[0.2em] text-dust uppercase">How long?</span>
                  <span className="font-display mt-1 block text-xl tracking-[-0.02em] text-paper">
                    10–14 working days after you pay
                  </span>
                </span>
                <span className="shrink-0 font-sans text-[11px] tracking-[0.14em] text-paper uppercase">See how</span>
              </button>
            ) : null}
          </section>
          );
        })}
      </div>

      <footer className="mx-auto max-w-[1080px] px-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
        <p className="max-w-[36em] font-sans text-[13px] leading-relaxed text-muted">
          Made in our factory in South Africa. We confirm the pair on WhatsApp, then EFT. Collect is free. Send in SA
          is R100. Laces, stitch, elastic, sole, lining, hardware and laser are R50 each. A spec that is hard to chip?
          Open Your spec — grey hide, aqua stitch, the lot. We keep this last. We confirm before we cut.
        </p>
      </footer>

      {lines.length > 0 && !open && !review && !clerk ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-card/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 pb-[env(safe-area-inset-bottom)]">
            <p className="font-sans text-sm text-ink">
              {lines.length} {lines.length === 1 ? "pair" : "pairs"}
              <span className="text-muted"> · </span>
              <span className="font-display">R{orderTotal(lines, delivery)}</span>
            </p>
            <button
              type="button"
              onClick={() => setReview(true)}
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 font-sans text-[11px] font-semibold tracking-[0.14em] text-bone uppercase transition-transform duration-150 active:scale-[0.96]"
            >
              Review order
            </button>
          </div>
        </div>
      ) : null}

      {open ? (
        <PairSheet
          pair={open}
          onClose={() => setOpen(null)}
          onAdded={() => setOpen(null)}
          onTalk={(draft) => {
            const current = open;
            setOpen(null);
            setClerk({ pair: current, draft, locked: true });
          }}
        />
      ) : null}
      {clerk ? (
        <CustomBot
          pair={clerk.pair}
          draft={clerk.draft}
          locked={clerk.locked}
          onClose={() => setClerk(null)}
          onAdded={() => setClerk(null)}
        />
      ) : null}
      {review ? <ReviewSheet onClose={() => setReview(false)} /> : null}
    </div>
  );
}
