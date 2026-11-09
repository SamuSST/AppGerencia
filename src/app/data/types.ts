export type Series = { cur: number[]; prev: number[]; ppto?: number[] };

export type FinKey =
  | "ingOp" | "ingNoOp" | "ingTotal"
  | "personal" | "honorarios" | "impuestos" | "arrendamientos" | "servicios"
  | "mantenimiento" | "depreciaciones" | "amortizaciones" | "diversos" | "seguros"
  | "gastAdmin" | "gastVentas"
  | "gastOp" | "financieros" | "noOp" | "gastTotal" | "resultado" | "ebitda";

export type ServiceKey =
  | "rtm_motos" | "rtm_livianos" | "rtm_pesados"
  | "prev_motos" | "prev_livianos" | "prev_pesados";

export type Entity = {
  id: string;
  name: string;
  short: string;
  city: string;
  color: string;
  sources: string[];
  fin: Partial<Record<FinKey, Series>>;
  services: Partial<Record<ServiceKey, Series>> | null;
  estimated?: string;
  /** Si falta el archivo del período, explica qué falta. */
  pending?: string;
  /** Totales del año anterior completo (meta de cumplimiento). */
  target?: { ingOp: number | null; ebitda: number | null; resultado: number | null; gastOp: number | null; servicios: number | null; estimated?: boolean };
};

export type Dataset = {
  id: string;
  label: string;
  cur: number;
  prev: number;
  months: number;
  targetLabel?: string;
  entities: Entity[];
};
