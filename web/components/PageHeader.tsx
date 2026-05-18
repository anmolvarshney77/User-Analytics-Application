import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  eyebrow,
  children,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="relative space-y-2 pl-4">
        <span
          className="absolute left-0 top-1 h-[calc(100%-0.25rem)] w-0.5 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500/60"
          aria-hidden
        />
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400/90">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
