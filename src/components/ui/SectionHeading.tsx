import { cn } from "@/lib/utils";

export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn("gold-divider", className)} aria-hidden="true">
      <span className="gold-divider-ornament">◆</span>
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "center",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" ? "text-center" : "text-left"
      )}
    >
      {label && (
        <p className="font-accent text-2xl md:text-3xl text-gold-muted mb-2">
          {label}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-5xl tracking-wide text-text-primary">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-text-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
      <SectionDivider className="mt-8" />
    </div>
  );
}
