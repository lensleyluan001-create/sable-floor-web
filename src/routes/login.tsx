import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { SableMark } from "@/components/sable-mark";
import { FLOOR_LOGIN } from "@/lib/floor";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "SABLE — Floor" },
      { name: "description", content: "Staff desk. Password on this phone." },
      { name: "theme-color", content: "#16110E" },
    ],
  }),
});

function Login() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.top === window) window.location.replace(FLOOR_LOGIN);
  }, []);

  return (
    <main className="relative min-h-dvh bg-ink text-paper">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <a href={FLOOR_LOGIN} className="flex min-h-11 items-center gap-2 text-paper">
          <SableMark className="h-7 w-7" />
          <span className="font-sans text-[11px] font-medium tracking-[0.42em]">SABLE</span>
        </a>
        <a
          href={FLOOR_LOGIN}
          className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 font-sans text-[11px] font-semibold tracking-[0.16em] text-ink uppercase"
        >
          Open the floor
        </a>
      </div>
      <iframe title="SABLE floor" src={FLOOR_LOGIN} className="h-dvh w-full border-0 bg-ink" />
    </main>
  );
}
