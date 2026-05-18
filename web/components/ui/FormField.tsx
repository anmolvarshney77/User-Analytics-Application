import { cn } from "@/lib/cn";

export const inputClassName =
  "w-full rounded-lg border border-zinc-700/90 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50";

export function FormField({
  id,
  label,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-zinc-600">{hint}</p> : null}
    </div>
  );
}
