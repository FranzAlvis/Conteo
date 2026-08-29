import { Text, View } from '@react-pdf/renderer'
import { ReportDocument } from '../ReportDocument'
import { ReportTable, type ReportColumn } from '../ReportTable'
import type { Delegado } from '@/lib/api/types'

type Props = {
  delegados: Delegado[]
}

export function DelegadosDocument({ delegados }: Props) {
  const columns: ReportColumn<Delegado>[] = [
    { header: 'N°', width: '8%', align: 'center', render: (_r, i) => i + 1 },
    { header: 'Nombre Completo', width: '52%', render: (d) => d.nombre },
    { header: 'Celular', width: '20%', render: (d) => `+591 ${d.celular}` },
    { header: 'Mesa', width: '20%', align: 'center', render: (d) => d.mesaCodigo || 'Pendiente' },
  ]

  return (
    <ReportDocument titulo='Nómina de Delegados de Mesa'>
      <ReportTable columns={columns} data={delegados} />
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 7.5, color: '#6B7280' }}>
          {delegados.length} delegados de mesa acreditados.
        </Text>
      </View>
    </ReportDocument>
  )
}
