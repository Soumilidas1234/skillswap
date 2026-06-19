import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationService, Notification } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/SkillCard'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadNotifications = useCallback(async (pageNum: number, append = false) => {
    try {
      const { data } = await notificationService.getAll(pageNum)
      const payload = data.data as { items: Notification[]; pagination: { has_more: boolean } }
      setNotifications((prev) => append ? [...prev, ...payload.items] : payload.items)
      setHasMore(payload.pagination.has_more)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadNotifications(1) }, [loadNotifications])

  const markRead = async (id: number) => {
    try {
      await notificationService.markRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadNotifications(next, true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-gray-500">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {!notifications.length ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={cn(
                    'flex items-start gap-4 transition-colors',
                    !notif.is_read && 'border-primary/30 bg-primary/5'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    notif.is_read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary/10'
                  )}>
                    <Bell className={cn('h-5 w-5', notif.is_read ? 'text-gray-400' : 'text-primary')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium">{notif.title}</h3>
                      <span className="shrink-0 text-xs text-gray-500">{formatDate(notif.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{notif.message}</p>
                  </div>
                  {!notif.is_read && (
                    <Button variant="ghost" size="icon" onClick={() => markRead(notif.id)} title="Mark as read">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <div className="pt-4 text-center">
              <Button variant="outline" onClick={loadMore}>Load more</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
