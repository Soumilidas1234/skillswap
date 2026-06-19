import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'

const navLinks = [
  { to: '/features', label: 'Features' },
  { to: '/browse', label: 'Browse Skills' },
  { to: '/categories', label: 'Categories' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/about', label: 'About' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl"
    >
      <div className="glass flex items-center justify-between rounded-2xl px-6 py-3">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button onClick={toggleTheme} className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {isAuthenticated ? (
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mt-2 rounded-2xl p-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium">{link.label}</Link>
          ))}
          <div className="mt-4 flex gap-2">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
            <Link to="/register" className="flex-1"><Button className="w-full">Sign Up</Button></Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
