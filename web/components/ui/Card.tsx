import { cn } from "@/lib/cn";

const variants = {
  default: "border-zinc-800/90 bg-zinc-900/50",
  elevated: "border-zinc-800 bg-zinc-900/60 shadow-xl shadow-black/25",
  muted: "border-zinc-800/80 bg-zinc-950/40",
  dashed: "border-dashed border-zinc-700/90 bg-zinc-900/35",
} as const;

export function Card({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variants;
}) {
  return <div className={cn("rounded-xl border", variants[variant], className)}>{children}</div>;
}
