import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { pdfTheme } from './theme'

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: pdfTheme.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: pdfTheme.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.border,
  },
  headerCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: pdfTheme.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    padding: 7,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: pdfTheme.border,
  },
  rowAlt: {
    backgroundColor: pdfTheme.rowAlt,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    fontSize: 8.5,
    padding: 7,
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: pdfTheme.headerBg,
  },
  totalCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    padding: 7,
    color: pdfTheme.primaryDark,
  },
})

export type ReportColumn<T> = {
  header: string
  width: string
  align?: 'left' | 'center' | 'right'
  render: (row: T, index: number) => React.ReactNode
}

type ReportTableProps<T> = {
  columns: ReportColumn<T>[]
  data: T[]
  /** Fila final opcional (ej. totales) — mismas columnas, resaltada. */
  totalRow?: React.ReactNode[]
}

export function ReportTable<T>({ columns, data, totalRow }: ReportTableProps<T>) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        {columns.map((col, i) => (
          <Text key={i} style={[styles.headerCell, { width: col.width, textAlign: col.align ?? 'left' }]}>
            {col.header}
          </Text>
        ))}
      </View>

      {data.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            styles.row,
            rowIndex % 2 === 1 ? styles.rowAlt : {},
            rowIndex === data.length - 1 && !totalRow ? styles.rowLast : {},
          ]}
          wrap={false}
        >
          {columns.map((col, colIndex) => (
            <Text key={colIndex} style={[styles.cell, { width: col.width, textAlign: col.align ?? 'left' }]}>
              {col.render(row, rowIndex)}
            </Text>
          ))}
        </View>
      ))}

      {totalRow && (
        <View style={styles.totalRow} wrap={false}>
          {columns.map((col, i) => (
            <Text key={i} style={[styles.totalCell, { width: col.width, textAlign: col.align ?? 'left' }]}>
              {totalRow[i] ?? ''}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}
