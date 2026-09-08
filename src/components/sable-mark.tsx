export function SableMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="square"
        d="M22 9c-7-2.2-12.4.6-12.4 4.1 0 3.5 5.4 4.3 12.2 6.7 4.6 1.6 3.8 6.2-3.8 7.3"
      />
    </svg>
  );
}
