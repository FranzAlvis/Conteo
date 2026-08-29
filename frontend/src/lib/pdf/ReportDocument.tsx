import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { pdfTheme } from './theme'

// Evita que react-pdf parta palabras con un guion cuando no entran en el
// ancho disponible (ej. "TRAN-SCRIPTOR"): al devolver la palabra como un
// único bloque indivisible, el motor la manda entera a la siguiente línea.
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    ...pdfTheme.page,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: pdfTheme.text,
  },
  banner: {
    backgroundColor: pdfTheme.primary,
    paddingHorizontal: 32,
    paddingTop: 22,
    paddingBottom: 16,
    marginBottom: 18,
  },
  bannerUniversidad: {
    fontSize: 8,
    color: pdfTheme.onPrimary,
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bannerTitulo: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: pdfTheme.onPrimary,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: pdfTheme.headerBg,
    color: pdfTheme.primaryDark,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  metaText: {
    fontSize: 8,
    color: pdfTheme.mutedText,
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: pdfTheme.border,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7.5,
    color: pdfTheme.mutedText,
  },
})

type ReportDocumentProps = {
  /** Etiqueta corta del reporte, ej. "CANTIDAD DE MESAS POR FACULTAD" */
  titulo: string
  children: React.ReactNode
}

/**
 * Membrete + pie de página compartido por todos los reportes oficiales
 * (mesas por facultad, nómina de transcriptores, nómina de delegados).
 */
export function ReportDocument({ titulo, children }: ReportDocumentProps) {
  const fecha = new Date().toLocaleString('es-BO', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.banner} fixed>
          <Text style={styles.bannerUniversidad}>
            Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca
          </Text>
          <Text style={styles.bannerTitulo}>Elecciones Autoridades Universitarias 2026 — Vicerrectorado</Text>
        </View>

        <View style={{ paddingHorizontal: 32 }}>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>{titulo}</Text>
            <Text style={styles.metaText}>Emitido: {fecha}</Text>
          </View>

          {children}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Sistema de Conteo de Votos — Centro de Cómputo Electoral</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
