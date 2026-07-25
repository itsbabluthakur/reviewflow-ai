import { Label } from "@reviewflow/ui";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Label + input slot + inline error message, consistent across every form
 * in the app (CLAUDE.md's Forms requirement: labels, helper text, error
 * messages). `children` renders the actual input — this only standardizes
 * the label/error chrome around it, so each field keeps full control over
 * its own `id`/`aria-*` wiring.
 */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {hint}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
