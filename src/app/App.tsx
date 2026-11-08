import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Database,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Table2,
  Trophy,
  X,
} from "lucide-react";

type Metric = "facturacion" | "servicios";
type Cda = {
  name: string;
  city: string;
  services26: number;
  services25: number;
  billing26: number;
  billing25: number;
  motos: number;
  livianos: number;
  pesados: number;
  preventivas: number;
  row: number;
};

const cdaData: Cda[] = [
  { name: "Unimilenio", city: "Bogotá", services26: 23979, services25: 22877, billing26: 4374043811, billing25: 3717798366, motos: 10150, livianos: 10056, pesados: 1330, preventivas: 2443, row: 6 },
  { name: "Inteco", city: "Bogotá", services26: 18074, services25: 18600, billing26: 3711083497, billing25: 3366791983, motos: 3678, livianos: 5625, pesados: 4130, preventivas: 3938, row: 5 },
  { name: "Tecnosabana", city: "Chía", services26: 15653, services25: 16681, billing26: 2694372397, billing25: 2729385477, motos: 6252, livianos: 4262, pesados: 2211, preventivas: 2928, row: 8 },
  { name: "La Rosa", city: "Pereira", services26: 12476, services25: 11802, billing26: 2734494629, billing25: 2173350267, motos: 4483, livianos: 6942, pesados: 534, preventivas: 517, row: 12 },
  { name: "Romélia", city: "Pereira", services26: 12191, services25: 11795, billing26: 2746375255, billing25: 2225163754, motos: 4269, livianos: 5011, pesados: 1796, preventivas: 1115, row: 13 },
  { name: "Turim", city: "Bogotá", services26: 11071, services25: 10949, billing26: 2210988730, billing25: 1876392767, motos: 3198, livianos: 6525, pesados: 0, preventivas: 1348, row: 11 },
  { name: "La 37", city: "Cali", services26: 10918, services25: 12319, billing26: 1768088272, billing25: 1702189194, motos: 1015, livianos: 6008, pesados: 684, preventivas: 3196, row: 7 },
  { name: "Itac Sur", city: "Medellín", services26: 7512, services25: 6290, billing26: 1822531071, billing25: 1220160278, motos: 2008, livianos: 4268, pesados: 936, preventivas: 296, row: 10 },
  { name: "Itac Norte", city: "Medellín", services26: 7388, services25: 6599, billing26: 2287349361, billing25: 1627732497, motos: 1142, livianos: 2211, pesados: 3609, preventivas: 423, row: 9 },
];

const monthly = [
  { month: "ENE", s26: 13953, s25: 14717, f26: 2924, f25: 2579 },
  { month: "FEB", s26: 13717, s25: 13396, f26: 2723, f25: 2339 },
  { month: "MAR", s26: 13264, s25: 12782, f26: 2601, f25: 2202 },
  { month: "ABR", s26: 10326, s25: 9806, f26: 1833, f25: 1508 },
  { month: "MAY", s26: 10409, s25: 9873, f26: 2027, f25: 1585 },
  { month: "JUN", s26: 14439, s25: 13889, f26: 3097, f25: 2588 },
  { month: "JUL", s26: 15109, s25: 15377, f26: 3235, f25: 2811 },
  { month: "AGO", s26: 14012, s25: 14593, f26: 2891, f25: 2585 },
  { month: "SEP", s26: 14033, s25: 13479, f26: 3018, f25: 2442 },
];

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const compactMoney = (value: number) =>
  `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value / 1_000_000_000)} mil M`;

const growth = (current: number, previous: number) =>
  ((current - previous) / previous) * 100;

function GrowthBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[11px] font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function SourceTag({ row }: { row: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2 py-1 font-mono text-[10px] text-muted-foreground">
      <FileSpreadsheet size={11} className="text-emerald-600" />
      GLOBAL · FILA {row}
    </span>
  );
}

export default function App() {
  const [metric, setMetric] = useState<Metric>("facturacion");
  const [selected, setSelected] = useState<Cda | null>(null);
  const [activeCdaName, setActiveCdaName] = useState("Unimilenio");
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const totals = useMemo(
    () =>
      cdaData.reduce(
        (acc, item) => ({
          billing26: acc.billing26 + item.billing26,
          billing25: acc.billing25 + item.billing25,
          services26: acc.services26 + item.services26,
          services25: acc.services25 + item.services25,
        }),
        { billing26: 0, billing25: 0, services26: 0, services25: 0 },
      ),
    [],
  );

  const ranking = useMemo(
    () =>
      [...cdaData].sort((a, b) => {
        const aGrowth = growth(
          metric === "facturacion" ? a.billing26 : a.services26,
          metric === "facturacion" ? a.billing25 : a.services25,
        );
        const bGrowth = growth(
          metric === "facturacion" ? b.billing26 : b.services26,
          metric === "facturacion" ? b.billing25 : b.services25,
        );
        return bGrowth - aGrowth;
      }),
    [metric],
  );

  const filtered = cdaData.filter((item) =>
    `${item.name} ${item.city}`.toLowerCase().includes(query.toLowerCase()),
  );
  const activeCda = cdaData.find((item) => item.name === activeCdaName) ?? cdaData[0];
  const activeGrowth = growth(activeCda.billing26, activeCda.billing25);
  const activeServiceGrowth = growth(activeCda.services26, activeCda.services25);
  const activeTicket = activeCda.billing26 / activeCda.services26;
  const serviceMix = [
    { column: "C", label: "Motos RTM", value: activeCda.motos, color: "#e42b35" },
    { column: "D", label: "Livianos RTM", value: activeCda.livianos, color: "#15384f" },
    { column: "E", label: "Pesados RTM", value: activeCda.pesados, color: "#df9d37" },
    { column: "L", label: "Preventivas", value: activeCda.preventivas, color: "#8298a8" },
  ];

  const openSource = (cda?: Cda) => {
    if (cda) setSelected(cda);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-[#0d2438] text-white transition-transform lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#e42b35] font-mono text-[13px] font-bold shadow-[0_8px_24px_rgba(228,43,53,.3)]">
              GC
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight">GRUPO CARDISEL</p>
              <p className="font-mono text-[9px] tracking-[0.2em] text-white/50">INTELIGENCIA CDA</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setMobileNav(false)} aria-label="Cerrar navegación">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-7">
          <p className="mb-3 px-3 font-mono text-[9px] tracking-[0.18em] text-white/35">CENTRO DE CONTROL</p>
          {[
            { icon: LayoutDashboard, label: "Resumen ejecutivo", active: true },
            { icon: Trophy, label: "Ranking de CDAs" },
            { icon: Table2, label: "Base comparativa" },
            { icon: Database, label: "Fuentes de datos" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              onClick={() => label === "Base comparativa" && openSource()}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] transition ${
                active ? "bg-white text-[#0d2438] shadow-lg" : "text-white/65 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={17} className={active ? "text-[#e42b35]" : ""} />
              <span className="font-semibold">{label}</span>
              {active && <ChevronRight size={15} className="ml-auto text-slate-400" />}
            </button>
          ))}
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              FUENTE ACTIVA
            </div>
            <p className="text-xs font-semibold leading-5">Comparativo Ene–Sep</p>
            <p className="text-[11px] text-white/45">2025 / 2026 · 9 CDAs</p>
          </div>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/55 hover:bg-white/5 hover:text-white">
            <Settings size={17} /> Configuración
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/55 hover:bg-white/5 hover:text-white">
            <CircleHelp size={17} /> Centro de ayuda
          </button>
        </div>
      </aside>

      <main className="lg:pl-[248px]">
        <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-border lg:hidden" onClick={() => setMobileNav(true)}>
              <Menu size={19} />
            </button>
            <div>
              <p className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground">PERÍODO DE ANÁLISIS</p>
              <button className="flex items-center gap-2 text-sm font-bold">
                Ene — Sep 2026 <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 md:flex">
              <Search size={15} className="text-muted-foreground" />
              <input className="w-40 bg-transparent text-xs outline-none" placeholder="Buscar CDA..." />
            </div>
            <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-border bg-white">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e42b35]" />
            </button>
            <div className="hidden h-9 items-center gap-2 border-l border-border pl-3 sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8edf0] text-xs font-bold text-[#0d2438]">AC</div>
              <div className="pr-1">
                <p className="text-xs font-bold">Ana Cardisel</p>
                <p className="text-[10px] text-muted-foreground">Administradora</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8 sm:py-10">
          <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold tracking-[0.17em] text-[#e42b35]">INFORME 09 / 2026</span>
                <span className="h-px w-10 bg-[#e42b35]/40" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-[40px]">Pulso nacional de CDAs</h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Comparativo acumulado 2026 vs. 2025 con trazabilidad directa a la base de origen.
              </p>
            </div>
            <div className="inline-flex w-fit rounded-lg border border-border bg-white p-1 shadow-sm">
              <button
                onClick={() => setMetric("facturacion")}
                className={`rounded-md px-4 py-2 text-xs font-bold transition ${metric === "facturacion" ? "bg-[#0d2438] text-white" : "text-muted-foreground"}`}
              >
                Facturación
              </button>
              <button
                onClick={() => setMetric("servicios")}
                className={`rounded-md px-4 py-2 text-xs font-bold transition ${metric === "servicios" ? "bg-[#0d2438] text-white" : "text-muted-foreground"}`}
              >
                Servicios
              </button>
            </div>
          </section>

          <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Facturación acumulada",
                value: compactMoney(totals.billing26),
                delta: growth(totals.billing26, totals.billing25),
                note: "vs. $20,6 mil M en 2025",
                icon: BarChart3,
              },
              {
                label: "Servicios realizados",
                value: totals.services26.toLocaleString("es-CO"),
                delta: growth(totals.services26, totals.services25),
                note: `vs. ${totals.services25.toLocaleString("es-CO")} en 2025`,
                icon: Table2,
              },
              {
                label: "CDA líder en crecimiento",
                value: "Itac Sur",
                delta: 49.4,
                note: "Por facturación acumulada",
                icon: Trophy,
              },
              {
                label: "Cobertura",
                value: "9 CDAs",
                delta: 100,
                note: "270 días consolidados",
                icon: Building2,
              },
            ].map((card, index) => (
              <motion.button
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => openSource()}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 text-left shadow-[0_2px_12px_rgba(13,36,56,.035)] transition hover:-translate-y-0.5 hover:border-[#0d2438]/25 hover:shadow-[0_12px_30px_rgba(13,36,56,.08)]"
              >
                <div className="mb-5 flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{card.label}</p>
                  <card.icon size={17} className="text-[#e42b35]" />
                </div>
                <p className="mb-2 text-2xl font-extrabold tracking-[-0.035em]">{card.value}</p>
                <div className="flex items-center gap-2">
                  <GrowthBadge value={card.delta} />
                  <span className="truncate text-[10px] text-muted-foreground">{card.note}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#e42b35] transition-transform group-hover:scale-x-100" />
              </motion.button>
            ))}
          </section>

          <section className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.75fr)]">
            <div className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_12px_rgba(13,36,56,.035)] sm:p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold tracking-[0.16em] text-[#e42b35]">EVOLUCIÓN MENSUAL</p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-tight">
                    {metric === "facturacion" ? "Facturación consolidada" : "Volumen de servicios"}
                  </h2>
                </div>
                <div className="flex items-center gap-4 font-mono text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#e42b35]" />2026</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#a9b7c1]" />2025</span>
                </div>
              </div>
              <div className="h-[275px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e42b35" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#e42b35" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e6e2dc" strokeDasharray="3 5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b858d", fontSize: 10, fontFamily: "DM Mono" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#7b858d", fontSize: 10, fontFamily: "DM Mono" }} tickFormatter={(v) => metric === "facturacion" ? `$${(v / 1000).toFixed(1)}B` : `${Math.round(v / 1000)}k`} />
                    <Tooltip
                      cursor={{ stroke: "#0d2438", strokeDasharray: "3 3" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #e2ded7", fontSize: 12, boxShadow: "0 10px 30px rgba(13,36,56,.1)" }}
                      formatter={(value: number, name: string) => [
                        metric === "facturacion" ? `$${value.toLocaleString("es-CO")} M` : value.toLocaleString("es-CO"),
                        name.endsWith("26") ? "2026" : "2025",
                      ]}
                    />
                    <Area type="monotone" dataKey={metric === "facturacion" ? "f25" : "s25"} stroke="#a9b7c1" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey={metric === "facturacion" ? "f26" : "s26"} stroke="#e42b35" strokeWidth={2.5} fill="url(#redFill)" activeDot={{ r: 5, fill: "#e42b35", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-[#0d2438] p-5 text-white shadow-[0_16px_40px_rgba(13,36,56,.16)] sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.16em] text-white/45">RANKING / VARIACIÓN</p>
                  <h2 className="mt-1 text-lg font-extrabold">CDAs destacados</h2>
                </div>
                <Trophy size={19} className="text-[#ef5b62]" />
              </div>
              <div className="space-y-1">
                {ranking.slice(0, 5).map((item, index) => {
                  const value = growth(
                    metric === "facturacion" ? item.billing26 : item.services26,
                    metric === "facturacion" ? item.billing25 : item.services25,
                  );
                  return (
                    <button
                      key={item.name}
                      onClick={() => openSource(item)}
                      className="group flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-white/[0.07]"
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold ${index === 0 ? "bg-[#e42b35] text-white" : "bg-white/10 text-white/60"}`}>0{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex justify-between gap-3">
                          <span className="truncate text-xs font-bold">{item.name}</span>
                          <span className={`font-mono text-[11px] font-bold ${value >= 0 ? "text-emerald-400" : "text-[#ff8389]"}`}>
                            {value >= 0 ? "+" : ""}{value.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[#ef5b62]" style={{ width: `${Math.max(5, Math.min(100, value * 1.8))}%` }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => openSource()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 text-[11px] font-bold text-white/70 transition hover:bg-white/10 hover:text-white">
                Ver ranking completo <ChevronRight size={13} />
              </button>
            </div>
          </section>

          <section className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold tracking-[0.16em] text-[#e42b35]">COMPARATIVA CDA</p>
                  <h2 className="mt-1 text-lg font-extrabold">Facturación por centro</h2>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground">COP · MILES DE MILLONES</span>
              </div>
              <div className="h-[270px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cdaData} layout="vertical" margin={{ top: 0, right: 8, left: 2, bottom: 0 }} onClick={(state: any) => state?.activePayload?.[0]?.payload && openSource(state.activePayload[0].payload)}>
                    <CartesianGrid horizontal={false} stroke="#e6e2dc" strokeDasharray="3 5" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#7b858d", fontSize: 9 }} tickFormatter={(v) => `$${(v / 1_000_000_000).toFixed(0)}B`} />
                    <YAxis type="category" dataKey="name" width={82} axisLine={false} tickLine={false} tick={{ fill: "#263744", fontSize: 10, fontWeight: 600 }} />
                    <Tooltip formatter={(value: number) => money(value)} cursor={{ fill: "#f2f0eb" }} contentStyle={{ borderRadius: 10, border: "1px solid #e2ded7", fontSize: 11 }} />
                    <Bar dataKey="billing26" radius={[0, 4, 4, 0]} barSize={12}>
                      {cdaData.map((entry) => <Cell key={entry.name} fill={selected?.name === entry.name ? "#e42b35" : "#19384f"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] font-semibold tracking-[0.16em] text-[#e42b35]">COMPOSICIÓN</p>
                  <h2 className="mt-1 text-lg font-extrabold">Servicios por tipo</h2>
                </div>
                <button onClick={() => openSource()} className="text-[10px] font-bold text-muted-foreground hover:text-foreground">VER DATOS →</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Livianos", value: 50908, color: "#15384f", pct: 42.7 },
                  { label: "Motos", value: 36195, color: "#e42b35", pct: 30.3 },
                  { label: "Pesados", value: 15230, color: "#df9d37", pct: 12.8 },
                  { label: "Preventivas", value: 16204, color: "#8298a8", pct: 13.6 },
                ].map((item) => (
                  <button key={item.label} onClick={() => openSource()} className="rounded-lg border border-border p-4 text-left transition hover:border-[#0d2438]/30 hover:bg-secondary/45">
                    <span className="mb-4 block h-1 w-8 rounded-full" style={{ background: item.color }} />
                    <p className="font-mono text-xl font-semibold">{item.value.toLocaleString("es-CO")}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{item.label}</span><span>{item.pct}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_12px_rgba(13,36,56,.035)]">
            <div className="flex flex-col gap-4 border-b border-border bg-[#fffefa] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.16em] text-[#e42b35]">FICHA INDIVIDUAL</p>
                  <span className="h-px w-8 bg-[#e42b35]/30" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">Análisis detallado por CDA</h2>
                <p className="mt-1 text-xs text-muted-foreground">Selecciona un centro para revisar sus indicadores y el argumento exacto en la tabla.</p>
              </div>
              <label className="relative block min-w-[230px]">
                <span className="mb-1.5 block font-mono text-[8px] font-semibold tracking-[0.12em] text-muted-foreground">CENTRO DE DIAGNÓSTICO</span>
                <select
                  value={activeCdaName}
                  onChange={(event) => setActiveCdaName(event.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-9 text-xs font-bold outline-none transition focus:border-[#0d2438]"
                >
                  {cdaData.map((item) => <option key={item.name}>{item.name}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute bottom-3.5 right-3 text-muted-foreground" />
              </label>
            </div>

            <div className="grid xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
              <div className="border-b border-border p-5 sm:p-6 xl:border-b-0 xl:border-r">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-extrabold tracking-[-0.04em]">{activeCda.name}</h3>
                      <span className="rounded-full bg-[#e8edf0] px-2 py-1 text-[9px] font-bold text-[#15384f]">{activeCda.city}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">270 días consolidados · Enero a septiembre</p>
                  </div>
                  <SourceTag row={activeCda.row} />
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3">
                  {[
                    { label: "Ticket promedio", value: money(activeTicket), helper: "Facturación / servicio" },
                    { label: "Promedio diario", value: Math.round(activeCda.services26 / 270).toLocaleString("es-CO"), helper: "Servicios por día" },
                    { label: "Participación nacional", value: `${((activeCda.services26 / totals.services26) * 100).toFixed(1)}%`, helper: "Del total de servicios" },
                    { label: "Peso de preventivas", value: `${((activeCda.preventivas / activeCda.services26) * 100).toFixed(1)}%`, helper: "Sobre servicios totales" },
                  ].map((stat) => (
                    <button
                      key={stat.label}
                      onClick={() => setSelected(activeCda)}
                      className="group rounded-lg border border-border bg-white p-4 text-left transition hover:border-[#e42b35]/40 hover:shadow-[0_8px_20px_rgba(13,36,56,.06)]"
                    >
                      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{stat.label}</p>
                      <p className="font-mono text-lg font-semibold tracking-tight">{stat.value}</p>
                      <p className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground">
                        {stat.helper} <Table2 size={10} className="opacity-0 transition group-hover:opacity-100" />
                      </p>
                    </button>
                  ))}
                </div>

                <div className="rounded-xl bg-[#0d2438] p-5 text-white">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[8px] tracking-[0.14em] text-white/40">DESEMPEÑO INTERANUAL</p>
                      <p className="mt-1 text-sm font-bold">2026 frente a 2025</p>
                    </div>
                    <BarChart3 size={18} className="text-[#ef5b62]" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="mb-1 text-[10px] text-white/45">Facturación</p>
                      <p className={`font-mono text-xl font-semibold ${activeGrowth >= 0 ? "text-emerald-400" : "text-[#ff8389]"}`}>
                        {activeGrowth >= 0 ? "+" : ""}{activeGrowth.toFixed(1)}%
                      </p>
                      <p className="mt-1 text-[9px] text-white/35">{compactMoney(activeCda.billing26)}</p>
                    </div>
                    <div className="border-l border-white/10 pl-5">
                      <p className="mb-1 text-[10px] text-white/45">Servicios</p>
                      <p className={`font-mono text-xl font-semibold ${activeServiceGrowth >= 0 ? "text-emerald-400" : "text-[#ff8389]"}`}>
                        {activeServiceGrowth >= 0 ? "+" : ""}{activeServiceGrowth.toFixed(1)}%
                      </p>
                      <p className="mt-1 text-[9px] text-white/35">{activeCda.services26.toLocaleString("es-CO")} servicios</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-[#e42b35]">ARGUMENTO DEL INDICADOR</p>
                    <h3 className="mt-1 text-base font-extrabold">Tabla de composición del servicio</h3>
                    <p className="mt-1 text-[10px] text-muted-foreground">Celdas reales utilizadas en el consolidado del archivo cargado.</p>
                  </div>
                  <button onClick={() => setSelected(activeCda)} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-[10px] font-bold transition hover:border-[#0d2438]/30">
                    <FileSpreadsheet size={13} className="text-emerald-600" /> Ver fila completa
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-secondary/70 font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Celda origen</th>
                        <th className="px-4 py-3 font-medium">Concepto</th>
                        <th className="px-4 py-3 text-right font-medium">Valor</th>
                        <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">% del total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceMix.map((item) => (
                        <tr key={item.label} className="border-t border-border bg-white text-xs transition hover:bg-[#f8f6f2]">
                          <td className="px-4 py-3">
                            <span className="rounded border border-border bg-[#fbfaf7] px-2 py-1 font-mono text-[9px] font-semibold">
                              {item.column}{activeCda.row}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-2 font-semibold">
                              <i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">{item.value.toLocaleString("es-CO")}</td>
                          <td className="hidden px-4 py-3 text-right font-mono text-muted-foreground sm:table-cell">
                            {((item.value / activeCda.services26) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-[#0d2438] bg-[#0d2438] text-white">
                        <td className="px-4 py-3"><span className="rounded bg-white/10 px-2 py-1 font-mono text-[9px]">M{activeCda.row}</span></td>
                        <td className="px-4 py-3 text-xs font-bold">Total servicios 2026</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold">{activeCda.services26.toLocaleString("es-CO")}</td>
                        <td className="hidden px-4 py-3 text-right font-mono text-[10px] text-white/60 sm:table-cell">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-border">
                  <div className="flex items-center justify-between border-b border-border bg-[#fbfaf7] px-4 py-3">
                    <p className="text-[10px] font-bold">Argumento de facturación</p>
                    <span className="font-mono text-[8px] text-muted-foreground">HOJA GLOBAL · FILA {activeCda.row}</span>
                  </div>
                  <table className="w-full border-collapse">
                    <tbody className="text-xs">
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-mono text-[9px] text-muted-foreground">W{activeCda.row}</td>
                        <td className="px-4 py-3 font-semibold">Facturación total 2026</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">{money(activeCda.billing26)}</td>
                      </tr>
                      <tr className="border-t border-border bg-white">
                        <td className="px-4 py-3 font-mono text-[9px] text-muted-foreground">W{activeCda.row + 15}</td>
                        <td className="px-4 py-3 font-semibold">Facturación total 2025</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{money(activeCda.billing25)}</td>
                      </tr>
                      <tr className="border-t border-border bg-red-50/60">
                        <td className="px-4 py-3 font-mono text-[9px] text-[#e42b35]">CÁLCULO</td>
                        <td className="px-4 py-3 font-semibold">(2026 − 2025) / 2025</td>
                        <td className="px-4 py-3 text-right"><GrowthBadge value={activeGrowth} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section ref={tableRef} className="scroll-mt-24 rounded-xl border border-border bg-card shadow-[0_2px_12px_rgba(13,36,56,.035)]">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.16em] text-[#e42b35]">TRAZABILIDAD DE DATOS</p>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[8px] font-bold text-emerald-700">SINCRONIZADO</span>
                </div>
                <h2 className="text-lg font-extrabold">Base comparativa nacional</h2>
                <p className="mt-1 text-xs text-muted-foreground">Hoja “Global” · Acumulado enero a septiembre</p>
              </div>
              <div className="flex gap-2">
                <label className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2 sm:w-56">
                  <Search size={14} className="text-muted-foreground" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-xs outline-none" placeholder="Filtrar CDA o ciudad" />
                </label>
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary" aria-label="Filtros"><Filter size={15} /></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[970px] border-collapse text-left">
                <thead>
                  <tr className="bg-secondary/55 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    <th className="px-6 py-3.5 font-medium">CDA / origen</th>
                    <th className="px-4 py-3.5 font-medium">Servicios 2026</th>
                    <th className="px-4 py-3.5 font-medium">Servicios 2025</th>
                    <th className="px-4 py-3.5 font-medium">Variación</th>
                    <th className="px-4 py-3.5 font-medium">Facturación 2026</th>
                    <th className="px-4 py-3.5 font-medium">Facturación 2025</th>
                    <th className="px-6 py-3.5 text-right font-medium">Crecimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.name}
                      onClick={() => setSelected(item)}
                      className={`cursor-pointer border-t border-border text-xs transition hover:bg-[#f8f6f2] ${selected?.name === item.name ? "bg-red-50/70 shadow-[inset_3px_0_0_#e42b35]" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="font-bold">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground">{item.city}</span>
                        </div>
                        <SourceTag row={item.row} />
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold">{item.services26.toLocaleString("es-CO")}</td>
                      <td className="px-4 py-4 font-mono text-muted-foreground">{item.services25.toLocaleString("es-CO")}</td>
                      <td className="px-4 py-4"><GrowthBadge value={growth(item.services26, item.services25)} /></td>
                      <td className="px-4 py-4 font-mono font-semibold">{money(item.billing26)}</td>
                      <td className="px-4 py-4 font-mono text-muted-foreground">{money(item.billing25)}</td>
                      <td className="px-6 py-4 text-right"><GrowthBadge value={growth(item.billing26, item.billing25)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="font-mono text-[9px] text-muted-foreground">MOSTRANDO {filtered.length} DE 9 REGISTROS · FUENTE: XLSX CARGADO</p>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <button className="grid h-7 w-7 place-items-center rounded border border-border bg-[#0d2438] text-white">1</button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {mobileNav && <button className="fixed inset-0 z-40 bg-[#071724]/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileNav(false)} aria-label="Cerrar menú" />}

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-end justify-end bg-[#071724]/30 backdrop-blur-[2px]" onClick={() => setSelected(null)}>
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            className="h-full w-full max-w-[430px] overflow-y-auto bg-[#fbfaf7] p-6 shadow-[-20px_0_60px_rgba(13,36,56,.2)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-10 flex items-start justify-between">
              <div>
                <p className="font-mono text-[9px] font-semibold tracking-[0.16em] text-[#e42b35]">DETALLE DE ORIGEN</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{selected.name}</h2>
                <p className="text-xs text-muted-foreground">{selected.city} · Acumulado 2026</p>
              </div>
              <button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white"><X size={17} /></button>
            </div>
            <div className="mb-6 rounded-xl bg-[#0d2438] p-5 text-white">
              <p className="mb-3 font-mono text-[9px] tracking-[0.14em] text-white/45">UBICACIÓN EN EL ARCHIVO</p>
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-emerald-400" size={24} />
                <div>
                  <p className="text-sm font-bold">Hoja “Global” · Fila {selected.row}</p>
                  <p className="text-[10px] text-white/50">Columnas A — W · Valores consolidados</p>
                </div>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                ["Servicios 2026", selected.services26.toLocaleString("es-CO")],
                ["Servicios 2025", selected.services25.toLocaleString("es-CO")],
                ["Facturación 2026", compactMoney(selected.billing26)],
                ["Crecimiento", `${growth(selected.billing26, selected.billing25).toFixed(1)}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-white p-4">
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="font-mono text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <h3 className="mb-3 text-sm font-extrabold">Desglose del dato</h3>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {[
                ["C · Motos RTM", selected.motos],
                ["D · Livianos RTM", selected.livianos],
                ["E · Pesados RTM", selected.pesados],
                ["L · Preventivas", selected.preventivas],
                ["M · Total servicios", selected.services26],
              ].map(([label, value], index) => (
                <div key={String(label)} className={`flex items-center justify-between px-4 py-3 text-xs ${index ? "border-t border-border" : ""}`}>
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-semibold">{Number(value).toLocaleString("es-CO")}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="mt-8 w-full rounded-lg bg-[#e42b35] py-3 text-xs font-bold text-white shadow-[0_8px_22px_rgba(228,43,53,.24)] transition hover:bg-[#c91f29]">
              Volver a la tabla comparativa
            </button>
          </motion.aside>
        </div>
      )}
    </div>
  );
}
