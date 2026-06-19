import { Link } from 'react-router-dom'
import { Sparkles, Share2, Globe, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/50 dark:border-gray-800 dark:bg-gray-950/50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text">SkillSwap</span>
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Connect, learn, and grow. Share your skills with the world.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/browse" className="hover:text-primary">Browse Skills</Link></li>
              <li><Link to="/categories" className="hover:text-primary">Categories</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary">Leaderboard</Link></li>
              <li><Link to="/features" className="hover:text-primary">Features</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Connect</h4>
            <div className="flex gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <a key={i} href="#" className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Icon className="h-5 w-5 text-gray-500" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800">
          © {new Date().getFullYear()} SkillSwap. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
