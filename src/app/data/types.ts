export type Series = { y25: number[]; y24: number[]; ppto?: number[] };

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
  source: string;
  fin: Partial<Record<FinKey, Series>>;
  services: Partial<Record<ServiceKey, Series>> | null;
  estimated?: string;
};
