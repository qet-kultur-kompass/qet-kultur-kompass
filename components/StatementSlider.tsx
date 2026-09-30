"use client";

const PILLAR_COLOR: Record<string, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };

export function StatementSlider({
  statement,
  value,
  onChange,
  pillar,
  notAtAllLabel,
  fullyLabel,
}: {
  statement: string;
  value: number;
  onChange: (value: number) => void;
  pillar: "Q" | "E" | "T";
  notAtAllLabel: string;
  fullyLabel: string;
}) {
  const color = PILLAR_COLOR[pillar];

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-snug text-ink/85">{statement}</p>
        <span
          className="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="qet-slider mt-2 w-full"
        style={{ ["--slider-fill" as string]: `${value}%`, ["--slider-color" as string]: color }}
        aria-label={statement}
      />
      <div className="mt-0.5 flex justify-between text-[11px] text-ink/40">
        <span>{notAtAllLabel}</span>
        <span>{fullyLabel}</span>
      </div>
    </div>
  );
}
