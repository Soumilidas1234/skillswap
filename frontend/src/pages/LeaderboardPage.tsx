import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { leaderboardService, User } from '@/services'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, getInitials } from '@/lib/utils'

const rankIcons = [Crown, Medal, Medal]
const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-700']

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    leaderboardService.getAll()
      .then(({ data }) => setUsers(data.data.slice(0, 100)))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
    )
  }

  const topThree = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <div>
      {topThree.length > 0 && (
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[1, 0, 2].map((idx) => {
            const user = topThree[idx]
            if (!user) return null
            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3
            const RankIcon = rankIcons[rank - 1] || Star
            const isFirst = rank === 1

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.15 }}
                className={cn(isFirst ? 'order-first sm:order-none sm:-mt-4' : '')}
              >
                <Card className={cn('text-center', isFirst && 'ring-2 ring-yellow-500/50')}>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: rank * 0.3 }}
                  >
                    <RankIcon className={cn('mx-auto h-8 w-8', rankColors[rank - 1])} />
                  </motion.div>
                  <div className={cn(
                    'mx-auto mt-3 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white',
                    isFirst ? 'h-20 w-20 text-2xl' : 'h-16 w-16 text-lg'
                  )}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                    ) : getInitials(user.name)}
                  </div>
                  <h3 className="mt-3 font-display font-semibold">{user.name}</h3>
                  <p className="text-2xl font-bold gradient-text">{user.points.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Rank #{rank}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Top 100 Learners
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {rest.map((user, i) => {
            const rank = i + 4
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <motion.span
                  className="w-8 text-center font-bold text-gray-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 + 0.2, type: 'spring' }}
                >
                  {rank}
                </motion.span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 text-sm font-bold text-white">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                  ) : getInitials(user.name)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  {user.role === 'admin' && (
                    <span className="text-xs text-primary">Admin</span>
                  )}
                </div>
                <span className="font-semibold text-primary">{user.points.toLocaleString()} pts</span>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
