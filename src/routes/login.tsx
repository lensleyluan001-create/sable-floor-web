import { Link, createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { SableMark } from "@/components/sable-mark";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "SABLE — The house" },
      {
        name: "description",
        content: "Google or X. Then the book.",
      },
      { name: "theme-color", content: "#16110E" },
    ],
  }),
});

function Login() {
  const { user, isPending } = useCurrentUserState();

  return (
    <main className="relative flex min-h-dvh flex-col bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-[28rem] flex-1 flex-col justify-center px-6 py-16">
        <Link to="/" className="flex flex-col items-center text-paper">
          <SableMark className="h-14 w-14" />
          <h1 className="font-display mt-8 text-4xl font-medium tracking-[-0.04em]">The house</h1>
        </Link>
        <p className="mt-3 text-center font-sans text-[15px] leading-relaxed text-paper-2">
          Google or X. Then the book.
        </p>

        <div className="mt-10 space-y-3">
          {isPending ? (
            <div className="h-12 w-full animate-pulse rounded-full bg-paper/10" />
          ) : user ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center text-paper">
                <UserButton />
              </div>
              <Link
                to="/"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-paper px-5 font-sans text-[11px] font-semibold tracking-[0.16em] text-ink uppercase"
              >
                Open the book
              </Link>
            </div>
          ) : authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-paper/35 px-5 font-sans text-[11px] font-semibold tracking-[0.16em] text-paper uppercase"
              >
                {p.label}
              </button>
            ))
          ) : (
            <p className="text-center font-sans text-sm text-dust">Sign-in is off for now.</p>
          )}
        </div>

        <p className="mt-12 text-center font-sans text-[11px] tracking-[0.22em] text-dust uppercase">
          Handmade in our factory · 2026
        </p>
      </div>
      <p className="pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center font-sans text-[11px] tracking-[0.42em] text-dust">
        SABLE.CO
      </p>
    </main>
  );
}
