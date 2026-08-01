import { create } from 'zustand'

export interface CandidatoVoto {
  id: string
  nombre: string
  lista: string
  votos: number
  esPropio?: boolean
}

export interface MesaReciente {
  id: string
  codigo: string
  facultad: string
  transcriptor: string
  hora: string
  estado: 'CARGADA' | 'EN_CARGA' | 'PENDIENTE'
  votosRegistrados?: number
}

interface ElectionState {
  conteoAbierto: boolean
  ultimaActualizacion: string
  mesasCargadas: number
  totalMesas: number
  totalVotos: number
  totalPadron: number
  candidatos: CandidatoVoto[]
  ultimasMesas: MesaReciente[]
  
  // Actions
  setConteoAbierto: (abierto: boolean) => void
  setUltimaActualizacion: (hora: string) => void
  updateElectionData: (data: Partial<ElectionState>) => void
  cargarNuevaMesa: (mesa: MesaReciente, votos: Record<string, number>) => void
}

export const useElectionStore = create<ElectionState>()((set) => ({
  conteoAbierto: true,
  ultimaActualizacion: '18:05:00',
  mesasCargadas: 18,
  totalMesas: 25,
  totalVotos: 4280,
  totalPadron: 5500,
  candidatos: [
    {
      id: '1',
      nombre: 'Yamile Hayes Michel',
      lista: 'Frente Unidad Universitaria (Lista 1)',
      votos: 2450,
      esPropio: true,
    },
    {
      id: '2',
      nombre: 'Dr. Roberto Mendoza',
      lista: 'Frente Reformista Estudiantil (Lista 2)',
      votos: 1420,
      esPropio: false,
    },
    {
      id: '3',
      nombre: 'Dra. Patricia Soliz',
      lista: 'Movimiento Autonomía y Ciencia (Lista 3)',
      votos: 310,
      esPropio: false,
    },
    {
      id: '4',
      nombre: 'Votos En Blanco / Nulos',
      lista: 'N/A',
      votos: 100,
      esPropio: false,
    },
  ],
  ultimasMesas: [
    {
      id: 'm18',
      codigo: 'MESA-18',
      facultad: 'Facultad de Medicina',
      transcriptor: 'Carlos Gutiérrez',
      hora: '18:04:12',
      estado: 'CARGADA',
      votosRegistrados: 240,
    },
    {
      id: 'm17',
      codigo: 'MESA-17',
      facultad: 'Facultad de Derecho',
      transcriptor: 'Ana María Roca',
      hora: '18:01:45',
      estado: 'CARGADA',
      votosRegistrados: 210,
    },
    {
      id: 'm16',
      codigo: 'MESA-16',
      facultad: 'Facultad de Tecnología',
      transcriptor: 'Luis Fernández',
      hora: '17:58:30',
      estado: 'CARGADA',
      votosRegistrados: 280,
    },
    {
      id: 'm19',
      codigo: 'MESA-19',
      facultad: 'Facultad de Odontología',
      transcriptor: 'Mariana Paz',
      hora: '18:05:00',
      estado: 'EN_CARGA',
      votosRegistrados: 0,
    },
    {
      id: 'm20',
      codigo: 'MESA-20',
      facultad: 'Facultad de Economía',
      transcriptor: 'Sin Asignar',
      hora: 'Pendiente',
      estado: 'PENDIENTE',
      votosRegistrados: 0,
    },
  ],

  setConteoAbierto: (abierto) => set({ conteoAbierto: abierto }),
  setUltimaActualizacion: (hora) => set({ ultimaActualizacion: hora }),
  updateElectionData: (data) => set((state) => ({ ...state, ...data })),
  
  cargarNuevaMesa: (mesa, votosMap) => set((state) => {
    let nuevosVotosTotales = 0
    const candidatosActualizados = state.candidatos.map((c) => {
      const sum = votosMap[c.id] || 0
      nuevosVotosTotales += sum
      return { ...c, votos: c.votos + sum }
    })

    const ultimasMesasActualizadas = [
      mesa,
      ...state.ultimasMesas.filter((m) => m.id !== mesa.id),
    ]

    return {
      ...state,
      mesasCargadas: state.mesasCargadas + (mesa.estado === 'CARGADA' ? 1 : 0),
      totalVotos: state.totalVotos + nuevosVotosTotales,
      candidatos: candidatosActualizados,
      ultimasMesas: ultimasMesasActualizadas,
      ultimaActualizacion: new Date().toLocaleTimeString(),
    }
  }),
}))
