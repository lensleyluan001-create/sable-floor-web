import { createFileRoute } from "@tanstack/react-router";
import { ProcessFilm } from "@/components/process-film";
import { ORDER_LASTS } from "@/lib/film";
import { PROCESS_CHAPTERS } from "@/lib/process";

export const Route = createFileRoute("/how")({
  component: How,
  head: () => ({
    meta: [
      { title: "SABLE — How an order works" },
      {
        name: "description",
        content: "Tap a pair. We WhatsApp you. Pay after we confirm. Most pairs leave in 10–14 working days.",
      },
      { name: "theme-color", content: "#16110E" },
    ],
  }),
});

function How() {
  return (
    <ProcessFilm
      chapters={PROCESS_CHAPTERS}
      orderLasts={ORDER_LASTS}
      peer={{ href: "/", label: "Back to the shoes", current: "How an order works" }}
    />
  );
}
