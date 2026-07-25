import { cn } from "@reviewflow/utils";

interface SectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/** A titled block of content — the base unit dashboard/settings pages compose from. */
export function Section({ title, description, className, children }: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {title || description ? (
        <div>
          {title ? <h2 className="text-lg font-medium">{title}</h2> : null}
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
