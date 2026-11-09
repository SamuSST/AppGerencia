import { useEffect, useState } from "react";
import { BarChart3, Building2, ChevronRight, CircleHelp, Database, FileText, GitCompare, LogOut, Menu, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { DATASETS, DS, ENTITIES, byId, periodLabel, setDataset, type Period } from "./data/metrics";
import { GroupOverview } from "./gerencia/GroupOverview";
import { CdaDetail } from "./gerencia/CdaDetail";
import { Compare } from "./gerencia/Compare";
import { DataLoad, Reports } from "./gerencia/Reports";
import { PeriodPicker } from "./gerencia/ui";
import logo from "../assets/9b6752e4935d81eb0c34c840e006a7ba641d4c8e.png";

type View = "grupo" | "cda" | "comparar" | "informes" | "carga";
type Session = { name: string; role: "general" | "cda"; cda?: string };

const NAV: { view: View; label: string; icon: typeof BarChart3 }[] = [
  { view: "grupo", label: "Resumen del grupo", icon: BarChart3 },
  { view: "cda", label: "Ficha por CDA", icon: Building2 },
  { view: "comparar", label: "Comparar CDAs", icon: GitCompare },
  { view: "informes", label: "Informes", icon: FileText },
  { view: "carga", label: "Carga de datos", icon: Database },
];

const titles = (): Record<View, [string, string]> => ({
  grupo: ["Pulso del grupo", `Los ${ENTITIES.length} CDAs del grupo: ${DS.label.replace(" · ", ", ")}, con datos de los Mapa Tipo.`],
  cda: ["Ficha individual", "Indicadores, estado de resultados y servicios de un CDA."],
  comparar: ["Comparar CDAs", "Elige los CDAs y el indicador; compáralos entre sí y contra el promedio del grupo."],
  informes: ["Informes", "Reportes listos para ver, descargar en CSV o imprimir en PDF."],
  carga: ["Carga de datos", "Archivos Excel que alimentan los tableros."],
});

function Login({ onEnter }: { onEnter: (s: Session) => void }) {
  const [role, setRole] = useState<"general" | "cda">("general");
  const [cda, setCda] = useState("unimilenio");
  const managers = ENTITIES;
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0d2438] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#e42b35] font-mono text-sm font-bold">GC</div>
          <div>
            <p className="text-base font-bold tracking-tight">GRUPO CARDISEL</p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/50">PORTAL DE GERENCIA</p>
          </div>
        </div>
        <div>
          <p className="mb-4 font-mono text-[11px] tracking-[0.18em] text-[#ff8a90]">INFORME A SEPTIEMBRE 2026</p>
          <h1 className="max-w-md text-[44px] font-extrabold leading-[1.05] tracking-[-0.04em]">Todos los CDAs del grupo, en un solo tablero.</h1>
          <div className="mt-8 flex flex-wrap gap-2">
            {ENTITIES.map((e) => (
              <span key={e.id} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80">
                <span className="h-2 w-2 rounded-full" style={{ background: e.color }} /> {e.short}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-white/40">Prototipo funcional · datos reales de los Mapa Tipo 2024, 2025 y 2026</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form
          className="w-full max-w-sm"
          onSubmit={(ev) => {
            ev.preventDefault();
            const e = byId(cda);
            onEnter(role === "general" ? { name: "Gerencia general", role } : { name: `Gerente ${e.short}`, role, cda });
          }}
        >
          <img src={logo} alt="Grupo Cardisel" className="mb-8 h-14 w-auto" />
          <h2 className="text-2xl font-extrabold tracking-tight">Iniciar sesión</h2>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Acceso para gerentes de los CDAs.</p>
          <label className="mb-1.5 block text-xs font-bold">Correo</label>
          <input defaultValue="gerencia@grupocardisel.co" className="mb-4 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0d2438]" />
          <label className="mb-1.5 block text-xs font-bold">Contraseña</label>
          <input type="password" defaultValue="demo1234" className="mb-5 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0d2438]" />
          <p className="mb-2 text-xs font-bold">Entrar como</p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {(["general", "cda"] as const).map((r) => (
              <button type="button" key={r} onClick={() => setRole(r)} className={`rounded-lg border px-3 py-2.5 text-xs font-bold ${role === r ? "border-[#0d2438] bg-[#0d2438] text-white" : "border-border bg-white text-muted-foreground"}`}>
                {r === "general" ? "Gerencia general" : "Gerente de CDA"}
              </button>
            ))}
          </div>
          {role === "cda" && (
            <select value={cda} onChange={(e) => setCda(e.target.value)} className="mb-4 w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-semibold">
              {managers.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          <button className="mt-2 w-full rounded-lg bg-[#e42b35] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(228,43,53,.25)] hover:bg-[#c8202a]">Entrar</button>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">Prototipo: cualquier contraseña funciona.</p>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>("grupo");
  const [cda, setCda] = useState("unimilenio");
  const [period, setPeriod] = useState<Period>({ kind: "year" });
  const [compareSel, setCompareSel] = useState<string[]>(ENTITIES.map((e) => e.id));
  const [mobileNav, setMobileNav] = useState(false);
  const [ds, setDs] = useState(DS.id);
  const changeDataset = (id: string) => {
    setDataset(id);
    setDs(id);
    setPeriod({ kind: "year" });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view, cda]);

  const go = (v: View, id?: string) => {
    if (id) setCda(id);
    setView(v);
    setMobileNav(false);
  };

  if (!session)
    return (
      <>
        <Login
          onEnter={(s) => {
            setSession(s);
            if (s.cda) { setCda(s.cda); setView("cda"); } else setView("grupo");
            toast.success(`Bienvenido, ${s.name}`);
          }}
        />
        <Toaster position="bottom-right" />
      </>
    );

  const [title, subtitle] = titles()[view];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-[#0d2438] text-white transition-transform print:hidden lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="rounded-lg bg-white px-2.5 py-1.5"><img src={logo} alt="Grupo Cardisel" className="h-7 w-auto" /></div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-white/50">PORTAL DE GERENCIA</p>
          </div>
          <button className="lg:hidden" onClick={() => setMobileNav(false)} aria-label="Cerrar menú"><X size={20} /></button>
        </div>
        <nav className="px-4 py-6">
          <p className="mb-3 px-3 font-mono text-[9px] tracking-[0.18em] text-white/35">TABLEROS</p>
          {NAV.map(({ view: v, label, icon: Icon }) => {
            const active = v === view;
            return (
              <button key={v} onClick={() => go(v)} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] transition ${active ? "bg-white text-[#0d2438] shadow-lg" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
                <Icon size={17} className={active ? "text-[#e42b35]" : ""} />
                <span className="font-semibold">{label}</span>
                {active && <ChevronRight size={15} className="ml-auto text-slate-400" />}
              </button>
            );
          })}
          <p className="mb-3 mt-6 px-3 font-mono text-[9px] tracking-[0.18em] text-white/35">ACCESO RÁPIDO</p>
          {ENTITIES.map((e) => (
            <button key={e.id} onClick={() => go("cda", e.id)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] transition ${view === "cda" && cda === e.id ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}>
              <span className="h-2 w-2 rounded-full" style={{ background: e.color }} /> {e.short}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1 p-4">
          <button onClick={() => toast("Centro de ayuda", { description: "Sección en construcción para el prototipo." })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/55 hover:bg-white/5 hover:text-white"><CircleHelp size={17} /> Ayuda</button>
          <button onClick={() => setSession(null)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/55 hover:bg-white/5 hover:text-white"><LogOut size={17} /> Cerrar sesión</button>
        </div>
      </aside>
      {mobileNav && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileNav(false)} />}

      <main className="lg:pl-[248px] print:pl-0">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-xl print:static sm:px-8">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-border lg:hidden print:hidden" onClick={() => setMobileNav(true)} aria-label="Abrir menú"><Menu size={19} /></button>
            <label className="flex items-center gap-2 rounded-lg border border-[#0d2438] bg-[#0d2438] px-3 py-1.5 text-white print:hidden">
              <span className="hidden font-mono text-[10px] tracking-[0.12em] text-white/60 sm:inline">COMPARAR</span>
              <select value={ds} onChange={(e) => changeDataset(e.target.value)} className="bg-transparent text-xs font-bold outline-none [&>option]:text-black">
                {DATASETS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </label>
            {view !== "carga" && <div className="print:hidden"><PeriodPicker key={ds} value={period} onChange={setPeriod} /></div>}
            <span className="hidden font-mono text-[11px] text-muted-foreground print:inline">{periodLabel(period)}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8edf0] text-xs font-bold text-[#0d2438]">{session.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</div>
            <div className="hidden pr-1 sm:block">
              <p className="text-xs font-bold">{session.name}</p>
              <p className="text-[10px] text-muted-foreground">{session.role === "general" ? "Todos los CDAs" : byId(session.cda!).name}</p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8 sm:py-9">
          <div className="mb-7">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold tracking-[0.17em] text-[#c8202a]">{DS.label.toUpperCase()} · {periodLabel(period).toUpperCase()}</span>
              <span className="h-px w-10 bg-[#e42b35]/40" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-[38px]">{title}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div key={ds} className="contents">
          {view === "grupo" && <GroupOverview period={period} onOpen={(id) => go("cda", id)} />}
          {view === "cda" && <CdaDetail id={cda} period={period} onChange={setCda} />}
          {view === "comparar" && <Compare period={period} selected={compareSel} setSelected={setCompareSel} />}
          {view === "informes" && <Reports period={period} go={go} />}
          {view === "carga" && <DataLoad />}
          </div>
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
