import type { LucideIcon } from "lucide-react";
import { cn } from "@reviewflow/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** UI_GUIDELINES.md section 18: every empty state needs an icon, a clear message, and (optionally) a primary action. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      ) : null}
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
