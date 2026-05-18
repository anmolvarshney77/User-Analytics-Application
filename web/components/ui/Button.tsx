import Link from "next/link";
import { cn } from "@/lib/cn";

export const buttonVariants = {
  primary:
    "bg-violet-600 text-white shadow-md shadow-violet-900/35 ring-1 ring-violet-500/20 hover:bg-violet-500 hover:shadow-violet-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
  secondary:
    "border border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
  ghost:
    "text-zinc-300 hover:bg-zinc-800/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40",
  compact:
    "bg-violet-600/90 text-white ring-1 ring-violet-500/30 hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50",
} as const;

const sizes = {
  sm: "rounded-lg px-3 py-1.5 text-xs font-semibold",
  md: "rounded-lg px-4 py-2 text-sm font-semibold",
  nav: "rounded-lg px-3 py-2 text-sm font-semibold",
} as const;

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizes;
  disabled?: boolean;
} & (
  | { href: string; external?: boolean; type?: never; onClick?: never }
  | { href?: never; external?: never; type?: "button" | "submit"; onClick?: () => void }
);

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  href,
  external,
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-50",
    buttonVariants[variant],
    sizes[size],
    className,
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
