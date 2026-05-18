import { cn } from "@/lib/cn";

const config = {
  warning: {
    container: "border-amber-500/35 bg-amber-500/10",
    icon: "text-amber-300",
    glyph: "⚠",
  },
  error: {
    container: "border-red-500/35 bg-red-500/10",
    icon: "text-red-300",
    glyph: "✕",
  },
} as const;

export function AlertBanner({
  variant = "warning",
  title,
  children,
}: {
  variant?: keyof typeof config;
  title: string;
  children?: React.ReactNode;
}) {
  const { container, icon, glyph } = config[variant];

  return (
    <div
      role="alert"
      className={cn("flex gap-3 rounded-xl border px-4 py-4 text-sm", container)}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/20 text-sm font-bold",
          icon,
        )}
        aria-hidden
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white/95">{title}</p>
        {children ? (
          <div className="mt-2 space-y-1.5 text-zinc-300/90 [&_a]:text-violet-300 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-violet-200">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
