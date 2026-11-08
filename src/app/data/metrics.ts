import { ENTITIES } from "./cardisel";
import type { Entity, FinKey, ServiceKey } from "./types";

export { ENTITIES };
export type Year = "y25" | "y24";

export const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
export const MONTHS_LONG = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export type Period = { kind: "year" } | { kind: "quarter"; q: number } | { kind: "month"; m: number };

export const periodMonths = (p: Period): number[] => {
  if (p.kind === "year") return [...Array(12).keys()];
  if (p.kind === "quarter") return [0, 1, 2].map((i) => (p.q - 1) * 3 + i);
  return [p.m];
};

export const periodLabel = (p: Period) =>
  p.kind === "year" ? "Año 2025" : p.kind === "quarter" ? `T${p.q} 2025` : `${MONTHS_LONG[p.m]} 2025`;

export const byId = (id: string) => ENTITIES.find((e) => e.id === id)!;

const sumIdx = (arr: number[] | undefined, idx: number[]) =>
  arr ? idx.reduce((acc, i) => acc + (arr[i] ?? 0), 0) : null;

export const finSum = (e: Entity, key: FinKey, idx: number[], y: Year = "y25") =>
  sumIdx(e.fin[key]?.[y], idx);

const SERVICE_KEYS: ServiceKey[] = ["rtm_motos", "rtm_livianos", "rtm_pesados", "prev_motos", "prev_livianos", "prev_pesados"];

export const servSum = (e: Entity, idx: number[], y: Year = "y25", filter: (k: ServiceKey) => boolean = () => true) => {
  if (!e.services) return null;
  return SERVICE_KEYS.filter(filter).reduce((acc, k) => acc + (sumIdx(e.services![k]?.[y], idx) ?? 0), 0);
};

export type MetricKey =
  | "ingresos" | "gastos" | "ebitda" | "resultado" | "margenEbitda" | "margenNeto"
  | "servicios" | "rtm" | "preventivas" | "ticket";

export type Unit = "cop" | "pct" | "count";

export const METRICS: { key: MetricKey; label: string; unit: Unit; hint: string }[] = [
  { key: "ingresos", label: "Ingresos operacionales", unit: "cop", hint: "Cuenta 41" },
  { key: "gastos", label: "Gastos operacionales", unit: "cop", hint: "Total gastos operacionales" },
  { key: "ebitda", label: "EBITDA", unit: "cop", hint: "Total EBITDA del Mapa Tipo" },
  { key: "resultado", label: "Resultado antes de impuestos", unit: "cop", hint: "Resultado neto antes de impuestos" },
  { key: "margenEbitda", label: "Margen EBITDA", unit: "pct", hint: "EBITDA / ingresos operacionales" },
  { key: "margenNeto", label: "Margen neto", unit: "pct", hint: "Resultado / ingresos operacionales" },
  { key: "servicios", label: "Servicios totales", unit: "count", hint: "RTM + preventivas" },
  { key: "rtm", label: "Revisiones RTM", unit: "count", hint: "Motos, livianos y pesados" },
  { key: "preventivas", label: "Preventivas", unit: "count", hint: "Revisiones preventivas" },
  { key: "ticket", label: "Ingreso por servicio", unit: "cop", hint: "Ingresos op. / servicios" },
];

export const metricDef = (k: MetricKey) => METRICS.find((m) => m.key === k)!;

export function metric(e: Entity, k: MetricKey, idx: number[], y: Year = "y25"): number | null {
  const ing = finSum(e, "ingOp", idx, y);
  switch (k) {
    case "ingresos": return ing;
    case "gastos": return finSum(e, "gastOp", idx, y);
    case "ebitda": return finSum(e, "ebitda", idx, y);
    case "resultado": return finSum(e, "resultado", idx, y);
    case "margenEbitda": {
      const eb = finSum(e, "ebitda", idx, y);
      return eb == null || !ing ? null : (eb / ing) * 100;
    }
    case "margenNeto": {
      const r = finSum(e, "resultado", idx, y);
      return r == null || !ing ? null : (r / ing) * 100;
    }
    case "servicios": return servSum(e, idx, y);
    case "rtm": return servSum(e, idx, y, (s) => s.startsWith("rtm"));
    case "preventivas": return servSum(e, idx, y, (s) => s.startsWith("prev"));
    case "ticket": {
      const s = servSum(e, idx, y);
      return s && ing ? ing / s : null;
    }
  }
}

export const variation = (cur: number | null, prev: number | null) =>
  cur == null || prev == null || prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100;

const nf = (d = 0) => new Intl.NumberFormat("es-CO", { maximumFractionDigits: d, minimumFractionDigits: d });

export const fmtCOP = (v: number | null, compact = true) => {
  if (v == null) return "—";
  const sign = v < 0 ? "-" : "";
  const a = Math.abs(v);
  if (!compact) return `${sign}$${nf().format(Math.round(a))}`;
  if (a >= 1e9) return `${sign}$${nf(2).format(a / 1e9)} mil M`;
  if (a >= 1e6) return `${sign}$${nf(0).format(a / 1e6)} M`;
  return `${sign}$${nf().format(Math.round(a))}`;
};

export const fmtValue = (v: number | null, unit: Unit, compact = true) => {
  if (v == null) return "—";
  if (unit === "pct") return `${nf(1).format(v)}%`;
  if (unit === "count") return nf().format(Math.round(v));
  return fmtCOP(v, compact);
};

export const fmtAxis = (v: number, unit: Unit) => {
  if (unit === "pct") return `${Math.round(v)}%`;
  if (unit === "count") return v >= 1000 ? `${nf(1).format(v / 1000)}k` : `${v}`;
  const a = Math.abs(v);
  if (a >= 1e9) return `${nf(1).format(v / 1e9)}MM`;
  if (a >= 1e6) return `${Math.round(v / 1e6)}M`;
  return `${Math.round(v / 1e3)}k`;
};

export const fmtPct = (v: number | null) => (v == null ? "—" : `${v >= 0 ? "+" : ""}${nf(1).format(v)}%`);

export function downloadCSV(filename: string, rows: (string | number | null)[][]) {
  const csv = rows
    .map((r) => r.map((c) => (c == null ? "" : typeof c === "number" ? String(Math.round(c * 100) / 100) : `"${c.replace(/"/g, '""')}"`)).join(";"))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
