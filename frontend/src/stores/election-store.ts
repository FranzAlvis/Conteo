import { create } from 'zustand'

export interface CandidatoVoto {
  id: string
  nombre: string
  lista: string
  votosEstudiantiles: number
  votosDocentes: number
  votosPonderados: number // Formula: votosEstudiantiles + (votosDocentes * 45)
  esPropio?: boolean
}

export interface MesaReciente {
  id: string
  codigo: string
  facultad: string
  tipo: 'ESTUDIANTIL' | 'DOCENTE'
  ponderacion: number // 1 for ESTUDIANTIL, 45 for DOCENTE
  transcriptor: string
  transcriptorId?: string
  transcriptorTelefono?: string
  delegadoNombre?: string
  delegadoCelular?: string
  hora: string
  estado: 'CARGADA' | 'EN_CARGA' | 'PENDIENTE'
  votosRegistrados?: number
  actaFotoUrl?: string
  observaciones?: string
  votosPorCandidato?: Record<string, number>
}

export interface TranscriptorAssignment {
  transcriptorId: string
  transcriptorNombre: string
  transcriptorTelefono: string
  mesasCodigos: string[]
  delegados: {
    id: string
    nombre: string
    celular: string
    mesaCodigo: string
  }[]
}

interface ElectionState {
  conteoAbierto: boolean
  ultimaActualizacion: string
  mesasCargadas: number
  totalMesas: number
  totalVotosEstudiantiles: number
  totalVotosDocentes: number
  totalVotosPonderados: number
  totalPadron: number
  candidatos: CandidatoVoto[]
  ultimasMesas: MesaReciente[]
  asignaciones: TranscriptorAssignment[]
  
  // Actions
  setConteoAbierto: (abierto: boolean) => void
  setUltimaActualizacion: (hora: string) => void
  updateElectionData: (data: Partial<ElectionState>) => void
  guardarOEditarMesa: (
    mesaId: string,
    votosMap: Record<string, number>,
    actaFotoUrl?: string,
    observaciones?: string
  ) => void
  actualizarAsignacionTranscriptor: (
    transcriptorId: string,
    mesasCodigos: string[]
  ) => void
}

export const useElectionStore = create<ElectionState>()((set) => ({
  conteoAbierto: true,
  ultimaActualizacion: new Date().toLocaleTimeString(),
  mesasCargadas: 2,
  totalMesas: 4,
  totalVotosEstudiantiles: 245,
  totalVotosDocentes: 52,
  totalVotosPonderados: 245 + 52 * 45, // 2585
  totalPadron: 5500,

  candidatos: [
    {
      id: 'c1',
      nombre: 'Yamile Hayes Michel',
      lista: 'Frente Unidad Universitaria (Lista 1)',
      votosEstudiantiles: 145,
      votosDocentes: 30,
      votosPonderados: 145 + 30 * 45, // 1495
      esPropio: true,
    },
    {
      id: 'c2',
      nombre: 'Dr. Roberto Mendoza',
      lista: 'Frente Reformista Estudiantil (Lista 2)',
      votosEstudiantiles: 80,
      votosDocentes: 15,
      votosPonderados: 80 + 15 * 45, // 755
      esPropio: false,
    },
    {
      id: 'c3',
      nombre: 'Dra. Patricia Soliz',
      lista: 'Movimiento Autonomía y Ciencia (Lista 3)',
      votosEstudiantiles: 15,
      votosDocentes: 5,
      votosPonderados: 15 + 5 * 45, // 240
      esPropio: false,
    },
    {
      id: 'c4',
      nombre: 'Votos En Blanco / Nulos',
      lista: 'N/A',
      votosEstudiantiles: 5,
      votosDocentes: 2,
      votosPonderados: 5 + 2 * 45, // 95
      esPropio: false,
    },
  ],

  ultimasMesas: [
    {
      id: 'm1',
      codigo: 'MESA-01',
      facultad: 'Facultad de Medicina',
      tipo: 'ESTUDIANTIL',
      ponderacion: 1,
      transcriptor: 'Juan Carlos Pérez',
      transcriptorId: 'transcriptor',
      transcriptorTelefono: '76543210',
      delegadoNombre: 'Ana María Roca',
      delegadoCelular: '71234567',
      hora: '18:04:12',
      estado: 'CARGADA',
      votosRegistrados: 245,
      votosPorCandidato: { c1: 145, c2: 80, c3: 15, c4: 5 },
      actaFotoUrl: '/assets/usfx_bg.jpg',
    },
    {
      id: 'm2',
      codigo: 'MESA-02',
      facultad: 'Facultad de Derecho',
      tipo: 'ESTUDIANTIL',
      ponderacion: 1,
      transcriptor: 'Juan Carlos Pérez',
      transcriptorId: 'transcriptor',
      transcriptorTelefono: '76543210',
      delegadoNombre: 'Jorge Luis Gutiérrez',
      delegadoCelular: '68019283',
      hora: '18:01:45',
      estado: 'EN_CARGA',
      votosRegistrados: 0,
    },
    {
      id: 'm3',
      codigo: 'MESA-03',
      facultad: 'Facultad de Tecnología',
      tipo: 'ESTUDIANTIL',
      ponderacion: 1,
      transcriptor: 'María Elena Torrez',
      transcriptorId: 'transcriptor2',
      transcriptorTelefono: '68098765',
      delegadoNombre: 'Mariana Paz Vaca',
      delegadoCelular: '76543210',
      hora: 'Pendiente',
      estado: 'PENDIENTE',
      votosRegistrados: 0,
    },
    {
      id: 'md1',
      codigo: 'MESA-DOC-01',
      facultad: 'Mesa Docentes USFX (Exclusiva)',
      tipo: 'DOCENTE',
      ponderacion: 45,
      transcriptor: 'María Elena Torrez',
      transcriptorId: 'transcriptor2',
      transcriptorTelefono: '68098765',
      delegadoNombre: 'Dr. Fernando Arancibia',
      delegadoCelular: '77889900',
      hora: '18:10:00',
      estado: 'CARGADA',
      votosRegistrados: 52,
      votosPorCandidato: { c1: 30, c2: 15, c3: 5, c4: 2 },
      actaFotoUrl: '/assets/usfx_bg.jpg',
    },
  ],

  asignaciones: [
    {
      transcriptorId: 'transcriptor',
      transcriptorNombre: 'Juan Carlos Pérez',
      transcriptorTelefono: '76543210',
      mesasCodigos: ['MESA-01', 'MESA-02'],
      delegados: [
        { id: 'd1', nombre: 'Ana María Roca', celular: '71234567', mesaCodigo: 'MESA-01' },
        { id: 'd2', nombre: 'Jorge Luis Gutiérrez', celular: '68019283', mesaCodigo: 'MESA-02' },
      ],
    },
    {
      transcriptorId: 'transcriptor2',
      transcriptorNombre: 'María Elena Torrez',
      transcriptorTelefono: '68098765',
      mesasCodigos: ['MESA-03', 'MESA-DOC-01'],
      delegados: [
        { id: 'd3', nombre: 'Mariana Paz Vaca', celular: '76543210', mesaCodigo: 'MESA-03' },
        { id: 'd4', nombre: 'Dr. Fernando Arancibia', celular: '77889900', mesaCodigo: 'MESA-DOC-01' },
      ],
    },
  ],

  setConteoAbierto: (abierto) => set({ conteoAbierto: abierto }),
  setUltimaActualizacion: (hora) => set({ ultimaActualizacion: hora }),
  updateElectionData: (data) => set((state) => ({ ...state, ...data })),

  guardarOEditarMesa: (mesaId, votosMap, actaFotoUrl, observaciones) =>
    set((state) => {
      const mesaTarget = state.ultimasMesas.find((m) => m.id === mesaId)
      if (!mesaTarget) return state

      const isDocente = mesaTarget.tipo === 'DOCENTE'

      // Calculate previous votes if editing
      const votosAnteriores = mesaTarget.votosPorCandidato || {}

      // Update candidates votes
      let diffEstudiantesTotal = 0
      let diffDocentesTotal = 0

      const nuevosCandidatos = state.candidatos.map((c) => {
        const nuevoVoto = votosMap[c.id] || 0
        const votoAnterior = votosAnteriores[c.id] || 0
        const diff = nuevoVoto - votoAnterior

        const estVal = isDocente ? c.votosEstudiantiles : c.votosEstudiantiles + diff
        const docVal = isDocente ? c.votosDocentes + diff : c.votosDocentes

        if (isDocente) {
          diffDocentesTotal += diff
        } else {
          diffEstudiantesTotal += diff
        }

        return {
          ...c,
          votosEstudiantiles: Math.max(0, estVal),
          votosDocentes: Math.max(0, docVal),
          votosPonderados: Math.max(0, estVal + docVal * 45),
        }
      })

      const totalVotosRegistradosMesa = Object.values(votosMap).reduce((a, b) => a + b, 0)

      const estWasLoaded = mesaTarget.estado === 'CARGADA'
      const nuevasMesasCargadas = estWasLoaded ? state.mesasCargadas : state.mesasCargadas + 1

      const ultimasMesasActualizadas = state.ultimasMesas.map((m) => {
        if (m.id === mesaId) {
          return {
            ...m,
            estado: 'CARGADA' as const,
            hora: new Date().toLocaleTimeString(),
            votosRegistrados: totalVotosRegistradosMesa,
            votosPorCandidato: votosMap,
            actaFotoUrl: actaFotoUrl || m.actaFotoUrl,
            observaciones: observaciones || m.observaciones,
          }
        }
        return m
      })

      const nEst = state.totalVotosEstudiantiles + diffEstudiantesTotal
      const nDoc = state.totalVotosDocentes + diffDocentesTotal
      const nPond = nEst + nDoc * 45

      return {
        ...state,
        mesasCargadas: nuevasMesasCargadas,
        totalVotosEstudiantiles: nEst,
        totalVotosDocentes: nDoc,
        totalVotosPonderados: nPond,
        candidatos: nuevosCandidatos,
        ultimasMesas: ultimasMesasActualizadas,
        ultimaActualizacion: new Date().toLocaleTimeString(),
      }
    }),

  actualizarAsignacionTranscriptor: (transcriptorId, mesasCodigos) =>
    set((state) => {
      const asignacionesNuevas = state.asignaciones.map((a) =>
        a.transcriptorId === transcriptorId ? { ...a, mesasCodigos } : a
      )
      return { ...state, asignaciones: asignacionesNuevas }
    }),
}))
