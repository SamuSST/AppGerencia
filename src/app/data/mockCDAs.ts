export interface Vendedor {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  metaDiaria: number;
  metaMensual: number;
  metaAnual: number;
  avatar?: string;
  desempeñoMensual: number; // porcentaje
}

export interface CDA {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  vendedores: Vendedor[];
  totalVendedores: number;
  clientesMes: number;
  metaMensual: number; // Meta mensual del CDA
  desempeñoPromedio: number; // porcentaje
}

export const mockCDAs: CDA[] = [
  {
    id: 1,
    nombre: "CDA de la 37",
    ciudad: "Bogotá",
    direccion: "Carrera 37 #10-50, Bogotá",
    telefono: "+57 (1) 444-3737",
    totalVendedores: 5,
    clientesMes: 342,
    metaMensual: 500,
    desempeñoPromedio: 78,
    vendedores: [
      {
        id: 101,
        nombre: "Juan Carlos Pérez",
        email: "juan.perez@cdala37.com",
        telefono: "+57 310 234 5678",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 84,
      },
      {
        id: 102,
        nombre: "María Fernanda López",
        email: "maria.lopez@cdala37.com",
        telefono: "+57 315 876 5432",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 92,
      },
      {
        id: 103,
        nombre: "Carlos Andrés Gómez",
        email: "carlos.gomez@cdala37.com",
        telefono: "+57 320 456 7890",
        metaDiaria: 4,
        metaMensual: 80,
        metaAnual: 960,
        desempeñoMensual: 68,
      },
      {
        id: 104,
        nombre: "Ana María Rodríguez",
        email: "ana.rodriguez@cdala37.com",
        telefono: "+57 318 765 4321",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 76,
      },
      {
        id: 105,
        nombre: "Diego Alejandro Ruiz",
        email: "diego.ruiz@cdala37.com",
        telefono: "+57 312 987 6543",
        metaDiaria: 4,
        metaMensual: 80,
        metaAnual: 960,
        desempeñoMensual: 71,
      },
    ],
  },
  {
    id: 2,
    nombre: "Unimilenio",
    ciudad: "Bogotá",
    direccion: "Calle 30 #82-71, Bogotá",
    telefono: "+57 (1) 250-4040",
    totalVendedores: 6,
    clientesMes: 412,
    metaMensual: 600,
    desempeñoPromedio: 82,
    vendedores: [
      {
        id: 201,
        nombre: "Sandra Patricia Martínez",
        email: "sandra.martinez@unimilenio.com",
        telefono: "+57 314 123 4567",
        metaDiaria: 6,
        metaMensual: 120,
        metaAnual: 1440,
        desempeñoMensual: 91,
      },
      {
        id: 202,
        nombre: "Javier Eduardo Torres",
        email: "javier.torres@unimilenio.com",
        telefono: "+57 316 234 5678",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 86,
      },
      {
        id: 203,
        nombre: "Claudia Milena Sánchez",
        email: "claudia.sanchez@unimilenio.com",
        telefono: "+57 319 345 6789",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 79,
      },
      {
        id: 204,
        nombre: "Roberto León Vargas",
        email: "roberto.vargas@unimilenio.com",
        telefono: "+57 311 456 7890",
        metaDiaria: 6,
        metaMensual: 120,
        metaAnual: 1440,
        desempeñoMensual: 88,
      },
      {
        id: 205,
        nombre: "Patricia Elena Jiménez",
        email: "patricia.jimenez@unimilenio.com",
        telefono: "+57 317 678 9012",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 74,
      },
      {
        id: 206,
        nombre: "Luis Fernando Castro",
        email: "luis.castro@unimilenio.com",
        telefono: "+57 313 567 8901",
        metaDiaria: 4,
        metaMensual: 80,
        metaAnual: 960,
        desempeñoMensual: 72,
      },
    ],
  },
  {
    id: 3,
    nombre: "Inteco",
    ciudad: "Bogotá",
    direccion: "Carrera 65 #8B-91, Bogotá",
    telefono: "+57 (1) 405-5000",
    totalVendedores: 4,
    clientesMes: 298,
    metaMensual: 400,
    desempeñoPromedio: 71,
    vendedores: [
      {
        id: 301,
        nombre: "Fernando Gómez Restrepo",
        email: "fernando.gomez@inteco.com",
        telefono: "+57 312 123 4567",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 85,
      },
      {
        id: 302,
        nombre: "Liliana Marín Ortiz",
        email: "liliana.marin@inteco.com",
        telefono: "+57 316 234 5678",
        metaDiaria: 5,
        metaMensual: 100,
        metaAnual: 1200,
        desempeñoMensual: 73,
      },
      {
        id: 303,
        nombre: "Gloria Elena Patiño",
        email: "gloria.patino@inteco.com",
        telefono: "+57 311 456 7890",
        metaDiaria: 4,
        metaMensual: 80,
        metaAnual: 960,
        desempeñoMensual: 68,
      },
      {
        id: 304,
        nombre: "Oscar Iván Suárez",
        email: "oscar.suarez@inteco.com",
        telefono: "+57 319 345 6789",
        metaDiaria: 4,
        metaMensual: 80,
        metaAnual: 960,
        desempeñoMensual: 58,
      },
    ],
  },
];

export const getCDAById = (id: number): CDA | undefined => {
  return mockCDAs.find(cda => cda.id === id);
};

export const getVendedorById = (cdaId: number, vendedorId: number): Vendedor | undefined => {
  const cda = getCDAById(cdaId);
  return cda?.vendedores.find(v => v.id === vendedorId);
};