import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { achievementService, Achievement } from '@/services'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

const tierColors: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-cyan-400 to-purple-400',
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    achievementService.getMy()
      .then(({ data }) => setAchievements(data.data))
      .catch(() => toast.error('Failed to load achievements'))
      .finally(() => setLoading(false))
  }, [])

  const unlocked = achievements.filter((a) => a.unlocked_at)
  const locked = achievements.filter((a) => !a.unlocked_at)

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total', value: achievements.length },
          { label: 'Unlocked', value: unlocked.length },
          { label: 'Locked', value: locked.length },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="text-center">
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {unlocked.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" /> Unlocked
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlocked.map((ach, i) => (
              <AchievementCard key={ach.id} achievement={ach} index={i} />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" /> Locked
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((ach, i) => (
              <AchievementCard key={ach.id} achievement={ach} index={i} locked />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function AchievementCard({ achievement, index, locked = false }: { achievement: Achievement; index: number; locked?: boolean }) {
  const tierGradient = tierColors[achievement.tier] || tierColors.bronze

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
      <Card className={cn('relative overflow-hidden', locked && 'opacity-60')}>
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5', tierGradient)} />
        <div className="relative flex items-start gap-4">
          <div className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl',
            tierGradient,
            locked ? 'grayscale' : ''
          )}>
            {achievement.icon || '🏆'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold">{achievement.name}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize dark:bg-gray-800">{achievement.tier}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{achievement.description}</p>
            {achievement.unlocked_at && (
              <p className="mt-2 text-xs text-success">Unlocked {formatDate(achievement.unlocked_at)}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
