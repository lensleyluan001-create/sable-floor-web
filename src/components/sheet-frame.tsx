import { useEffect, type ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
      {label}
      {children}
    </label>
  );
}

export function SheetFrame({
  children,
  footer,
  onClose,
  labelledBy,
}: {
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  labelledBy: string;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-overlay p-3 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative z-10 flex max-h-[min(92dvh,860px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-card shadow-[0_24px_80px_rgb(28_24_20/0.28)]"
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
        {footer ? <div className="shrink-0 border-t border-rule bg-card px-4 py-3 sm:px-6">{footer}</div> : null}
      </div>
    </div>
  );
}
