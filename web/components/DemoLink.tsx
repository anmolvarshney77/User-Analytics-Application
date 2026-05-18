import { demoUrl } from "@/lib/urls";
import { cn } from "@/lib/cn";
import { buttonVariants } from "./ui/Button";

const variants = {
  nav: cn(buttonVariants.primary, "ml-1 shadow-md"),
  button: cn(buttonVariants.primary, "px-4 py-2"),
  inline: "text-violet-400 underline decoration-violet-500/40 underline-offset-2 transition hover:text-violet-300",
} as const;

export function DemoLink({
  variant = "button",
  label = "Open demo ↗",
  className,
}: {
  variant?: keyof typeof variants;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={demoUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        variant !== "inline" && "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        variants[variant],
        className,
      )}
    >
      {label}
    </a>
  );
}
