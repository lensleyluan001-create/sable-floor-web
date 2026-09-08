import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SableMark } from "@/components/sable-mark";

/** Live collection logo opens the CRM desk. Preview keeps the in-app house. */
const HOUSE_HREF = import.meta.env.PROD
  ? "https://sable-floor.vercel.app/login"
  : "/login";

export function SableLockup({
  tone = "paper",
  withAccount = true,
}: {
  tone?: "paper" | "ink";
  withAccount?: boolean;
}) {
  const { user, isPending } = useCurrentUserState();
  const color = tone === "paper" ? "text-paper" : "text-ink";
  const chip = tone === "paper" ? "bg-paper/15" : "bg-ink/10";

  const mark = (
    <>
      <SableMark className="h-7 w-7" />
      <span className="font-sans text-[11px] font-medium tracking-[0.42em]">SABLE</span>
    </>
  );

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      {import.meta.env.PROD ? (
        <a href={HOUSE_HREF} aria-label="SABLE — log in" className="flex min-h-11 items-center gap-2">
          {mark}
        </a>
      ) : (
        <Link to="/login" aria-label="SABLE — log in" className="flex min-h-11 items-center gap-2">
          {mark}
        </Link>
      )}
      {withAccount && isPending ? (
        <span className={`hidden h-8 w-8 animate-pulse rounded-full sm:inline-block ${chip}`} />
      ) : null}
      {withAccount && !isPending && user ? (
        <div className={`hidden max-w-[9rem] truncate sm:block ${color}`}>
          <UserButton />
        </div>
      ) : null}
    </div>
  );
}
