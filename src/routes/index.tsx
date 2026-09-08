import { createFileRoute } from "@tanstack/react-router";
import { Collection } from "@/components/collection";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "SABLE — Collection 2026" },
      {
        name: "description",
        content: "Leather shoes made in South Africa. Tap a pair, pick size, we WhatsApp you.",
      },
      { name: "theme-color", content: "#f1ebe1" },
    ],
  }),
});

function Home() {
  return <Collection />;
}
