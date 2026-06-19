import { Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Send, Bell, Trophy, Award, FileText,
  User, Settings, LogOut, Menu, X, Plus, Shield
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, toggleSidebar } from '@/store'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'

const sidebarLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-skills', icon: BookOpen, label: 'My Skills' },
  { to: '/skills/add', icon: Plus, label: 'Add Skill' },
  { to: '/requests', icon: Send, label: 'Requests' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/certificates', icon: FileText, label: 'Certificates' },
  { to: '/leaderboard', icon: Award, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function DashboardLayout() {
  const { isAuthenticated, loading, user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const dispatch = useDispatch()
  const sidebarOpen = useSelector((s: RootState) => s.app.sidebarOpen)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  const links = isAdmin
    ? [...sidebarLinks, { to: '/admin', icon: Shield, label: 'Admin Panel' }]
    : sidebarLinks

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Logo size="sm" className="font-display text-lg" />
        <p className="mt-1 text-xs text-gray-500">{user?.name}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
              location.pathname === link.to
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <button onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className={cn(
        'hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:block',
        sidebarOpen ? 'w-64' : 'w-20'
      )}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => { dispatch(toggleSidebar()); setMobileOpen(true) }} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-display text-lg font-semibold capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {user?.points} pts
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white/90 backdrop-blur lg:hidden dark:border-gray-800 dark:bg-gray-900/90">
        {links.slice(0, 5).map((link) => (
          <Link key={link.to} to={link.to}
            className={cn('flex flex-1 flex-col items-center py-2 text-xs',
              location.pathname === link.to ? 'text-primary' : 'text-gray-500')}>
            <link.icon className="h-5 w-5" />
            {link.label.split(' ')[0]}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
