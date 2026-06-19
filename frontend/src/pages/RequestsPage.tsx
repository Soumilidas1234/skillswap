import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Ban, CheckCircle, Inbox, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { requestService, LearningRequest } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/SkillCard'
import { formatDate, cn } from '@/lib/utils'

type Tab = 'incoming' | 'outgoing'

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-danger/10 text-danger',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800',
  completed: 'bg-primary/10 text-primary',
}

export default function RequestsPage() {
  const [tab, setTab] = useState<Tab>('incoming')
  const [incoming, setIncoming] = useState<LearningRequest[]>([])
  const [outgoing, setOutgoing] = useState<LearningRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  const loadRequests = () => {
    setLoading(true)
    requestService.getAll()
      .then(({ data }) => {
        setIncoming(data.data.incoming)
        setOutgoing(data.data.outgoing)
      })
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRequests() }, [])

  const handleAction = async (id: number, action: 'accept' | 'reject' | 'complete' | 'cancel') => {
    setActionId(id)
    try {
      switch (action) {
        case 'accept': await requestService.accept(id); toast.success('Request accepted'); break
        case 'reject': await requestService.reject(id); toast.success('Request rejected'); break
        case 'complete': await requestService.complete(id); toast.success('Marked as completed'); break
        case 'cancel': await requestService.cancel(id); toast.success('Request cancelled'); break
      }
      loadRequests()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionId(null)
    }
  }

  const requests = tab === 'incoming' ? incoming : outgoing

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
        {([
          { key: 'incoming' as Tab, label: 'Incoming', icon: Inbox, count: incoming.length },
          { key: 'outgoing' as Tab, label: 'Outgoing', icon: Send, count: outgoing.length },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
              tab === t.key ? 'bg-white shadow dark:bg-gray-800' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {!requests.length ? (
        <EmptyState
          title={`No ${tab} requests`}
          description={tab === 'incoming' ? 'Requests from learners will appear here.' : 'Your sent requests will appear here.'}
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold">{req.skill_title}</h3>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusColors[req.status])}>
                          {req.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{req.message}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        {tab === 'incoming' ? (
                          <span>From: <strong>{req.learner_name}</strong></span>
                        ) : (
                          <span>To: <strong>{req.teacher_name}</strong></span>
                        )}
                        {req.preferred_timing && <span>Timing: {req.preferred_timing}</span>}
                        <span>{formatDate(req.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tab === 'incoming' && req.status === 'pending' && (
                        <>
                          <Button size="sm" variant="success" disabled={actionId === req.id} onClick={() => handleAction(req.id, 'accept')}>
                            <Check className="h-3 w-3" /> Accept
                          </Button>
                          <Button size="sm" variant="danger" disabled={actionId === req.id} onClick={() => handleAction(req.id, 'reject')}>
                            <X className="h-3 w-3" /> Reject
                          </Button>
                        </>
                      )}
                      {tab === 'incoming' && req.status === 'accepted' && (
                        <Button size="sm" disabled={actionId === req.id} onClick={() => handleAction(req.id, 'complete')}>
                          <CheckCircle className="h-3 w-3" /> Complete
                        </Button>
                      )}
                      {tab === 'outgoing' && (req.status === 'pending' || req.status === 'accepted') && (
                        <Button size="sm" variant="outline" disabled={actionId === req.id} onClick={() => handleAction(req.id, 'cancel')}>
                          <Ban className="h-3 w-3" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
