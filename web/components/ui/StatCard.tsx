import { Card } from "./Card";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card variant="elevated" className="px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-white">{value}</p>
    </Card>
  );
}
