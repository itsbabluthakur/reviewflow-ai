import { Loader2Icon } from "lucide-react";
import { Button, type buttonVariants } from "@reviewflow/ui";
import type { VariantProps } from "class-variance-authority";

interface SubmitButtonProps extends VariantProps<typeof buttonVariants> {
  pending: boolean;
  pendingLabel: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A submit button that always shows a loading state during its async
 * action (UI_GUIDELINES section 10) — a spinner plus a distinct pending
 * label, and disabled so it can't be double-submitted.
 */
export function SubmitButton({
  pending,
  pendingLabel,
  children,
  className,
  ...buttonProps
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} className={className} {...buttonProps}>
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
