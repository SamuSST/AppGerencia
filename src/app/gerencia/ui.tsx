import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Info, Minus } from "lucide-react";
import { MONTHS_LONG, NM, PREV, type Period } from "../data/metrics";

export function Panel({ eyebrow, title, right, children, className = "" }: { eyebrow?: string; title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-card p-5 shadow-[0_2px_12px_rgba(13,36,56,.035)] sm:p-6 ${className}`}>
      {(title || right) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {eyebrow && <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#c8202a]">{eyebrow}</p>}
            {title && <h2 className="mt-1 text-[17px] font-extrabold tracking-tight">{title}</h2>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Delta({ value, invert = false, suffix }: { value: number | null; invert?: boolean; suffix?: string }) {
  suffix = suffix ?? `vs ${PREV}`;
  if (value == null || !isFinite(value))
    return <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Minus size={12} /> sin comparativo</span>;
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono font-semibold ${good ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {up ? "+" : ""}{value.toLocaleString("es-CO", { maximumFractionDigits: 1 })}%
      </span>
      {suffix}
    </span>
  );
}

export function Kpi({ label, value, delta, invert, note, accent }: { label: string; value: string; delta?: number | null; invert?: boolean; note?: string; accent?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-[0_2px_12px_rgba(13,36,56,.035)]">
      {accent && <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />}
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mb-2 text-[26px] font-extrabold leading-none tracking-[-0.035em]">{value}</p>
      {delta !== undefined && <Delta value={delta} invert={invert} />}
      {note && <p className="mt-2 text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${value === o.value ? "bg-[#0d2438] text-white" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PeriodPicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const key = value.kind === "year" ? "year" : value.kind === "quarter" ? `q${value.q}` : `m${value.m}`;
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5">
      <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground">PERÍODO</span>
      <select
        value={key}
        onChange={(ev) => {
          const v = ev.target.value;
          if (v === "year") onChange({ kind: "year" });
          else if (v.startsWith("q")) onChange({ kind: "quarter", q: Number(v.slice(1)) });
          else onChange({ kind: "month", m: Number(v.slice(1)) });
        }}
        className="bg-transparent text-xs font-bold outline-none"
      >
        <option value="year">{NM < 12 ? `Acumulado ene–${MONTHS_LONG[NM - 1].slice(0, 3).toLowerCase()}` : "Año completo (ene–dic)"}</option>
        {[1, 2, 3, 4].filter((q) => q * 3 <= NM).map((q) => <option key={q} value={`q${q}`}>Trimestre {q}</option>)}
        {MONTHS_LONG.slice(0, NM).map((m, i) => <option key={m} value={`m${i}`}>{m}</option>)}
      </select>
    </label>
  );
}

export function Swatch({ color, size = 10 }: { color: string; size?: number }) {
  return <span className="inline-block shrink-0 rounded-[3px]" style={{ background: color, width: size, height: size }} />;
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          {i.dashed ? <span className="inline-block h-0 w-4 border-t-2 border-dashed" style={{ borderColor: i.color }} /> : <Swatch color={i.color} />}
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function Missing({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center text-xs text-muted-foreground">
      <Info size={18} />
      {children}
    </div>
  );
}

type TipRow = { name: string; value: string; color?: string; dashed?: boolean };
export function ChartTip({ title, rows }: { title: string; rows: TipRow[] }) {
  return (
    <div className="min-w-[180px] rounded-lg border border-border bg-white px-3 py-2.5 text-xs shadow-[0_10px_30px_rgba(13,36,56,.12)]">
      <p className="mb-1.5 font-bold">{title}</p>
      {rows.map((r) => (
        <div key={r.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {r.color && (r.dashed ? <span className="inline-block h-0 w-3 border-t-2 border-dashed" style={{ borderColor: r.color }} /> : <Swatch color={r.color} size={8} />)}
            {r.name}
          </span>
          <span className="font-mono font-semibold text-foreground">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export const axisTick = { fill: "#6d7981", fontSize: 10, fontFamily: "DM Mono" };
export const GRID = "#e6e2dc";
export const PREV_COLOR = "#a9b7c1";
