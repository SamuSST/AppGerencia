import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { CUR, ENTITIES, PREV, downloadCSV, finSum, fmtPct, fmtValue, periodLabel, periodMonths, variation, type Period } from "../data/metrics";
import type { Entity, FinKey } from "../data/types";
import { ChartTip, GRID, Legend, Panel, Segmented, axisTick } from "./ui";

/** Conceptos de gasto operacional que traen los Mapa Tipo. "Otros" = total − suma de conceptos. */
const CONCEPTS: { key: FinKey; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "servicios", label: "Servicios" },
  { key: "honorarios", label: "Honorarios" },
  { key: "depreciaciones", label: "Depreciaciones" },
  { key: "arrendamientos", label: "Arrendamientos" },
  { key: "mantenimiento", label: "Mantenimiento" },
  { key: "impuestos", label: "Impuestos" },
  { key: "diversos", label: "Diversos" },
  { key: "amortizaciones", label: "Amortizaciones" },
  { key: "seguros", label: "Seguros" },
];
const OTHER = "otros";

// Paleta categórica validada (orden fijo) + gris para "Otros"
const CHART_CONCEPTS: { key: string; label: string; color: string }[] = [
  { key: "personal", label: "Personal", color: "#2a78d6" },
  { key: "servicios", label: "Servicios", color: "#e42b35" },
  { key: "honorarios", label: "Honorarios", color: "#1baf7a" },
  { key: "depreciaciones", label: "Depreciaciones", color: "#eda100" },
  { key: "arrendamientos", label: "Arrendamientos", color: "#8a5cc2" },
  { key: "mantenimiento", label: "Mantenimiento", color: "#e87ba4" },
  { key: "resto", label: "Resto de conceptos", color: "#a9b7c1" },
];

type Mode = "valor" | "pctGasto" | "pctIng" | "var";

export function ExpenseCompare({ period, selected }: { period: Period; selected: string[] }) {
  const [mode, setMode] = useState<Mode>("valor");
  const idx = periodMonths(period);

  const hasDetail = (e: Entity) => CONCEPTS.some((c) => e.fin[c.key]);
  const ents = ENTITIES.filter((e) => selected.includes(e.id) && e.fin.gastOp)
    .sort((a, b) => (finSum(b, "gastOp", idx) ?? 0) - (finSum(a, "gastOp", idx) ?? 0));
  const detailed = ents.filter(hasDetail);
  const aggregated = ents.filter((e) => !hasDetail(e));

  const val = (e: Entity, key: string, y: "cur" | "prev" = "cur"): number | null => {
    if (!hasDetail(e)) return key === "total" ? finSum(e, "gastOp", idx, y) : null;
    if (key === "total") return finSum(e, "gastOp", idx, y);
    if (key === OTHER) {
      const tot = finSum(e, "gastOp", idx, y) ?? 0;
      return tot - CONCEPTS.reduce((a, c) => a + (finSum(e, c.key, idx, y) ?? 0), 0);
    }
    return finSum(e, key as FinKey, idx, y);
  };
  const groupVal = (key: string, y: "cur" | "prev" = "cur") => detailed.reduce((a, e) => a + (val(e, key, y) ?? 0), 0);
  const groupTotal = (y: "cur" | "prev" = "cur") => ents.reduce((a, e) => a + (val(e, "total", y) ?? 0), 0);

  const rows = [...CONCEPTS.map((c) => ({ key: c.key as string, label: c.label })).sort((a, b) => groupVal(b.key) - groupVal(a.key)), { key: OTHER, label: "Otros gastos operacionales" }];

  const display = (e: Entity | "grupo", key: string): { text: string; raw: number | null } => {
    const cur = e === "grupo" ? (key === "total" ? groupTotal() : groupVal(key)) : val(e, key);
    if (cur == null) return { text: "—", raw: null };
    if (mode === "valor") return { text: `$${Math.round(cur / 1e6).toLocaleString("es-CO")}`, raw: cur };
    if (mode === "var") {
      const prev = e === "grupo" ? (key === "total" ? groupTotal("prev") : groupVal(key, "prev")) : val(e, key, "prev");
      const v = variation(cur, prev);
      return { text: fmtPct(v), raw: v };
    }
    const pool = key === "total" ? ents : detailed;
    const ingOf = (list: Entity[]) => list.reduce((acc, x) => acc + (finSum(x, "ingOp", idx) ?? 0), 0);
    const gasOf = (list: Entity[]) => list.reduce((acc, x) => acc + (val(x, "total") ?? 0), 0);
    const base =
      mode === "pctGasto"
        ? e === "grupo" ? gasOf(pool) : val(e, "total")
        : e === "grupo" ? ingOf(pool) : finSum(e, "ingOp", idx);
    const pct = base ? (cur / base) * 100 : null;
    return { text: fmtValue(pct, "pct"), raw: pct };
  };

  // Sombreado por fila (secuencial, un solo tono): más oscuro = mayor valor entre los CDAs
  const shade = (key: string, raw: number | null) => {
    if (raw == null || mode === "var") return undefined;
    const vals = detailed.map((e) => display(e, key).raw ?? 0);
    const max = Math.max(...vals);
    if (!max) return undefined;
    return `rgba(21, 56, 79, ${0.04 + (raw / max) * 0.22})`;
  };
  const varColor = (raw: number | null) => (mode !== "var" || raw == null ? "" : raw > 0 ? "text-red-700" : "text-emerald-800");

  const chartData = detailed.map((e) => {
    const tot = val(e, "total") ?? 0;
    const r: Record<string, number | string> = { name: e.short, total: tot };
    let used = 0;
    CHART_CONCEPTS.slice(0, -1).forEach((c) => {
      const v = Math.max(0, val(e, c.key) ?? 0);
      r[c.key] = tot ? (v / tot) * 100 : 0;
      r[`${c.key}_v`] = v;
      used += v;
    });
    r.resto = tot ? (Math.max(0, tot - used) / tot) * 100 : 0;
    r.resto_v = Math.max(0, tot - used);
    return r;
  });

  const exportCSV = () =>
    downloadCSV(`gastos-por-concepto-${periodLabel(period).replace(/\s/g, "-")}.csv`, [
      ["Concepto", ...ents.map((e) => e.short), "Total grupo"],
      ...rows.map((r) => [r.label, ...ents.map((e) => val(e, r.key)), groupVal(r.key)]),
      ["Total gastos operacionales", ...ents.map((e) => val(e, "total")), groupTotal()],
    ]);

  if (!ents.length) return null;

  return (
    <>
      <Panel
        eyebrow={`GASTOS OPERACIONALES · ${periodLabel(period).toUpperCase()}`}
        title={mode === "valor" ? "Gastos por concepto · todos los CDAs (millones de pesos)" : "Gastos por concepto · todos los CDAs"}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "valor", label: "Valor" },
                { value: "pctGasto", label: "% del gasto" },
                { value: "pctIng", label: "% de ingresos" },
                { value: "var", label: `Var. vs ${PREV}` },
              ]}
            />
            <button onClick={exportCSV} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold hover:bg-secondary">
              <Download size={13} /> CSV
            </button>
          </div>
        }
      >
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[820px] whitespace-nowrap text-xs">
            <thead>
              <tr className="border-y border-border bg-secondary/50 font-mono text-[10px] tracking-[0.06em] text-muted-foreground">
                <th className="sticky left-0 bg-[#f3f1ec] py-2.5 pl-5 pr-3 text-left font-semibold sm:pl-6">CONCEPTO</th>
                {ents.map((e) => (
                  <th key={e.id} className="px-3 text-right font-semibold">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: e.color }} />{e.short.toUpperCase()}</span>
                  </th>
                ))}
                <th className="px-3 pr-5 text-right font-semibold text-foreground sm:pr-6">TOTAL GRUPO</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border/60">
                  <td className={`sticky left-0 bg-card py-2.5 pl-5 pr-3 font-semibold sm:pl-6 ${r.key === OTHER ? "text-muted-foreground" : ""}`}>{r.label}</td>
                  {ents.map((e) => {
                    const d = display(e, r.key);
                    return (
                      <td key={e.id} className={`px-3 text-right font-mono ${varColor(d.raw)}`} style={{ background: shade(r.key, d.raw) }} title={`${e.short} · ${r.label}`}>
                        {d.text}
                      </td>
                    );
                  })}
                  <td className={`px-3 pr-5 text-right font-mono font-semibold sm:pr-6 ${varColor(display("grupo", r.key).raw)}`}>{display("grupo", r.key).text}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#0d2438] bg-[#0d2438]/[0.04] font-bold">
                <td className="sticky left-0 bg-[#f1f1f0] py-3 pl-5 pr-3 sm:pl-6">Total gastos operacionales</td>
                {ents.map((e) => {
                  const d = display(e, "total");
                  return <td key={e.id} className={`px-3 text-right font-mono ${varColor(d.raw)}`}>{mode === "pctGasto" ? "100%" : d.text}</td>;
                })}
                <td className={`px-3 pr-5 text-right font-mono sm:pr-6 ${varColor(display("grupo", "total").raw)}`}>{mode === "pctGasto" ? "100%" : display("grupo", "total").text}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Columnas ordenadas de mayor a menor gasto. El tono más oscuro marca el CDA con el valor más alto en cada concepto.
          {aggregated.length > 0 && ` ${aggregated.map((e) => e.short).join(", ")}: su Excel de este período solo trae el gasto total (sin detalle por concepto), por eso aparece “—” en los conceptos y no entra en el total por concepto del grupo.`}
          {mode === "var" && " En variación, rojo = el gasto subió y verde = bajó."}
          {" "}“Otros” = conceptos menores del Mapa Tipo (contribuciones, gastos legales, adecuaciones, viajes, etc.).
        </p>
      </Panel>

      {detailed.length > 0 && (
        <Panel eyebrow="COMPOSICIÓN DEL GASTO" title="¿En qué se va el gasto de cada CDA?" right={<Legend items={CHART_CONCEPTS.map((c) => ({ label: c.label, color: c.color }))} />}>
          <div style={{ height: Math.max(220, detailed.length * 46) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={GRID} strokeDasharray="3 5" />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} allowDataOverflow axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(v) => `${Math.round(v)}%`} />
                <YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fill: "#263744", fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: "#f2f0eb" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <ChartTip
                        title={`${p.name} · ${fmtValue(p.total, "cop")}`}
                        rows={CHART_CONCEPTS.map((c) => ({ name: c.label, color: c.color, value: `${fmtValue(p[c.key], "pct")} · ${fmtValue(p[`${c.key}_v`], "cop")}` }))}
                      />
                    );
                  }}
                />
                {CHART_CONCEPTS.map((c, i) => (
                  <Bar key={c.key} dataKey={c.key} stackId="g" fill={c.color} stroke="#fffefa" strokeWidth={2} barSize={22} radius={i === CHART_CONCEPTS.length - 1 ? [0, 4, 4, 0] : 0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Cada barra es el 100% del gasto operacional del CDA en {periodLabel(period).toLowerCase()} ({CUR}).</p>
        </Panel>
      )}
    </>
  );
}
