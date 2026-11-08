import { useRef, useState } from "react";
import { BarChart3, CalendarClock, CheckCircle2, Download, FileBarChart, FileSpreadsheet, GitCompare, Printer, UploadCloud, Wallet } from "lucide-react";
import { toast } from "sonner";
import { ENTITIES, METRICS, MONTHS_LONG, byId, downloadCSV, finSum, fmtPct, fmtValue, metric, periodLabel, periodMonths, variation, type Period } from "../data/metrics";
import { Panel } from "./ui";

type View = "grupo" | "cda" | "comparar";

export function Reports({ period, go }: { period: Period; go: (v: View, id?: string) => void }) {
  const idx = periodMonths(period);
  const grupo = byId("grupo");
  const pptoReal = grupo.fin.ingOp!.ppto!.reduce((a, v, i) => (idx.includes(i) ? a + v : a), 0);
  const real = finSum(grupo, "ingOp", idx) ?? 0;
  const exec = pptoReal ? (real / pptoReal) * 100 : 0;

  const exportGroup = () =>
    downloadCSV(`comparativo-grupo-${periodLabel(period).replace(/\s/g, "-")}.csv`, [
      ["Unidad", ...METRICS.flatMap((m) => [`${m.label} 2025`, `${m.label} 2024`])],
      ...ENTITIES.map((e) => [e.name, ...METRICS.flatMap((m) => [metric(e, m.key, idx), metric(e, m.key, idx, "y24")])]),
    ]);

  const exportServices = () =>
    downloadCSV("servicios-por-mes-2025.csv", [
      ["Unidad", "Mes", "RTM 2025", "Preventivas 2025", "Total 2025", "Total 2024"],
      ...ENTITIES.filter((e) => e.services).flatMap((e) => MONTHS_LONG.map((m, i) => [e.short, m, metric(e, "rtm", [i]), metric(e, "preventivas", [i]), metric(e, "servicios", [i]), metric(e, "servicios", [i], "y24")])),
    ]);

  const cards = [
    { icon: BarChart3, title: "Informe ejecutivo del grupo", desc: "KPIs consolidados, ranking de unidades y evolución mensual.", open: () => go("grupo"), csv: exportGroup },
    { icon: FileBarChart, title: "Ficha mensual por CDA", desc: "Estado de resultados, estructura de gastos y servicios de un CDA.", open: () => go("cda", "unimilenio") },
    { icon: GitCompare, title: "Comparativo entre CDAs", desc: "Cualquier indicador, 2025 vs 2024, contra el promedio del grupo.", open: () => go("comparar"), csv: exportGroup },
    { icon: FileSpreadsheet, title: "Servicios RTM y preventivas", desc: "Cantidad de servicios por mes y tipo (4 CDAs con hoja de servicios).", open: () => go("comparar"), csv: exportServices },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="flex flex-col rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0d2438] text-white"><c.icon size={18} /></span>
              <div>
                <h3 className="text-sm font-extrabold">{c.title}</h3>
                <p className="text-[11px] text-muted-foreground">{periodLabel(period)}</p>
              </div>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">{c.desc}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              <button onClick={c.open} className="rounded-lg bg-[#0d2438] px-3 py-2 text-xs font-bold text-white hover:bg-[#15384f]">Ver informe</button>
              {c.csv && <button onClick={c.csv} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold hover:bg-secondary"><Download size={13} /> CSV</button>}
              <button onClick={() => { c.open(); setTimeout(() => window.print(), 400); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold hover:bg-secondary"><Printer size={13} /> PDF</button>
              <button onClick={() => toast("Programación de envíos", { description: "Disponible cuando la app esté conectada al servidor de correo." })} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"><CalendarClock size={13} /> Programar envío</button>
            </div>
          </div>
        ))}
      </div>

      <Panel eyebrow="GRUPO CARDISEL · CONSOLIDADO" title="Ejecución presupuestal de ingresos" right={<Wallet size={18} className="text-[#e42b35]" />}>
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
          <div>
            <p className="text-[40px] font-extrabold leading-none tracking-[-0.04em]">{fmtValue(exec, "pct")}</p>
            <p className="mt-2 text-xs text-muted-foreground">del presupuesto de ingresos operacionales ejecutado en {periodLabel(period).toLowerCase()}</p>
          </div>
          <div className="space-y-3 text-xs">
            {[{ l: "Ejecutado 2025", v: real, c: "#0d2438" }, { l: "Presupuesto 2025", v: pptoReal, c: "#a9b7c1" }].map((r) => (
              <div key={r.l} className="grid grid-cols-[120px_1fr_110px] items-center gap-3">
                <span className="font-semibold">{r.l}</span>
                <div className="h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full" style={{ width: `${(r.v / Math.max(real, pptoReal)) * 100}%`, background: r.c }} /></div>
                <span className="text-right font-mono">{fmtValue(r.v, "cop")}</span>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Diferencia: {fmtValue(real - pptoReal, "cop")} ({fmtPct(variation(real, pptoReal))}). Solo el informe consolidado trae presupuesto separado del real; en los Mapa Tipo de cada CDA la columna de presupuesto repite el valor ejecutado.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

const SOURCES = [
  { id: "la37", file: "Mapa_Tipo_CDA_37_ENERO_A_DICIEMBRE_de__2025_final.xlsx", sheets: "Año 2025 · INGRESOS SERV" },
  { id: "inteco", file: "MAPA_TIPO__A_DICIEMBRE__2025_INTECO.xlsx", sheets: "Año 2025 · CANT SERV ING" },
  { id: "itac", file: "INFORME_Mapatipo__ITAC_A_DICIEMBRE_2025.xlsx", sheets: "AÑO 2025 · SERVICIO Q" },
  { id: "tecnosabana", file: "MAPATIPO_TECNOSABANA__A_O_2024-2025.xlsx", sheets: "AÑO 2024-2025" },
  { id: "unimilenio", file: "Mapa_Tipo_Unimilenio_A_Diciembre_2025.xlsx", sheets: "AÑO 2025 · CANT ING SERVICIOS" },
  { id: "grupo", file: "Informe__Preliminar_Diciembre_2024-2025.xlsx", sheets: "Año 2025-2024 Consolidado" },
];

export function DataLoad() {
  const input = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<{ name: string; size: number }[]>([]);
  const [drag, setDrag] = useState(false);

  const receive = (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files].map((f) => ({ name: f.name, size: f.size }));
    setQueue((q) => [...list, ...q]);
    toast.success(`${list.length} archivo(s) recibidos`, { description: "En esta versión de prueba el procesamiento es simulado." });
  };

  return (
    <div className="space-y-6">
      <Panel eyebrow="IMPORTAR" title="Cargar Mapa Tipo mensual">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); receive(e.dataTransfer.files); }}
          onClick={() => input.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition ${drag ? "border-[#e42b35] bg-red-50/40" : "border-border bg-secondary/30 hover:bg-secondary/60"}`}
        >
          <UploadCloud size={28} className="text-[#e42b35]" />
          <p className="text-sm font-bold">Arrastra aquí el Excel o haz clic para buscarlo</p>
          <p className="text-xs text-muted-foreground">.xlsx · Mapa Tipo de cada CDA o Informe preliminar consolidado</p>
          <input ref={input} type="file" accept=".xlsx,.xls" multiple hidden onChange={(e) => receive(e.target.files)} />
        </div>
        {queue.length > 0 && (
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border text-xs">
            {queue.map((f, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="flex items-center gap-2"><FileSpreadsheet size={14} className="text-emerald-700" />{f.name}</span>
                <span className="font-mono text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB · en cola (simulado)</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel eyebrow="FUENTES ACTIVAS" title="Archivos que alimentan los tableros">
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="w-full min-w-[720px] text-xs">
            <thead>
              <tr className="border-y border-border bg-secondary/50 font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
                <th className="py-2.5 pl-5 text-left font-semibold sm:pl-6">UNIDAD</th>
                <th className="px-3 text-left font-semibold">ARCHIVO</th>
                <th className="px-3 text-left font-semibold">HOJAS LEÍDAS</th>
                <th className="px-3 text-left font-semibold">CORTE</th>
                <th className="px-3 pr-5 text-left font-semibold sm:pr-6">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((s) => {
                const e = byId(s.id);
                return (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="py-3 pl-5 sm:pl-6"><span className="inline-flex items-center gap-2 font-bold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />{e.short}</span></td>
                    <td className="px-3 font-mono text-[11px]">{s.file}</td>
                    <td className="px-3 text-muted-foreground">{s.sheets}</td>
                    <td className="px-3">Dic 2025</td>
                    <td className="px-3 pr-5 sm:pr-6"><span className="inline-flex items-center gap-1 font-semibold text-emerald-800"><CheckCircle2 size={13} /> Procesado</span></td>
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
