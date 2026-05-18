export function AlertBanner({
  variant = "warning",
  title,
  children,
}: {
  variant?: "warning" | "error";
  title: string;
  children?: React.ReactNode;
}) {
  const styles =
    variant === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-200"
      : "border-amber-500/40 bg-amber-500/10 text-amber-200";

  return (
    <div className={`rounded-xl border px-4 py-4 text-sm ${styles}`}>
      <p className="font-semibold text-white/95">{title}</p>
      {children ? <div className="mt-2 space-y-1 opacity-90">{children}</div> : null}
    </div>
  );
}
