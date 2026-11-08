import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronRight } from "lucide-react";
import { ENTITIES, MONTHS, MONTHS_LONG, fmtAxis, fmtPct, fmtValue, metric, metricDef, periodLabel, periodMonths, variation, type MetricKey, type Period } from "../data/metrics";
import { ChartTip, Delta, GRID, Kpi, Legend, Panel, PREV_COLOR, Segmented, axisTick } from "./ui";

const TREND_METRICS: MetricKey[] = ["ingresos", "ebitda", "resultado", "servicios"];

export function GroupOverview({ period, onOpen }: { period: Period; onOpen: (id: string) => void }) {
  const idx = periodMonths(period);
  const [trend, setTrend] = useState<MetricKey>("ingresos");
  const [hidden, setHidden] = useState<string[]>([]);

  const total = (k: MetricKey, y: "y25" | "y24", ids?: string[]) =>
    ENTITIES.filter((e) => !ids || ids.includes(e.id)).reduce((a, e) => a + (metric(e, k, idx, y) ?? 0), 0);

  const withEbitda = ENTITIES.filter((e) => e.fin.ebitda).map((e) => e.id);
  const withServ = ENTITIES.filter((e) => e.services).map((e) => e.id);

  const rows = useMemo(
    () =>
      ENTITIES.map((e) => ({
        e,
        ing: metric(e, "ingresos", idx),
        ingVar: variation(metric(e, "ingresos", idx), metric(e, "ingresos", idx, "y24")),
        ebitda: metric(e, "ebitda", idx),
        mEbitda: metric(e, "margenEbitda", idx),
        res: metric(e, "resultado", idx),
        serv: metric(e, "servicios", idx),
        servVar: variation(metric(e, "servicios", idx), metric(e, "servicios", idx, "y24")),
        ticket: metric(e, "ticket", idx),
      })).sort((a, b) => (b.ing ?? 0) - (a.ing ?? 0)),
    [period],
  );
  const totalIng = total("ingresos", "y25");

  const trendDef = metricDef(trend);
  const trendData = MONTHS.map((m, i) => {
    const row: Record<string, number | string | null> = { month: m, i };
    ENTITIES.forEach((e) => (row[e.id] = metric(e, trend, [i])));
    return row;
  });

  const barData = rows.map((r) => ({ name: r.e.short, id: r.e.id, y25: r.ing, y24: metric(r.e, "ingresos", idx, "y24"), color: r.e.color }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Ingresos operacionales" value={fmtValue(totalIng, "cop")} delta={variation(totalIng, total("ingresos", "y24"))} note="6 unidades de negocio" accent="#e42b35" />
        <Kpi label="EBITDA" value={fmtValue(total("ebitda", "y25", withEbitda), "cop")} delta={variation(total("ebitda", "y25", withEbitda), total("ebitda", "y24", withEbitda))} note="5 unidades · Tecnosabana no lo reporta" accent="#0d2438" />
        <Kpi label="Resultado antes de impuestos" value={fmtValue(total("resultado", "y25"), "cop")} delta={variation(total("resultado", "y25"), total("resultado", "y24"))} note={`Margen neto ${fmtValue((total("resultado", "y25") / totalIng) * 100, "pct")}`} accent="#df9d37" />
        <Kpi label="Servicios realizados" value={fmtValue(total("servicios", "y25", withServ), "count")} delta={variation(total("servicios", "y25", withServ), total("servicios", "y24", withServ))} note="4 CDAs con hoja de servicios" accent="#8298a8" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          eyebrow="EVOLUCIÓN MENSUAL 2025"
          title={`${trendDef.label} por unidad`}
          right={<Segmented value={trend} onChange={setTrend} options={TREND_METRICS.map((k) => ({ value: k, label: metricDef(k).label.split(" ")[0] }))} />}
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {ENTITIES.map((e) => {
              const off = hidden.includes(e.id);
              const na = metric(e, trend, idx) == null;
              return (
                <button
                  key={e.id}
                  disabled={na}
                  onClick={() => setHidden((h) => (off ? h.filter((x) => x !== e.id) : [...h, e.id]))}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${off || na ? "border-border text-muted-foreground opacity-50" : "border-[#0d2438]/15 bg-white"}`}
                  title={na ? "Sin dato en el Excel de origen" : "Mostrar / ocultar"}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                  {e.short}
                </button>
              );
            })}
          </div>
          <div className="h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} width={52} tickFormatter={(v) => fmtAxis(v, trendDef.unit)} />
                <Tooltip
                  cursor={{ stroke: "#0d2438", strokeDasharray: "3 3" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <ChartTip
                        title={`${MONTHS_LONG[payload[0].payload.i]} 2025`}
                        rows={[...payload].sort((a, b) => Number(b.value) - Number(a.value)).map((p) => {
                          const e = ENTITIES.find((x) => x.id === p.dataKey)!;
                          return { name: e.short, color: e.color, value: fmtValue(p.value as number, trendDef.unit) };
                        })}
                      />
                    ) : null
                  }
                />
                {ENTITIES.filter((e) => !hidden.includes(e.id) && metric(e, trend, idx) != null).map((e) => (
                  <Line key={e.id} type="monotone" dataKey={e.id} stroke={e.color} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel eyebrow={periodLabel(period).toUpperCase()} title="Ingresos por unidad · 2025 vs 2024" right={<Legend items={[{ label: "2025", color: "#0d2438" }, { label: "2024", color: PREV_COLOR }]} />}>
          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barGap={2} onClick={(s: any) => s?.activePayload?.[0] && onOpen(s.activePayload[0].payload.id)}>
                <CartesianGrid horizontal={false} stroke={GRID} strokeDasharray="3 5" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(v) => fmtAxis(v, "cop")} />
                <YAxis type="category" dataKey="name" width={82} axisLine={false} tickLine={false} tick={{ fill: "#263744", fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: "#f2f0eb" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <ChartTip
                        title={payload[0].payload.name}
                        rows={[
                          { name: "2025", color: "#0d2438", value: fmtValue(payload[0].payload.y25, "cop") },
                          { name: "2024", color: PREV_COLOR, value: fmtValue(payload[0].payload.y24, "cop") },
                          { name: "Variación", value: fmtPct(variation(payload[0].payload.y25, payload[0].payload.y24)) },
                        ]}
                      />
                    ) : null
                  }
                />
                <Bar dataKey="y25" fill="#0d2438" radius={[0, 4, 4, 0]} barSize={10} className="cursor-pointer" />
                <Bar dataKey="y24" fill={PREV_COLOR} radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel eyebrow={`RANKING · ${periodLabel(period).toUpperCase()}`} title="Tablero comparativo de unidades" right={<span className="text-[11px] text-muted-foreground">Clic en una fila para abrir la ficha</span>}>
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead>
              <tr className="border-y border-border bg-secondary/50 font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                {["#", "Unidad", "Ingresos op.", "Part.", "Var. 24", "EBITDA", "Margen EBITDA", "Resultado", "Servicios", "Var. 24", "Ingreso / serv.", ""].map((h, i) => (
                  <th key={i} className={`px-3 py-2.5 font-semibold ${i > 1 ? "text-right" : ""} ${i === 0 ? "pl-5 sm:pl-6" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.e.id} onClick={() => onOpen(r.e.id)} className="cursor-pointer border-b border-border/70 transition hover:bg-secondary/40">
                  <td className="py-3 pl-5 pr-3 font-mono text-muted-foreground sm:pl-6">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.e.color }} />
                      <div>
                        <p className="font-bold">{r.e.short}</p>
                        <p className="text-[10px] text-muted-foreground">{r.e.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-semibold">{fmtValue(r.ing, "cop")}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="ml-auto flex w-[70px] items-center justify-end gap-1.5">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-[#0d2438]" style={{ width: `${((r.ing ?? 0) / totalIng) * 100}%` }} /></div>
                      <span className="font-mono text-[10px]">{Math.round(((r.ing ?? 0) / totalIng) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right"><Delta value={r.ingVar} suffix="" /></td>
                  <td className="px-3 py-3 text-right font-mono">{fmtValue(r.ebitda, "cop")}</td>
                  <td className="px-3 py-3 text-right font-mono">{fmtValue(r.mEbitda, "pct")}</td>
                  <td className={`px-3 py-3 text-right font-mono ${(r.res ?? 0) < 0 ? "text-red-700" : ""}`}>{fmtValue(r.res, "cop")}</td>
                  <td className="px-3 py-3 text-right font-mono">{fmtValue(r.serv, "count")}</td>
                  <td className="px-3 py-3 text-right">{r.serv == null ? <span className="text-muted-foreground">—</span> : <Delta value={r.servVar} suffix="" />}</td>
                  <td className="px-3 py-3 text-right font-mono">{fmtValue(r.ticket, "cop", false)}</td>
                  <td className="pr-5 text-muted-foreground sm:pr-6"><ChevronRight size={14} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          “—” = el Excel de origen no trae ese dato (Tecnosabana no reporta EBITDA ni servicios; el consolidado de Grupo Cardisel no trae hoja de servicios).
        </p>
      </Panel>
    </div>
  );
}
