import { cn } from "@/lib/cn";

const variants = {
  default: "rounded-full border-zinc-700/80 bg-zinc-800/80 text-zinc-300",
  sky: "rounded-full border-sky-500/30 bg-sky-500/10 text-sky-200",
  amber: "rounded-full border-amber-500/30 bg-amber-500/10 text-amber-200",
  violet: "rounded-full border-violet-500/30 bg-violet-500/10 text-violet-200",
  eventClick: "rounded-md border-transparent bg-amber-500/20 text-amber-200",
  eventPageView: "rounded-md border-transparent bg-sky-500/20 text-sky-200",
} as const;

export function Badge({
  children,
  variant = "default",
  className,
  uppercase,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  uppercase?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-3 py-1 text-xs font-semibold",
        uppercase ? "px-2.5 py-0.5 font-bold uppercase tracking-wide" : "",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
