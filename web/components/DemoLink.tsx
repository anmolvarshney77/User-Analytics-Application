import { demoUrl } from "@/lib/urls";

const variants = {
  nav: "ml-1 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-violet-900/30 transition hover:bg-violet-500 hover:shadow-violet-800/40",
  button:
    "inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-900/40 transition hover:bg-violet-500",
  inline: "text-violet-400 underline transition hover:text-violet-300",
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
      className={className ?? variants[variant]}
    >
      {label}
    </a>
  );
}
