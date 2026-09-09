import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SableMark } from "@/components/sable-mark";

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
  const fake =
    !user ||
    user.isDevFallback ||
    user.id === "dev-user" ||
    user.displayName === "Dev User";
  const showAccount = withAccount && !fake;

  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <Link to="/" aria-label="SABLE — collection" className="flex min-h-11 items-center gap-2">
        <SableMark className="h-7 w-7" />
        <span className="font-sans text-[11px] font-medium tracking-[0.42em]">SABLE</span>
      </Link>
      {showAccount && isPending ? (
        <span className={`hidden h-8 w-8 animate-pulse rounded-full sm:inline-block ${chip}`} />
      ) : null}
      {showAccount && !isPending && user ? (
        <div className={`hidden max-w-[9rem] truncate sm:block ${color}`}>
          <UserButton />
        </div>
      ) : null}
    </div>
  );
}
