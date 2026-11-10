import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { CUR, ENTITIES, PREV, downloadCSV, finSum, fmtPct, fmtValue, periodLabel, periodMonths, variation, type MetricKey, type Period } from "../data/metrics";
import type { Entity, FinKey } from "../data/types";
import { ChartTip, GRID, Legend, Panel, Segmented, axisTick } from "./ui";

type Concept = { key: FinKey; label: string };
type Config = {
  total: FinKey;
  totalLabel: string;
  title: string;
  chartTitle: string;
  concepts: Concept[];
  otherLabel: string;
  /** true = que suba es bueno (ingresos); false = que suba es malo (gastos). */
  upIsGood: boolean;
  missingNote: string;
  otherNote?: string;
};

const OP_EXPENSES: Concept[] = [
  { key: "personal", label: "Personal" },
  { key: "servicios", label: "Servicios" },
  { key: "honorarios", label: "Honorarios" },
  { key: "depreciaciones", label: "Depreciaciones" },
  { key: "depNiif", label: "Depreciaciones NIIF" },
  { key: "arrendamientos", label: "Arrendamientos" },
  { key: "mantenimiento", label: "Mantenimiento y reparaciones" },
  { key: "impuestos", label: "Impuestos" },
  { key: "diversos", label: "Diversos" },
  { key: "amortizaciones", label: "Amortizaciones" },
  { key: "adecuacion", label: "Adecuación e instalación" },
  { key: "viaje", label: "Gastos de viaje" },
  { key: "seguros", label: "Seguros" },
  { key: "contribuciones", label: "Contribuciones y afiliaciones" },
  { key: "legales", label: "Gastos legales" },
];

/** Qué desglose mostrar según el indicador elegido en Comparar CDAs. */
export const CONFIGS: Partial<Record<MetricKey, Config>> = {
  gastos: {
    total: "gastOp", totalLabel: "Total gastos operacionales", title: "Gastos operacionales por concepto", chartTitle: "¿En qué se va el gasto operacional de cada CDA?",
    concepts: OP_EXPENSES, otherLabel: "Otros gastos operacionales", upIsGood: false,
    missingNote: "su Excel de este período solo trae el gasto operacional total (sin detalle por concepto)",
    otherNote: "“Otros” = diferencia entre el total y los conceptos listados (p. ej. deudores provisión).",
  },
  gastNoOp: {
    total: "noOp", totalLabel: "Total gastos no operacionales", title: "Gastos no operacionales por concepto", chartTitle: "¿En qué se va el gasto no operacional de cada CDA?",
    concepts: [
      { key: "financieros", label: "Financieros" },
      { key: "intNiif", label: "Intereses NIIF" },
      { key: "extraordinarios", label: "Extraordinarios y diversos" },
    ],
    otherLabel: "Otros no operacionales", upIsGood: false,
    missingNote: "su Excel de este período solo trae el total no operacional (sin detalle por concepto)",
  },
  gastTotal: {
    total: "gastTotal", totalLabel: "Total gastos", title: "Composición del gasto total", chartTitle: "¿Cómo se compone el gasto total de cada CDA?",
    concepts: [
      { key: "gastOp", label: "Gastos operacionales" },
      { key: "noOp", label: "Gastos no operacionales" },
    ],
    otherLabel: "Otros", upIsGood: false, missingNote: "sin detalle",
  },
  ingNoOp: {
    total: "ingNoOp", totalLabel: "Total ingresos no operacionales", title: "Ingresos no operacionales por concepto", chartTitle: "¿De dónde vienen los ingresos no operacionales?",
    concepts: [
      { key: "inoFinancieros", label: "Financieros" },
      { key: "inoArrendamientos", label: "Arrendamientos" },
      { key: "inoRecuperaciones", label: "Recuperaciones" },
      { key: "inoIndemnizaciones", label: "Indemnizaciones" },
      { key: "inoVentaBienes", label: "Utilidad en venta de bienes" },
      { key: "inoDiversos", label: "Diversos" },
    ],
    otherLabel: "Otros ingresos no operacionales", upIsGood: true,
    missingNote: "su Mapa Tipo trae solo el total de ingresos no operacionales; para ver el detalle hace falta la hoja “ING NO OPERAC” (hoy solo la trae Unimilenio)",
  },
  ingresos: {
    total: "ingTotal", totalLabel: "Total ingresos", title: "Ingresos por tipo", chartTitle: "¿De dónde vienen los ingresos de cada CDA?",
    concepts: [
      { key: "ingOp", label: "Ingresos operacionales" },
      { key: "ingNoOp", label: "Ingresos no operacionales" },
    ],
    otherLabel: "Otros", upIsGood: true, missingNote: "sin detalle",
  },
};
CONFIGS.ingTotal = CONFIGS.ingresos;

// Paleta categórica validada (orden fijo) + gris para el resto
const PALETTE = ["#2a78d6", "#e42b35", "#1baf7a", "#eda100", "#8a5cc2", "#e87ba4"];
const REST = "#a9b7c1";
const OTHER = "__otros";

type Mode = "valor" | "pctTotal" | "pctIng" | "var";

export function ConceptCompare({ metricKey, period, selected }: { metricKey: MetricKey; period: Period; selected: string[] }) {
  const cfg = CONFIGS[metricKey];
  const [mode, setMode] = useState<Mode>("valor");
  if (!cfg) return null;
  const idx = periodMonths(period);

  const hasDetail = (e: Entity) => cfg.concepts.some((c) => e.fin[c.key]);
  const ents = ENTITIES.filter((e) => selected.includes(e.id) && e.fin[cfg.total])
    .sort((a, b) => (finSum(b, cfg.total, idx) ?? 0) - (finSum(a, cfg.total, idx) ?? 0));
  const detailed = ents.filter(hasDetail);
  const aggregated = ents.filter((e) => !hasDetail(e));

  const val = (e: Entity, key: string, y: "cur" | "prev" = "cur"): number | null => {
    if (key === "total") return finSum(e, cfg.total, idx, y);
    if (!hasDetail(e)) return null;
    if (key === OTHER) {
      const tot = finSum(e, cfg.total, idx, y) ?? 0;
      return tot - cfg.concepts.reduce((a, c) => a + (finSum(e, c.key, idx, y) ?? 0), 0);
    }
    return finSum(e, key as FinKey, idx, y) ?? 0;
  };
  const sumOf = (list: Entity[], key: string, y: "cur" | "prev" = "cur") => list.reduce((a, e) => a + (val(e, key, y) ?? 0), 0);
  const groupVal = (key: string, y: "cur" | "prev" = "cur") => sumOf(key === "total" ? ents : detailed, key, y);

  const groupTotalDetailed = Math.abs(sumOf(detailed, "total")) || 1;
  const otherIsRelevant = Math.abs(groupVal(OTHER)) > groupTotalDetailed * 0.005;
  const conceptRows = cfg.concepts
    .map((c) => ({ key: c.key as string, label: c.label }))
    .filter((r) => detailed.some((e) => Math.abs(val(e, r.key) ?? 0) >= 1) || detailed.some((e) => Math.abs(val(e, r.key, "prev") ?? 0) >= 1))
    .sort((a, b) => groupVal(b.key) - groupVal(a.key));
  const rows = [...conceptRows, ...(otherIsRelevant ? [{ key: OTHER, label: cfg.otherLabel }] : [])];

  const display = (e: Entity | "grupo", key: string): { text: string; raw: number | null } => {
    const cur = e === "grupo" ? groupVal(key) : val(e, key);
    if (cur == null) return { text: "—", raw: null };
    if (mode === "valor") return { text: `$${Math.round(cur / 1e6).toLocaleString("es-CO")}`, raw: cur };
    if (mode === "var") {
      const prev = e === "grupo" ? groupVal(key, "prev") : val(e, key, "prev");
      const v = variation(cur, prev);
      return { text: fmtPct(v), raw: v };
    }
    const pool = key === "total" ? ents : detailed;
    const base =
      mode === "pctTotal"
        ? e === "grupo" ? sumOf(pool, "total") : val(e, "total")
        : e === "grupo" ? pool.reduce((a, x) => a + (finSum(x, "ingOp", idx) ?? 0), 0) : finSum(e, "ingOp", idx);
    const pct = base ? (cur / base) * 100 : null;
    return { text: fmtValue(pct, "pct"), raw: pct };
  };

  // Sombreado secuencial por fila (un solo tono): más oscuro = valor más alto entre los CDAs
  const shade = (key: string, raw: number | null) => {
    if (raw == null || mode === "var") return undefined;
    const max = Math.max(...detailed.map((e) => display(e, key).raw ?? 0));
    if (!max || raw <= 0) return undefined;
    return `rgba(21, 56, 79, ${0.04 + (raw / max) * 0.22})`;
  };
  const varColor = (raw: number | null) => {
    if (mode !== "var" || raw == null || raw === 0) return "";
    const good = cfg.upIsGood ? raw > 0 : raw < 0;
    return good ? "text-emerald-800" : "text-red-700";
  };

  // Gráfica: 6 conceptos principales del grupo + "resto"
  const top = conceptRows.slice(0, conceptRows.length > 7 ? 6 : 7);
  const series = [
    ...top.map((r, i) => ({ key: r.key, label: r.label, color: PALETTE[i] ?? REST })),
    ...(rows.length > top.length ? [{ key: "__resto", label: conceptRows.length > top.length ? "Resto de conceptos" : cfg.otherLabel, color: REST }] : []),
  ];
  const chartData = detailed.map((e) => {
    const tot = val(e, "total") ?? 0;
    const r: Record<string, number | string> = { name: e.short, total: tot };
    let used = 0;
    top.forEach((c) => {
      const v = Math.max(0, val(e, c.key) ?? 0);
      r[c.key] = tot > 0 ? (v / tot) * 100 : 0;
      r[`${c.key}_v`] = v;
      used += v;
    });
    r.__resto = tot > 0 ? (Math.max(0, tot - used) / tot) * 100 : 0;
    r.__resto_v = Math.max(0, tot - used);
    return r;
  });

  const exportCSV = () =>
    downloadCSV(`${cfg.title.toLowerCase().replace(/\s+/g, "-")}-${periodLabel(period).replace(/\s/g, "-")}.csv`, [
      ["Concepto", ...ents.map((e) => e.short), "Total grupo"],
      ...rows.map((r) => [r.label, ...ents.map((e) => val(e, r.key)), groupVal(r.key)]),
      [cfg.totalLabel, ...ents.map((e) => val(e, "total")), groupVal("total")],
    ]);

  if (!ents.length) return null;
  const isExpense = !cfg.upIsGood;

  return (
    <>
      <Panel
        eyebrow={`${cfg.title.toUpperCase()} · ${periodLabel(period).toUpperCase()}`}
        title={`${cfg.title} · todos los CDAs${mode === "valor" ? " (millones de pesos)" : ""}`}
        right={
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: "valor", label: "Valor" },
                { value: "pctTotal", label: isExpense ? "% del gasto" : "% del total" },
                { value: "pctIng", label: "% de ingresos op." },
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
                <td className="sticky left-0 bg-[#f1f1f0] py-3 pl-5 pr-3 sm:pl-6">{cfg.totalLabel}</td>
                {ents.map((e) => {
                  const d = display(e, "total");
                  return <td key={e.id} className={`px-3 text-right font-mono ${varColor(d.raw)}`}>{mode === "pctTotal" ? "100%" : d.text}</td>;
                })}
                <td className={`px-3 pr-5 text-right font-mono sm:pr-6 ${varColor(display("grupo", "total").raw)}`}>{mode === "pctTotal" ? "100%" : display("grupo", "total").text}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          Columnas ordenadas de mayor a menor. El tono más oscuro marca el CDA con el valor más alto en cada concepto.
          {mode === "var" && (isExpense ? " En variación, rojo = el gasto subió y verde = bajó." : " En variación, verde = el ingreso subió y rojo = bajó.")}
          {aggregated.length > 0 && ` ${aggregated.map((e) => e.short).join(", ")}: ${cfg.missingNote}; por eso aparece “—” en los conceptos y no entra en el total por concepto del grupo.`}
          {otherIsRelevant && cfg.otherNote ? ` ${cfg.otherNote}` : ""}
        </p>
      </Panel>

      {detailed.length > 0 && rows.length > 1 && (
        <Panel eyebrow="COMPOSICIÓN" title={cfg.chartTitle} right={<Legend items={series.map((c) => ({ label: c.label, color: c.color }))} />}>
          <div style={{ height: Math.max(160, detailed.length * 46) }}>
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
                        rows={series.map((c) => ({ name: c.label, color: c.color, value: `${fmtValue(p[c.key], "pct")} · ${fmtValue(p[`${c.key}_v`], "cop")}` }))}
                      />
                    );
                  }}
                />
                {series.map((c, i) => (
                  <Bar key={c.key} dataKey={c.key} stackId="g" fill={c.color} stroke="#fffefa" strokeWidth={2} barSize={22} radius={i === series.length - 1 ? [0, 4, 4, 0] : 0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Cada barra es el 100% de “{cfg.totalLabel.toLowerCase()}” del CDA en {periodLabel(period).toLowerCase()} ({CUR}).</p>
        </Panel>
      )}
    </>
  );
}
