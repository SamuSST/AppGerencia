import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronRight } from "lucide-react";
import { ENTITIES, MONTHS, MONTHS_LONG, fmtAxis, fmtPct, fmtValue, metric, metricDef, periodLabel, periodMonths, variation, type MetricKey, type Period, CUR, PREV, DS, NM } from "../data/metrics";
import { ChartTip, Delta, GRID, Kpi, Legend, Panel, PREV_COLOR, Segmented, SemaforoBadge, SemaforoLegend, axisTick, semaforo } from "./ui";

const TREND_METRICS: MetricKey[] = ["ingresos", "ebitda", "resultado", "servicios"];

export function GroupOverview({ period, onOpen }: { period: Period; onOpen: (id: string) => void }) {
  const idx = periodMonths(period);
  const [trend, setTrend] = useState<MetricKey>("ingresos");
  const [hidden, setHidden] = useState<string[]>([]);

  const total = (k: MetricKey, y: "cur" | "prev", ids?: string[]) =>
    ENTITIES.filter((e) => !ids || ids.includes(e.id)).reduce((a, e) => a + (metric(e, k, idx, y) ?? 0), 0);

  const withEbitda = ENTITIES.filter((e) => e.fin.ebitda).map((e) => e.id);
  const withServ = ENTITIES.filter((e) => e.services).map((e) => e.id);
  const withIng = ENTITIES.filter((e) => e.fin.ingOp).map((e) => e.id);
  const note = (ids: string[], what = "") => {
    const miss = ENTITIES.filter((e) => !ids.includes(e.id)).map((e) => e.short);
    return `${ids.length} CDAs${miss.length ? ` · sin ${what}${miss.join(", ")}` : ""}`;
  };
  const hasTarget = !!DS.targetLabel;
  const pace = (NM / 12) * 100;
  const targetIng = ENTITIES.filter((e) => e.fin.ingOp).reduce((a, e) => a + (e.target?.ingOp ?? 0), 0);
  const avanceRows = ENTITIES.map((e) => ({ e, v: metric(e, "avance", [...Array(NM).keys()]), t: e.target?.ingOp ?? null, ing: metric(e, "ingresos", [...Array(NM).keys()]) }))
    .sort((a, b) => (b.v ?? -1) - (a.v ?? -1));

  const rows = useMemo(
    () =>
      ENTITIES.map((e) => ({
        e,
        ing: metric(e, "ingresos", idx),
        ingVar: variation(metric(e, "ingresos", idx), metric(e, "ingresos", idx, "prev")),
        ebitda: metric(e, "ebitda", idx),
        mEbitda: metric(e, "margenEbitda", idx),
        res: metric(e, "resultado", idx),
        serv: metric(e, "servicios", idx),
        servVar: variation(metric(e, "servicios", idx), metric(e, "servicios", idx, "prev")),
        ticket: metric(e, "ticket", idx),
      })).sort((a, b) => (b.ing ?? 0) - (a.ing ?? 0)),
    [period],
  );
  const totalIng = total("ingresos", "cur");

  const trendDef = metricDef(trend);
  const trendData = MONTHS.map((m, i) => {
    const row: Record<string, number | string | null> = { month: m, i };
    ENTITIES.forEach((e) => (row[e.id] = metric(e, trend, [i])));
    return row;
  });

  const barData = rows.map((r) => ({ name: r.e.short, id: r.e.id, cur: r.ing, prev: metric(r.e, "ingresos", idx, "prev"), color: r.e.color }));

  return (
    <div className="space-y-6">
      <div className={`grid gap-3 sm:grid-cols-2 ${hasTarget ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
        <Kpi label="Ingresos operacionales" value={fmtValue(totalIng, "cop")} delta={variation(totalIng, total("ingresos", "prev"))} note={note(withIng, "datos: ")} accent="#e42b35" />
        {hasTarget && (
          <Kpi label={`Avance vs ${DS.targetLabel?.toLowerCase()}`} value={fmtValue((total("ingresos", "cur", withIng) / targetIng) * 100, "pct")} note={`De ${fmtValue(targetIng, "cop")} facturados en todo ${PREV} · ritmo esperado a ${MONTHS_LONG[NM - 1].toLowerCase()}: ${fmtValue(pace, "pct")}`} accent={semaforo((total("ingresos", "cur", withIng) / targetIng) * 100).color} />
        )}
        <Kpi label="EBITDA" value={fmtValue(total("ebitda", "cur", withEbitda), "cop")} delta={variation(total("ebitda", "cur", withEbitda), total("ebitda", "prev", withEbitda))} note={note(withEbitda)} accent="#0d2438" />
        <Kpi label="Resultado antes de impuestos" value={fmtValue(total("resultado", "cur"), "cop")} delta={variation(total("resultado", "cur"), total("resultado", "prev"))} note={`Margen neto ${fmtValue((total("resultado", "cur") / totalIng) * 100, "pct")}`} accent="#df9d37" />
        <Kpi label="Servicios realizados" value={fmtValue(total("servicios", "cur", withServ), "count")} delta={variation(total("servicios", "cur", withServ), total("servicios", "prev", withServ))} note={note(withServ)} accent="#8298a8" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          eyebrow={`EVOLUCIÓN MENSUAL ${CUR}`}
          title={`${trendDef.label} por CDA`}
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
                        title={`${MONTHS_LONG[payload[0].payload.i]} ${CUR}`}
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

        <Panel eyebrow={periodLabel(period).toUpperCase()} title={`Ingresos por CDA · ${CUR} vs ${PREV}`} right={<Legend items={[{ label: String(CUR), color: "#0d2438" }, { label: String(PREV), color: PREV_COLOR }]} />}>
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
                          { name: String(CUR), color: "#0d2438", value: fmtValue(payload[0].payload.cur, "cop") },
                          { name: String(PREV), color: PREV_COLOR, value: fmtValue(payload[0].payload.prev, "cop") },
                          { name: "Variación", value: fmtPct(variation(payload[0].payload.cur, payload[0].payload.prev)) },
                        ]}
                      />
                    ) : null
                  }
                />
                <Bar dataKey="cur" fill="#0d2438" radius={[0, 4, 4, 0]} barSize={10} className="cursor-pointer" />
                <Bar dataKey="prev" fill={PREV_COLOR} radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {hasTarget && (
        <Panel eyebrow={`CUMPLIMIENTO · ${periodLabel({ kind: "year" }).toUpperCase()} VS ${DS.targetLabel?.toUpperCase()}`} title={`¿Qué porcentaje de lo facturado en ${PREV} lleva cada CDA?`} right={<SemaforoLegend />}>
          <div className="space-y-3">
            {avanceRows.map(({ e, v, t, ing }) => {
              const sm = v == null ? null : semaforo(v);
              return (
                <div key={e.id} className="grid grid-cols-[96px_1fr_64px] items-center gap-3 text-xs sm:grid-cols-[140px_1fr_70px_110px]">
                  <button onClick={() => onOpen(e.id)} className="flex min-w-0 items-center gap-2 text-left text-xs font-bold hover:underline" title={e.name}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: e.color }} />
                    <span className="truncate">{e.short}</span>
                    {e.target?.estimated && <span className="shrink-0 text-[#c8202a]">*</span>}
                  </button>
                  {v == null ? (
                    <span className="rounded-md border border-dashed border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">{e.pending ?? "Sin dato"}</span>
                  ) : (
                    <div title={`${fmtValue(v, "pct")} · ${sm!.label}`}>
                      <div className="relative h-3 rounded-full bg-secondary">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, v)}%`, background: sm!.color }} />
                        {[70, 90].map((m) => <span key={m} className="absolute -top-1 bottom-[-4px] border-l border-dashed border-[#0d2438]/50" style={{ left: `${m}%` }} />)}
                      </div>
                      <p className="mt-1 hidden font-mono text-[10px] text-muted-foreground sm:block">{fmtValue(ing, "cop")} de {fmtValue(t, "cop")}</p>
                    </div>
                  )}
                  <span className="text-right font-mono font-semibold">{fmtValue(v, "pct")}</span>
                  <span className="hidden justify-end whitespace-nowrap sm:flex"><SemaforoBadge value={v} /></span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">Ingresos operacionales {periodLabel({ kind: "year" }).toLowerCase()} ÷ ingresos operacionales de todo {PREV} (cierre a diciembre). Las líneas punteadas marcan 70% y 90%. * Valor estimado.</p>
        </Panel>
      )}

      <Panel eyebrow={`RANKING · ${periodLabel(period).toUpperCase()}`} title="Tablero comparativo de CDAs" right={<span className="text-[11px] text-muted-foreground">Clic en una fila para abrir la ficha</span>}>
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[980px] whitespace-nowrap text-left text-xs">
            <thead>
              <tr className="border-y border-border bg-secondary/50 font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                {["#", "CDA", "Ingresos op.", "Part.", `Var. ${PREV}`, "EBITDA", "Margen EBITDA", "Resultado", "Servicios", `Var. ${PREV}`, "Ingreso / serv.", ""].map((h, i) => (
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
                        <p className="font-bold">{r.e.short}{r.e.estimated && <span className="text-[#c8202a]" title={r.e.estimated}> *</span>}{r.e.pending && <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800" title={r.e.pending}>{r.e.fin.ingOp ? "Parcial" : "Pendiente"}</span>}</p>
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
          “—” = el Excel de origen no trae ese dato o aún no se ha cargado. * ITAC Norte y Sur: {ENTITIES.find((e) => e.estimated)?.estimated}
        </p>
      </Panel>
    </div>
  );
}
