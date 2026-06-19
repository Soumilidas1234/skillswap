import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Users, BookOpen, Send, Shield, Trash2, Ban, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface AdminDashboard {
  total_users: number
  total_skills: number
  total_requests: number
  pending_requests: number
  accepted_requests: number
  rejected_requests: number
  monthly_growth: { month: string; users: number; skills: number }[]
  recent_activity: { action: string; description: string; user_name: string; created_at: string }[]
}

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  points: number
  is_suspended: boolean
  created_at: string
}

interface AdminSkill {
  id: number
  title: string
  teacher_name: string
  status: string
  created_at: string
}

interface AdminRequest {
  id: number
  skill_title: string
  learner_name: string
  teacher_name: string
  status: string
  created_at: string
}

type Tab = 'users' | 'skills' | 'requests'

export default function AdminDashboardPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [skills, setSkills] = useState<AdminSkill[]>([])
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [tab, setTab] = useState<Tab>('users')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    Promise.all([
      adminService.getDashboard(),
      adminService.getUsers(),
      adminService.getSkills(),
      adminService.getRequests(),
    ])
      .then(([dash, usersRes, skillsRes, reqRes]) => {
        setDashboard(dash.data.data as unknown as AdminDashboard)
        setUsers((usersRes.data.data as { items: AdminUser[] }).items)
        setSkills((skillsRes.data.data as { items: AdminSkill[] }).items)
        setRequests((reqRes.data.data as { items: AdminRequest[] }).items)
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (authLoading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  const handleSuspend = async (id: number, suspended: boolean) => {
    setActionId(id)
    try {
      if (suspended) await adminService.unsuspendUser(id)
      else await adminService.suspendUser(id)
      toast.success(suspended ? 'User unsuspended' : 'User suspended')
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_suspended: !suspended } : u))
    } catch {
      toast.error('Action failed')
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user permanently?')) return
    setActionId(id)
    try {
      await adminService.deleteUser(id)
      toast.success('User deleted')
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteSkill = async (id: number) => {
    if (!confirm('Delete this skill?')) return
    setActionId(id)
    try {
      await adminService.deleteSkill(id)
      toast.success('Skill deleted')
      setSkills((prev) => prev.filter((s) => s.id !== id))
    } catch {
      toast.error('Failed to delete skill')
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  const stats = [
    { label: 'Total Users', value: dashboard?.total_users ?? 0, icon: Users, color: 'text-primary' },
    { label: 'Total Skills', value: dashboard?.total_skills ?? 0, icon: BookOpen, color: 'text-secondary' },
    { label: 'Total Requests', value: dashboard?.total_requests ?? 0, icon: Send, color: 'text-accent' },
    { label: 'Pending', value: dashboard?.pending_requests ?? 0, icon: Shield, color: 'text-warning' },
  ]

  const growth = dashboard?.monthly_growth ?? []
  const barData = {
    labels: growth.map((g) => g.month),
    datasets: [
      { label: 'Users', data: growth.map((g) => g.users), backgroundColor: '#6366F1', borderRadius: 6 },
      { label: 'Skills', data: growth.map((g) => g.skills), backgroundColor: '#8B5CF6', borderRadius: 6 },
    ],
  }

  const doughnutData = {
    labels: ['Accepted', 'Pending', 'Rejected'],
    datasets: [{
      data: [
        dashboard?.accepted_requests ?? 0,
        dashboard?.pending_requests ?? 0,
        dashboard?.rejected_requests ?? 0,
      ],
      backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Admin Dashboard
        </h2>
        <p className="text-gray-500">Platform overview and management</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              {growth.length > 0 ? (
                <Bar data={barData} options={chartOptions} />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No growth data</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Request Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {(['users', 'skills', 'requests'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {tab === 'users' && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Points</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">{u.points}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${u.is_suspended ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                        {u.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" disabled={actionId === u.id} onClick={() => handleSuspend(u.id, u.is_suspended)}>
                          {u.is_suspended ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                        </Button>
                        <Button size="sm" variant="danger" disabled={actionId === u.id} onClick={() => handleDeleteUser(u.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'skills' && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Teacher</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {skills.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-medium">{s.title}</td>
                    <td className="px-4 py-3 text-gray-500">{s.teacher_name}</td>
                    <td className="px-4 py-3 capitalize">{s.status}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="danger" disabled={actionId === s.id} onClick={() => handleDeleteSkill(s.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'requests' && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Skill</th>
                  <th className="px-4 py-3 text-left font-medium">Learner</th>
                  <th className="px-4 py-3 text-left font-medium">Teacher</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 font-medium">{r.skill_title}</td>
                    <td className="px-4 py-3 text-gray-500">{r.learner_name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.teacher_name}</td>
                    <td className="px-4 py-3 capitalize">{r.status}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}
