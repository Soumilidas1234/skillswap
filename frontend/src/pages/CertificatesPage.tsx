import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Award, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { QRCodeCanvas } from 'qrcode.react'
import { certificateService, Certificate } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/SkillCard'
import { formatDate } from '@/lib/utils'
import { images } from '@/lib/images'

const MILESTONE_TIERS = [10, 100, 300, 700, 1500, 5000, 10000]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function CertificateCard({
  cert,
  index,
  downloading,
  onDownload,
  qrRefs,
}: {
  cert: Certificate
  index: number
  downloading: string | null
  onDownload: (c: Certificate) => void
  qrRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
}) {
  const isMilestone = cert.cert_type === 'milestone'
  const verifyUrl = cert.qr_data?.verify_url || `${window.location.origin}/certificates/verify/${cert.certificate_id}`

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <div className="relative flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isMilestone ? 'bg-warning/10' : 'bg-primary/10'}`}>
            {isMilestone ? <Star className="h-7 w-7 text-warning" /> : <Award className="h-7 w-7 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-semibold">{cert.skill_name}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize dark:bg-gray-800">
                {isMilestone ? `${cert.milestone_tier} · ${cert.category_name}` : 'session'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {isMilestone
                ? `Level ${cert.milestone_level} · ${cert.milestone_points} pts in category`
                : `Taught by ${cert.teacher_name}`}
            </p>
            {isMilestone && cert.level_min != null && (
              <p className="mt-1 text-xs text-gray-400">
                Level range: {cert.level_min}–{cert.level_max === 999999 ? '∞' : cert.level_max} points
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {formatDate(cert.completion_date)} · ID: {cert.certificate_id}
            </p>
            <Button
              size="sm"
              className="mt-4"
              disabled={downloading === cert.certificate_id}
              onClick={() => onDownload(cert)}
            >
              <Download className="h-3 w-3" />
              {downloading === cert.certificate_id ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
          <div ref={(el) => { qrRefs.current[cert.certificate_id] = el }} className="hidden" aria-hidden>
            <QRCodeCanvas value={verifyUrl} size={128} />
          </div>
          <div className="shrink-0 rounded-lg bg-white p-1 dark:bg-gray-800">
            <QRCodeCanvas value={verifyUrl} size={64} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const qrRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    certificateService.getAll()
      .then(({ data }) => setCertificates(data.data))
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false))
  }, [])

  const downloadPDF = async (cert: Certificate) => {
    setDownloading(cert.certificate_id)
    const isMilestone = cert.cert_type === 'milestone'
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      try {
        const bg = await loadImage(images.certificateBg)
        pdf.addImage(bg, 'PNG', 0, 0, pageWidth, pageHeight)
      } catch {
        pdf.setFillColor(99, 102, 241)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        pdf.setFillColor(255, 255, 255)
        pdf.roundedRect(15, 15, pageWidth - 30, pageHeight - 30, 3, 3, 'F')
      }

      pdf.setTextColor(99, 102, 241)
      pdf.setFontSize(28)
      pdf.text(isMilestone ? 'Milestone Certificate' : 'Certificate of Completion', pageWidth / 2, 45, { align: 'center' })

      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(12)
      pdf.text('This certifies that', pageWidth / 2, 65, { align: 'center' })

      pdf.setTextColor(30, 30, 30)
      pdf.setFontSize(24)
      pdf.text(cert.learner_name, pageWidth / 2, 80, { align: 'center' })

      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(12)
      pdf.text(isMilestone ? 'has achieved milestone level in' : 'has successfully completed', pageWidth / 2, 95, { align: 'center' })

      pdf.setTextColor(99, 102, 241)
      pdf.setFontSize(20)
      pdf.text(cert.skill_name, pageWidth / 2, 110, { align: 'center' })

      pdf.setTextColor(100, 100, 100)
      pdf.setFontSize(11)
      if (isMilestone) {
        pdf.text(`Category: ${cert.category_name}`, pageWidth / 2, 125, { align: 'center' })
        pdf.text(`Level ${cert.milestone_level} (${cert.level_min}–${cert.level_max === 999999 ? '10000+' : cert.level_max} pts range)`, pageWidth / 2, 135, { align: 'center' })
      } else {
        pdf.text(`Taught by ${cert.teacher_name}`, pageWidth / 2, 125, { align: 'center' })
        pdf.text(`Completed on ${formatDate(cert.completion_date)}`, pageWidth / 2, 135, { align: 'center' })
      }
      pdf.text(`Certificate ID: ${cert.certificate_id}`, pageWidth / 2, 145, { align: 'center' })

      const qrEl = qrRefs.current[cert.certificate_id]
      const canvas = qrEl?.querySelector('canvas')
      if (canvas) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', pageWidth - 55, pageHeight - 55, 35, 35)
      }

      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text('SkillSwap — Verify at skillswap.ai', pageWidth / 2, pageHeight - 22, { align: 'center' })

      pdf.save(`certificate-${cert.certificate_id}.pdf`)
      toast.success('Certificate downloaded')
    } catch {
      toast.error('Failed to generate PDF')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    )
  }

  const milestoneCerts = certificates.filter((c) => c.cert_type === 'milestone')
  const sessionCerts = certificates.filter((c) => c.cert_type !== 'milestone')

  if (!certificates.length) {
    return (
      <div className="space-y-8">
        <EmptyState
          title="No certificates yet"
          description="Earn milestone certificates at 10, 100, 300, 700, 1500, 5000, and 10000 category points. Session certificates are issued when a teacher completes a learning request."
        />
        <Card>
          <h3 className="font-display font-semibold">Milestone tiers (per category)</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {MILESTONE_TIERS.map((pts) => (
              <span key={pts} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{pts} pts</span>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <p className="text-gray-500">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</p>

      {milestoneCerts.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" /> Milestone Certificates ({milestoneCerts.length})
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {milestoneCerts.map((cert, i) => (
              <CertificateCard key={cert.id} cert={cert} index={i} downloading={downloading} onDownload={downloadPDF} qrRefs={qrRefs} />
            ))}
          </div>
        </section>
      )}

      {sessionCerts.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Session Certificates ({sessionCerts.length})
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {sessionCerts.map((cert, i) => (
              <CertificateCard key={cert.id} cert={cert} index={i} downloading={downloading} onDownload={downloadPDF} qrRefs={qrRefs} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
