import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, Download } from "lucide-react";
import { ENTITIES, metricsAvailable, MONTHS, MONTHS_LONG, downloadCSV, fmtAxis, fmtPct, fmtValue, metric, metricDef, periodLabel, periodMonths, variation, type MetricKey, type Period, CUR, PREV } from "../data/metrics";
import { ConceptCompare } from "./ExpenseCompare";
import { ChartTip, Delta, GRID, Legend, Panel, PREV_COLOR, Segmented, axisTick } from "./ui";

const pp = (v: number) => `${v >= 0 ? "+" : ""}${v.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pp`;

export function Compare({ period, selected, setSelected }: { period: Period; selected: string[]; setSelected: (s: string[]) => void }) {
  const [mk, setMk] = useState<MetricKey>("ingresos");
  const [mode, setMode] = useState<"total" | "mensual">("total");
  const def = metricDef(mk);
  const idx = periodMonths(period);
  const ents = ENTITIES.filter((e) => selected.includes(e.id));
  const avail = ents.filter((e) => metric(e, mk, idx) != null);
  const missing = ents.filter((e) => metric(e, mk, idx) == null);

  const totals = avail.map((e) => ({ id: e.id, name: e.short, color: e.color, cur: metric(e, mk, idx)!, prev: metric(e, mk, idx, "prev") }));
  const avg = totals.length ? totals.reduce((a, t) => a + t.cur, 0) / totals.length : 0;
  const ranked = [...totals].sort((a, b) => b.cur - a.cur);

  const monthly = MONTHS.map((m, i) => {
    const r: Record<string, number | string | null> = { m, i };
    avail.forEach((e) => (r[e.id] = metric(e, mk, [i])));
    return r;
  });

  const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="space-y-6">
      <Panel eyebrow="CONFIGURA LA COMPARACIÓN" title="¿Qué CDAs y qué indicador?">
        <div className="mb-4 flex flex-wrap gap-2">
          {ENTITIES.map((e) => {
            const on = selected.includes(e.id);
            return (
              <button key={e.id} onClick={() => toggle(e.id)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${on ? "border-[#0d2438] bg-white shadow-sm" : "border-dashed border-border text-muted-foreground"}`}>
                <span className={`grid h-4 w-4 place-items-center rounded ${on ? "text-white" : "border border-border"}`} style={on ? { background: e.color } : {}}>{on && <Check size={11} strokeWidth={3} />}</span>
                {e.short}
              </button>
            );
          })}
          <button onClick={() => setSelected(ENTITIES.map((e) => e.id))} className="px-2 text-[11px] font-bold text-muted-foreground underline-offset-2 hover:underline">Todos</button>
          <button onClick={() => setSelected([])} className="px-2 text-[11px] font-bold text-muted-foreground underline-offset-2 hover:underline">Ninguno</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {metricsAvailable().map((m) => (
            <button key={m.key} onClick={() => setMk(m.key)} title={m.hint} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${mk === m.key ? "border-[#e42b35] bg-[#e42b35] text-white" : "border-border bg-white text-muted-foreground hover:text-foreground"}`}>
              {m.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow={`${def.label.toUpperCase()} · ${mode === "total" ? periodLabel(period).toUpperCase() : `MES A MES ${CUR}`}`}
        title={mode === "total" ? `Comparativo ${CUR} vs ${PREV}` : "Evolución mensual comparada"}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <Segmented value={mode} onChange={setMode} options={[{ value: "total", label: "Total período" }, { value: "mensual", label: "Mes a mes" }]} />
            <button
              onClick={() => downloadCSV(`comparativo-${mk}-${periodLabel(period).replace(/\s/g, "-")}.csv`, [["CDA", String(CUR), String(PREV), "Variación %"], ...ranked.map((t) => [t.name, t.cur, t.prev, variation(t.cur, t.prev)])])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold hover:bg-secondary"
            >
              <Download size={13} /> CSV
            </button>
          </div>
        }
      >
        {avail.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Selecciona al menos un CDA con datos para este indicador.</p>
        ) : mode === "total" ? (
          <>
            <div className="mb-3"><Legend items={[{ label: `${CUR} (color de cada CDA)`, color: "#0d2438" }, { label: String(PREV), color: PREV_COLOR }, { label: `Promedio ${CUR}`, color: "#0d2438", dashed: true }]} /></div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranked} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} barGap={3}>
                  <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#263744", fontSize: 11, fontWeight: 600 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={axisTick} width={52} tickFormatter={(v) => fmtAxis(v, def.unit)} />
                  <ReferenceLine y={avg} stroke="#0d2438" strokeDasharray="5 4" />
                  <ReferenceLine y={0} stroke="#9aa5ad" />
                  <Tooltip
                    cursor={{ fill: "#f2f0eb" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      return <ChartTip title={p.name} rows={[{ name: String(CUR), color: p.color, value: fmtValue(p.cur, def.unit) }, { name: String(PREV), color: PREV_COLOR, value: fmtValue(p.prev, def.unit) }, { name: def.unit === "pct" ? "Diferencia" : "Variación", value: def.unit === "pct" ? pp(p.cur - (p.prev ?? 0)) : fmtPct(variation(p.cur, p.prev)) }, { name: "vs promedio", value: def.unit === "pct" ? pp(p.cur - avg) : fmtPct(variation(p.cur, avg)) }]} />;
                    }}
                  />
                  <Bar dataKey="cur" radius={[4, 4, 0, 0]} barSize={22}>
                    {ranked.map((t) => <Cell key={t.id} fill={t.color} />)}
                  </Bar>
                  <Bar dataKey="prev" fill={PREV_COLOR} radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3"><Legend items={avail.map((e) => ({ label: e.short, color: e.color }))} /></div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 5" />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={axisTick} width={52} tickFormatter={(v) => fmtAxis(v, def.unit)} />
                  <ReferenceLine y={0} stroke="#9aa5ad" />
                  <Tooltip
                    cursor={{ stroke: "#0d2438", strokeDasharray: "3 3" }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <ChartTip title={`${MONTHS_LONG[payload[0].payload.i]} ${CUR}`} rows={[...payload].sort((a, b) => Number(b.value) - Number(a.value)).map((p) => { const e = ENTITIES.find((x) => x.id === p.dataKey)!; return { name: e.short, color: e.color, value: fmtValue(p.value as number, def.unit) }; })} />
                      ) : null
                    }
                  />
                  {avail.map((e) => <Line key={e.id} type="monotone" dataKey={e.id} stroke={e.color} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />)}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {missing.length > 0 && <p className="mt-3 text-[11px] text-muted-foreground">Sin dato de “{def.label}” en el Excel de: {missing.map((e) => e.short).join(", ")}.</p>}
      </Panel>

      {ranked.length > 0 && (
        <Panel eyebrow="TABLA DE POSICIONES" title={`${def.label} · ${periodLabel(period)}`}>
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full whitespace-nowrap min-w-[620px] text-xs">
              <thead>
                <tr className="border-y border-border bg-secondary/50 font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                  <th className="py-2.5 pl-5 text-left font-semibold sm:pl-6">#</th>
                  <th className="px-3 text-left font-semibold">UNIDAD</th>
                  <th className="px-3 text-right font-semibold">{CUR}</th>
                  <th className="px-3 text-right font-semibold">{PREV}</th>
                  <th className="px-3 text-right font-semibold">VARIACIÓN</th>
                  <th className="px-3 pr-5 text-right font-semibold sm:pr-6">VS PROMEDIO</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((t, i) => (
                  <tr key={t.id} className="border-b border-border/60">
                    <td className="py-3 pl-5 font-mono text-muted-foreground sm:pl-6">{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-3"><span className="inline-flex items-center gap-2 font-bold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />{t.name}</span></td>
                    <td className="px-3 text-right font-mono font-semibold">{fmtValue(t.cur, def.unit)}</td>
                    <td className="px-3 text-right font-mono text-muted-foreground">{fmtValue(t.prev, def.unit)}</td>
                    <td className="px-3 text-right">{def.unit === "pct" ? <span className="font-mono">{t.prev == null ? "—" : pp(t.cur - t.prev)}</span> : <Delta value={variation(t.cur, t.prev)} invert={mk.startsWith("gast")} suffix="" />}</td>
                    <td className="px-3 pr-5 text-right font-mono sm:pr-6">{def.unit === "pct" ? pp(t.cur - avg) : fmtPct(variation(t.cur, avg))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <ConceptCompare key={mk} metricKey={mk} period={period} selected={selected} />
    </div>
  );
}
