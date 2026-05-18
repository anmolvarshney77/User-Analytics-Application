import { cn } from "@/lib/cn";
import { Card } from "./ui/Card";

export function EmptyState({
  children,
  icon,
  title,
  className = "px-6 py-14",
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <Card variant="dashed" className={cn("flex flex-col items-center gap-4 text-center", className)}>
      {icon ?? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80 text-xl text-zinc-500" aria-hidden>
          ◉
        </span>
      )}
      {title ? <p className="text-sm font-medium text-zinc-300">{title}</p> : null}
      {children}
    </Card>
  );
}
