export function EmptyState({
  children,
  className = "px-6 py-14",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 text-center ${className}`}
    >
      {children}
    </div>
  );
}
