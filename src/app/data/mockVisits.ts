export interface Visit {
  id: number;
  vendedorId: number;
  fecha: string;
  hora: string;
  ubicacion: {
    lat: number;
    lng: number;
    direccion: string;
  };
  foto?: string;
  notas?: string;
}

// Datos de ejemplo
export const mockVisits: Visit[] = [
  {
    id: 1,
    vendedorId: 1,
    fecha: "2026-04-25",
    hora: "08:30",
    ubicacion: {
      lat: 4.6097,
      lng: -74.0817,
      direccion: "Calle 26 #68-80, Bogotá"
    },
    foto: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    notas: "Visita a taller AutoExpress"
  },
  {
    id: 2,
    vendedorId: 1,
    fecha: "2026-04-25",
    hora: "10:15",
    ubicacion: {
      lat: 4.6351,
      lng: -74.0703,
      direccion: "Av. Boyacá #72-45, Bogotá"
    },
    foto: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400",
    notas: "Cliente nuevo - Importadora de motos"
  },
  {
    id: 3,
    vendedorId: 1,
    fecha: "2026-04-25",
    hora: "12:45",
    ubicacion: {
      lat: 4.6890,
      lng: -74.0547,
      direccion: "Calle 100 #15-20, Bogotá"
    },
    foto: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400",
    notas: "Seguimiento a flota empresarial"
  }
];

export function getVisitsByVendedor(vendedorId: number, fecha: string): Visit[] {
  return mockVisits
    .filter(v => v.vendedorId === vendedorId && v.fecha === fecha)
    .sort((a, b) => a.hora.localeCompare(b.hora));
}
