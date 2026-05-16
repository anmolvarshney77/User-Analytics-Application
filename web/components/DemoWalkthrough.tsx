import { DemoLink } from "./DemoLink";

const steps = [
  { n: 1, text: "Open the demo page and scroll — clicks send events to the API." },
  { n: 2, text: "Return here and refresh Sessions to see your session." },
  { n: 3, text: "Open Journey for the timeline; Heatmap for click density." },
];

export function DemoWalkthrough() {
  return (
    <div className="rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-950/50 to-zinc-900/80 p-5 shadow-lg shadow-violet-950/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Try it live</p>
          <p className="mt-1 text-sm text-zinc-300">
            Full pipeline: tracker → API → MongoDB → this dashboard.
          </p>
        </div>
        <DemoLink variant="button" className="shrink-0" />
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.n}
            className="flex gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-400"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-200">
              {s.n}
            </span>
            <span className="leading-snug">{s.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
