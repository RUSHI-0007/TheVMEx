// GoldDivider — the recurring section separator motif
// Usage: <GoldDivider /> or <GoldDivider label="About" />

interface GoldDividerProps {
  label?: string;
  className?: string;
}

export default function GoldDivider({ label, className = "" }: GoldDividerProps) {
  return (
    <div className={`gold-divider ${className}`} aria-hidden="true">
      {/* Diamond ornament + optional label */}
      <span className="gold-divider--ornament">
        {/* Small diamond shapes */}
        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
          <polygon points="3,0 6,3 3,6 0,3" />
        </svg>
        {label && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.55rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
              color: "var(--gold-muted)",
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        )}
        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
          <polygon points="3,0 6,3 3,6 0,3" />
        </svg>
      </span>
    </div>
  );
}
