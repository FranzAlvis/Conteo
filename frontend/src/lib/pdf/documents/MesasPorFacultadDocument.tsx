import { Text, View } from '@react-pdf/renderer'
import { ReportDocument } from '../ReportDocument'
import { ReportTable, type ReportColumn } from '../ReportTable'
import type { Facultad } from '@/lib/api/types'

type Props = {
  facultades: Facultad[]
}

export function MesasPorFacultadDocument({ facultades }: Props) {
  const columns: ReportColumn<Facultad>[] = [
    { header: 'N°', width: '10%', align: 'center', render: (_r, i) => i + 1 },
    { header: 'Facultad', width: '65%', render: (f) => f.nombre },
    { header: 'Total Mesas', width: '25%', align: 'center', render: (f) => f.totalMesas },
  ]

  const totalMesas = facultades.reduce((a, f) => a + f.totalMesas, 0)

  return (
    <ReportDocument titulo='Cantidad de Mesas por Facultad'>
      <ReportTable columns={columns} data={facultades} totalRow={['', 'TOTAL', totalMesas]} />
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 7.5, color: '#6B7280' }}>
          {facultades.length} facultades / sedes de votación registradas en el sistema.
        </Text>
      </View>
    </ReportDocument>
  )
}
