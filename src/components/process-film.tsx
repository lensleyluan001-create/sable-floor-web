import { useState } from "react";
import { CarouselFilm } from "@/components/carousel-film";
import { ScrollFilm } from "@/components/scroll-film";
import type { Chapter } from "@/lib/film";

type Props = {
  chapters: Chapter[];
  orderLasts: readonly string[];
  peer: { href: "/" | "/how" | "/lasts"; label: string; current: string };
  helpButton?: { href: "/" | "/how" | "/lasts"; label: string };
  onBack?: () => void;
};

export function ProcessFilm(props: Props) {
  const [mode, setMode] = useState<"slides" | "scroll">("slides");
  const modeToggle = {
    label: mode === "slides" ? "Scroll instead" : "Slides instead",
    onClick: () => setMode((m) => (m === "slides" ? "scroll" : "slides")),
  };
  if (mode === "slides") return <CarouselFilm {...props} modeToggle={modeToggle} />;
  return <ScrollFilm {...props} modeToggle={modeToggle} />;
}
