import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import {
  BookOpen, Send, Bell, Trophy, TrendingUp, Activity,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { userService, LearningRequest } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatDate, cn } from '@/lib/utils'
import { images } from '@/lib/images'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface DashboardData {
  total_skills: number
  incoming_requests: number
  outgoing_requests: number
  unread_notifications: number
  rank: number
  recent_requests: LearningRequest[]
  points_history: { points: number; reason: string; created_at: string }[]
  activity: { action: string; description: string; created_at: string }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getDashboard()
      .then(({ data: res }) => setData(res.data as unknown as DashboardData))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const stats = [
    { label: 'My Skills', value: data?.total_skills ?? 0, icon: BookOpen, color: 'text-primary', to: '/my-skills' },
    { label: 'Incoming', value: data?.incoming_requests ?? 0, icon: Send, color: 'text-success', to: '/requests' },
    { label: 'Outgoing', value: data?.outgoing_requests ?? 0, icon: TrendingUp, color: 'text-accent', to: '/requests' },
    { label: 'Notifications', value: data?.unread_notifications ?? 0, icon: Bell, color: 'text-warning', to: '/notifications' },
  ]

  const pointsHistory = data?.points_history ?? []
  const lineData = {
    labels: pointsHistory.map((p) => formatDate(p.created_at)).reverse(),
    datasets: [{
      label: 'Points Earned',
      data: pointsHistory.map((p) => p.points).reverse(),
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }

  const requestCounts = {
    incoming: data?.incoming_requests ?? 0,
    outgoing: data?.outgoing_requests ?? 0,
  }
  const barData = {
    labels: ['Incoming', 'Outgoing'],
    datasets: [{
      label: 'Requests',
      data: [requestCounts.incoming, requestCounts.outgoing],
      backgroundColor: ['#22C55E', '#06B6D4'],
      borderRadius: 8,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <img
          src={images.dashboardWelcome}
          alt=""
          className="h-36 w-full object-cover sm:h-44"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
          <h2 className="font-display text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-white/80">
            Rank #{data?.rank ?? '—'} · {user?.points ?? 0} points
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={stat.to}>
              <Card className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800', stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Points History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pointsHistory.length > 0 ? (
                <Line data={lineData} options={chartOptions} />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No points history yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-success" /> Requests Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={barData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" /> Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.recent_requests?.length ? (
              <p className="text-sm text-gray-500">No recent requests</p>
            ) : (
              <div className="space-y-3">
                {data.recent_requests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                    <div>
                      <p className="font-medium text-sm">{req.skill_title}</p>
                      <p className="text-xs text-gray-500 capitalize">{req.status} · {formatDate(req.created_at)}</p>
                    </div>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs capitalize',
                      req.status === 'pending' ? 'bg-warning/10 text-warning' :
                      req.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                    )}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/requests" className="mt-4 inline-block text-sm text-primary hover:underline">View all requests →</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.activity?.length ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {data.activity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm">{act.description || act.action}</p>
                      <p className="text-xs text-gray-500">{formatDate(act.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/achievements" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <Trophy className="h-4 w-4" /> View achievements →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
