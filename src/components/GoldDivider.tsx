// GoldDivider — the recurring section separator motif
// Usage: <GoldDivider /> or <GoldDivider label="About" />

interface GoldDividerProps {
  label?: string;
  className?: string;
}

export default function GoldDivider({ label, className = "" }: GoldDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-4 w-full mx-auto ${className}`} aria-hidden="true">
      {/* Before line */}
      <div className="flex-1 max-w-[220px] h-px opacity-60 bg-[linear-gradient(to_right,transparent,var(--color-gold-muted),var(--color-gold),var(--color-gold-muted),transparent)]" />

      {/* Diamond ornament + optional label */}
      <span className="flex items-center gap-1.5 text-gold text-[0.5rem] tracking-[2px]">
        {/* Small diamond shapes */}
        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
          <polygon points="3,0 6,3 3,6 0,3" />
        </svg>
        {label && (
          <span className="font-body text-[0.55rem] tracking-[0.25em] uppercase text-gold-muted font-semibold">
            {label}
          </span>
        )}
        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
          <polygon points="3,0 6,3 3,6 0,3" />
        </svg>
      </span>

      {/* After line */}
      <div className="flex-1 max-w-[220px] h-px opacity-60 bg-[linear-gradient(to_right,transparent,var(--color-gold-muted),var(--color-gold),var(--color-gold-muted),transparent)]" />
    </div>
  );
}
