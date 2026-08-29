import { PDFDownloadLink, PDFViewer, type DocumentProps } from '@react-pdf/renderer'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'

type ReportPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  fileName: string
  content: React.ReactElement
}

/**
 * Vista previa + descarga de un reporte en PDF (react-pdf), reusada por
 * Mesas por Facultad, Nómina de Transcriptores y Nómina de Delegados.
 */
export function ReportPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  fileName,
  content,
}: ReportPreviewDialogProps) {
  // Los reportes envuelven <Document> dentro de un componente propio
  // (ReportDocument), así que TS no puede inferir el tipo exacto que
  // react-pdf espera para su prop `document` — el render real sí es un
  // <Document> válido, solo hace falta esta aserción para el compilador.
  const pdfDocument = content as React.ReactElement<DocumentProps>

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl p-0 gap-0 overflow-hidden'>
        <DialogHeader className='p-4 pb-3 border-b space-y-0'>
          <div className='flex items-center justify-between gap-3 pe-6'>
            <div className='min-w-0'>
              <DialogTitle className='text-base font-bold flex items-center gap-2'>
                <FileText className='h-4 w-4 text-primary shrink-0' />
                <span className='truncate'>{title}</span>
              </DialogTitle>
              <DialogDescription className='text-xs'>{description}</DialogDescription>
            </div>
            {open && (
              <PDFDownloadLink document={pdfDocument} fileName={fileName}>
                {({ loading }) => (
                  <Button size='sm' disabled={loading} className='text-xs font-bold gap-1.5 shrink-0'>
                    <Download className='h-3.5 w-3.5' /> {loading ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </DialogHeader>

        <div className='h-[75vh] bg-muted/30'>
          {open && (
            <PDFViewer width='100%' height='100%' showToolbar={false} style={{ border: 'none' }}>
              {pdfDocument}
            </PDFViewer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
