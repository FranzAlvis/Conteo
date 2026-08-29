import { Text, View } from '@react-pdf/renderer'
import { ReportDocument } from '../ReportDocument'
import { ReportTable, type ReportColumn } from '../ReportTable'
import type { Asignacion, UserSummary } from '@/lib/api/types'

type Props = {
  transcriptores: UserSummary[]
  asignaciones: Asignacion[]
}

export function TranscriptoresDocument({ transcriptores, asignaciones }: Props) {
  const columns: ReportColumn<UserSummary>[] = [
    { header: 'N°', width: '6%', align: 'center', render: (_r, i) => i + 1 },
    { header: 'Nombre del Transcriptor', width: '30%', render: (t) => t.name },
    { header: 'Teléfono', width: '16%', render: (t) => `+591 ${t.telefono ?? '—'}` },
    {
      header: 'Mesas Asignadas',
      width: '38%',
      render: (t) => {
        const asig = asignaciones.find((a) => a.transcriptorId === t.id)
        return asig && asig.mesasCodigos.length > 0 ? asig.mesasCodigos.join(', ') : 'Sin mesas asignadas'
      },
    },
    {
      header: 'Total',
      width: '10%',
      align: 'center',
      render: (t) => asignaciones.find((a) => a.transcriptorId === t.id)?.mesasCodigos.length ?? 0,
    },
  ]

  return (
    <ReportDocument titulo='Nómina de Personal Transcriptor'>
      <ReportTable columns={columns} data={transcriptores} />
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 7.5, color: '#6B7280' }}>
          {transcriptores.length} transcriptores acreditados para la carga de actas electorales.
        </Text>
      </View>
    </ReportDocument>
  )
}
