import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";
import { ENTITIES, MONTHS, MONTHS_LONG, byId, downloadCSV, finSum, fmtAxis, fmtPct, fmtValue, metric, periodLabel, periodMonths, variation, type Period } from "../data/metrics";
import type { FinKey, ServiceKey } from "../data/types";
import { ChartTip, Delta, GRID, Kpi, Legend, Missing, Panel, PREV_COLOR, axisTick } from "./ui";

const EXPENSES: { key: FinKey; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "servicios", label: "Servicios" },
  { key: "honorarios", label: "Honorarios" },
  { key: "mantenimiento", label: "Mantenimiento" },
  { key: "depreciaciones", label: "Depreciaciones" },
  { key: "impuestos", label: "Impuestos" },
  { key: "diversos", label: "Diversos" },
  { key: "arrendamientos", label: "Arrendamientos" },
  { key: "amortizaciones", label: "Amortizaciones" },
  { key: "seguros", label: "Seguros" },
  { key: "gastAdmin", label: "Administración (cta 51)" },
  { key: "gastVentas", label: "Ventas (cta 52)" },
];

const SERVICES: { key: ServiceKey; label: string; color: string }[] = [
  { key: "rtm_livianos", label: "RTM livianos", color: "#2a78d6" },
  { key: "rtm_motos", label: "RTM motos", color: "#e42b35" },
  { key: "rtm_pesados", label: "RTM pesados", color: "#1baf7a" },
  { key: "prev_livianos", label: "Prev. livianos", color: "#eda100" },
  { key: "prev_pesados", label: "Prev. pesados", color: "#8a5cc2" },
  { key: "prev_motos", label: "Prev. motos", color: "#e87ba4" },
];

const PNL: { key: FinKey; label: string; strong?: boolean; expense?: boolean }[] = [
  { key: "ingOp", label: "Ingresos operacionales" },
  { key: "ingNoOp", label: "Ingresos no operacionales" },
  { key: "ingTotal", label: "Total ingresos", strong: true },
  ...EXPENSES.map((e) => ({ ...e, expense: true })),
  { key: "gastOp", label: "Total gastos operacionales", strong: true, expense: true },
  { key: "financieros", label: "Financieros", expense: true },
  { key: "noOp", label: "Total no operacionales", expense: true },
  { key: "gastTotal", label: "Total gastos", strong: true, expense: true },
  { key: "resultado", label: "Resultado antes de impuestos", strong: true },
  { key: "ebitda", label: "EBITDA", strong: true },
];

export function CdaDetail({ id, period, onChange }: { id: string; period: Period; onChange: (id: string) => void }) {
  const e = byId(id);
  const idx = periodMonths(period);
  const ing = metric(e, "ingresos", idx);
  const has = (k: FinKey) => !!e.fin[k];

  const monthly = MONTHS.map((m, i) => ({
    m, i, inPeriod: idx.includes(i),
    y25: e.fin.ingOp?.y25[i] ?? null,
    y24: e.fin.ingOp?.y24[i] ?? null,
    ppto: e.fin.ingOp?.ppto?.[i] ?? null,
    ebitda: e.fin.ebitda?.y25[i] ?? null,
    res: e.fin.resultado?.y25[i] ?? null,
  }));

  const expenses = EXPENSES.filter((x) => has(x.key))
    .map((x) => ({ ...x, v: finSum(e, x.key, idx) ?? 0, prev: finSum(e, x.key, idx, "y24") ?? 0 }))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v);
  const expTotal = finSum(e, "gastOp", idx) ?? 0;

  const servKeys = SERVICES.filter((s) => e.services?.[s.key]);
  const servData = MONTHS.map((m, i) => {
    const r: Record<string, number | string> = { m, i };
    servKeys.forEach((s) => (r[s.key] = e.services![s.key]!.y25[i]));
    return r;
  });

  const exportPnl = () =>
    downloadCSV(`estado-resultados-${e.id}-${periodLabel(period).replace(/\s/g, "-")}.csv`, [
      ["Concepto", "2025", "2024", "Variación %"],
      ...PNL.filter((p) => has(p.key)).map((p) => {
        const a = finSum(e, p.key, idx), b = finSum(e, p.key, idx, "y24");
        return [p.label, a, b, variation(a, b)];
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {ENTITIES.map((x) => (
          <button
            key={x.id}
            onClick={() => onChange(x.id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${x.id === id ? "border-[#0d2438] bg-[#0d2438] text-white" : "border-border bg-white text-muted-foreground hover:text-foreground"}`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: x.color }} />
            {x.short}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-border bg-[#fffefa] p-5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">FICHA INDIVIDUAL · {e.city.toUpperCase()}</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{e.name}</h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><FileSpreadsheet size={12} className="text-emerald-700" /> {e.source}</p>
        </div>
        <button onClick={exportPnl} className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold hover:bg-secondary">
          <Download size={14} /> Exportar estado de resultados (CSV)
        </button>
      </div>

      {e.estimated && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <b>Valores financieros estimados.</b> {e.estimated} Los servicios sí son los reales de la sede.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Ingresos operacionales" value={fmtValue(ing, "cop")} delta={variation(ing, metric(e, "ingresos", idx, "y24"))} accent={e.color} />
        <Kpi label="EBITDA" value={fmtValue(metric(e, "ebitda", idx), "cop")} delta={has("ebitda") ? variation(metric(e, "ebitda", idx), metric(e, "ebitda", idx, "y24")) : undefined} note={has("ebitda") ? `Margen ${fmtValue(metric(e, "margenEbitda", idx), "pct")}` : "No reportado en el Excel"} />
        <Kpi label="Resultado antes de imp." value={fmtValue(metric(e, "resultado", idx), "cop")} delta={variation(metric(e, "resultado", idx), metric(e, "resultado", idx, "y24"))} note={`Margen neto ${fmtValue(metric(e, "margenNeto", idx), "pct")}`} />
        <Kpi label="Servicios" value={fmtValue(metric(e, "servicios", idx), "count")} delta={e.services ? variation(metric(e, "servicios", idx), metric(e, "servicios", idx, "y24")) : undefined} note={e.services ? `${fmtValue(metric(e, "rtm", idx), "count")} RTM · ${fmtValue(metric(e, "preventivas", idx), "count")} prev.` : "Sin hoja de servicios"} />
        <Kpi label="Ingreso por servicio" value={fmtValue(metric(e, "ticket", idx), "cop", false)} delta={e.services ? variation(metric(e, "ticket", idx), metric(e, "ticket", idx, "y24")) : undefined} note={e.services ? undefined : "Requiere servicios"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          eyebrow="INGRESOS OPERACIONALES"
          title="Mensual 2025 vs 2024"
          right={<Legend items={[{ label: "2025", color: e.color }, { label: "2024", color: PREV_COLOR }, ...(e.fin.ingOp?.ppto ? [{ label: "Presupuesto", color: "#0d2438", dashed: true }] : [])]} />}
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 5" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} width={46} tickFormatter={(v) => fmtAxis(v, "cop")} />
                <Tooltip
                  cursor={{ fill: "#f2f0eb" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <ChartTip
                        title={MONTHS_LONG[p.i]}
                        rows={[
                          { name: "2025", color: e.color, value: fmtValue(p.y25, "cop") },
                          { name: "2024", color: PREV_COLOR, value: fmtValue(p.y24, "cop") },
                          ...(p.ppto ? [{ name: "Presupuesto", color: "#0d2438", dashed: true, value: fmtValue(p.ppto, "cop") }] : []),
                          { name: "Var. vs 2024", value: fmtPct(variation(p.y25, p.y24)) },
                        ]}
                      />
                    );
                  }}
                />
                <Bar dataKey="y25" radius={[4, 4, 0, 0]} barSize={11}>
                  {monthly.map((d) => <Cell key={d.m} fill={e.color} fillOpacity={d.inPeriod ? 1 : 0.3} />)}
                </Bar>
                <Bar dataKey="y24" radius={[4, 4, 0, 0]} barSize={11}>
                  {monthly.map((d) => <Cell key={d.m} fill={PREV_COLOR} fillOpacity={d.inPeriod ? 1 : 0.35} />)}
                </Bar>
                {e.fin.ingOp?.ppto && <Line dataKey="ppto" stroke="#0d2438" strokeDasharray="5 4" strokeWidth={2} dot={false} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel eyebrow="RENTABILIDAD" title={has("ebitda") ? "EBITDA y resultado mensual 2025" : "Resultado mensual 2025"} right={<Legend items={[...(has("ebitda") ? [{ label: "EBITDA", color: "#0d2438" }] : []), { label: "Resultado", color: "#df9d37" }]} />}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 5" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} width={46} tickFormatter={(v) => fmtAxis(v, "cop")} />
                <ReferenceLine y={0} stroke="#9aa5ad" />
                <Tooltip
                  cursor={{ fill: "#f2f0eb" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return <ChartTip title={MONTHS_LONG[p.i]} rows={[...(has("ebitda") ? [{ name: "EBITDA", color: "#0d2438", value: fmtValue(p.ebitda, "cop") }] : []), { name: "Resultado", color: "#df9d37", value: fmtValue(p.res, "cop") }]} />;
                  }}
                />
                {has("ebitda") && (
                  <Bar dataKey="ebitda" radius={[4, 4, 0, 0]} barSize={11}>
                    {monthly.map((d) => <Cell key={d.m} fill="#0d2438" fillOpacity={d.inPeriod ? 1 : 0.3} />)}
                  </Bar>
                )}
                <Bar dataKey="res" radius={[4, 4, 0, 0]} barSize={11}>
                  {monthly.map((d) => <Cell key={d.m} fill="#df9d37" fillOpacity={d.inPeriod ? 1 : 0.35} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel eyebrow={`GASTOS · ${periodLabel(period).toUpperCase()}`} title="Estructura de gastos operacionales" right={<span className="font-mono text-[11px] text-muted-foreground">Total {fmtValue(expTotal, "cop")}</span>}>
          <div className="space-y-2.5">
            {expenses.map((x) => {
              const share = expTotal ? (x.v / expTotal) * 100 : 0;
              return (
                <div key={x.key} className="group grid grid-cols-[130px_1fr_150px] items-center gap-3 text-xs" title={`2024: ${fmtValue(x.prev, "cop")}`}>
                  <span className="truncate font-semibold">{x.label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-[#15384f] transition-all group-hover:bg-[#e42b35]" style={{ width: `${Math.max(1.5, share)}%` }} />
                  </div>
                  <span className="flex items-center justify-end gap-2 font-mono">
                    {fmtValue(x.v, "cop")}
                    <span className="w-10 text-right text-[10px] text-muted-foreground">{share.toFixed(0)}%</span>
                  </span>
                </div>
              );
            })}
          </div>
          {e.id === "tecnosabana" && <p className="mt-4 text-[11px] text-muted-foreground">Tecnosabana solo reporta gastos agregados por cuenta (51 administración, 52 ventas).</p>}
        </Panel>

        <Panel eyebrow="OPERACIÓN" title="Servicios por tipo · 2025" right={servKeys.length ? <Legend items={servKeys.map((s) => ({ label: s.label, color: s.color }))} /> : undefined}>
          {servKeys.length ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="3 5" />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={axisTick} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={axisTick} width={40} tickFormatter={(v) => fmtAxis(v, "count")} />
                  <Tooltip
                    cursor={{ fill: "#f2f0eb" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      const tot = servKeys.reduce((a, s) => a + Number(p[s.key] ?? 0), 0);
                      return <ChartTip title={`${MONTHS_LONG[p.i]} · ${tot.toLocaleString("es-CO")} servicios`} rows={[...servKeys].reverse().map((s) => ({ name: s.label, color: s.color, value: Number(p[s.key]).toLocaleString("es-CO") }))} />;
                    }}
                  />
                  {servKeys.map((s, i) => (
                    <Bar key={s.key} dataKey={s.key} stackId="s" fill={s.color} stroke="#fffefa" strokeWidth={1} radius={i === servKeys.length - 1 ? [4, 4, 0, 0] : 0} barSize={18} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Missing>Este Excel no trae hoja de cantidad de servicios.<br />Se podrá cargar desde “Carga de datos”.</Missing>
          )}
        </Panel>
      </div>

      <Panel eyebrow={`ESTADO DE RESULTADOS · ${periodLabel(period).toUpperCase()}`} title="Resumen contable" right={<span className="text-[11px] text-muted-foreground">Valores en pesos colombianos</span>}>
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-y border-border bg-secondary/50 font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                <th className="py-2.5 pl-5 text-left font-semibold sm:pl-6">CONCEPTO</th>
                <th className="px-3 text-right font-semibold">2025</th>
                <th className="px-3 text-right font-semibold">% ING.</th>
                <th className="px-3 text-right font-semibold">2024</th>
                <th className="px-3 pr-5 text-right font-semibold sm:pr-6">VARIACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {PNL.filter((p) => has(p.key)).map((p) => {
                const a = finSum(e, p.key, idx), b = finSum(e, p.key, idx, "y24");
                return (
                  <tr key={p.key} className={`border-b border-border/60 ${p.strong ? "bg-[#fffefa] font-bold" : ""}`}>
                    <td className={`py-2.5 pl-5 sm:pl-6 ${p.expense && !p.strong ? "pl-8 text-muted-foreground sm:pl-9" : ""}`}>{p.label}</td>
                    <td className={`px-3 text-right font-mono ${(a ?? 0) < 0 ? "text-red-700" : ""}`}>{fmtValue(a, "cop", false)}</td>
                    <td className="px-3 text-right font-mono text-muted-foreground">{ing && a != null ? fmtValue((a / ing) * 100, "pct") : "—"}</td>
                    <td className="px-3 text-right font-mono text-muted-foreground">{fmtValue(b, "cop", false)}</td>
                    <td className="px-3 pr-5 text-right sm:pr-6"><Delta value={variation(a, b)} invert={p.expense} suffix="" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
