import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { images } from '@/lib/images'

interface StaticPageProps {
  title: string
  subtitle: string
  banner?: string
  children: ReactNode
}

function StaticPageShell({ title, subtitle, banner, children }: StaticPageProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link to="/" className="font-display text-sm font-medium text-primary hover:underline">← Back to Home</Link>
          <h1 className="mt-6 font-display text-4xl font-bold lg:text-5xl">{title}</h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{subtitle}</p>
        </motion.div>

        {banner && (
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            src={banner}
            alt=""
            className="mt-10 w-full rounded-2xl object-cover shadow-lg"
            aria-hidden
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card mt-12 space-y-6 text-gray-600 dark:text-gray-300"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <StaticPageShell
      title="About SkillSwap"
      subtitle="Empowering peer-to-peer learning through intelligent skill matching"
      banner={images.aboutBanner}
    >
      <p>
        SkillSwap is a modern platform where learners and teachers connect to exchange knowledge.
        Our mission is to make learning accessible, collaborative, and rewarding for everyone.
      </p>
      <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">Our Vision</h2>
      <p>
        We believe everyone has something to teach and something to learn. By connecting people based on
        skills, interests, and availability, we create a global community of lifelong learners.
      </p>
      <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">What We Offer</h2>
      <ul className="list-inside list-disc space-y-2">
        <li>AI-powered skill matching and recommendations</li>
        <li>Verified certificates upon skill completion</li>
        <li>Points, achievements, and leaderboard rankings</li>
        <li>Secure messaging and learning request management</li>
      </ul>
      <p>
        Founded in 2026, SkillSwap has helped thousands of users discover new skills, build meaningful
        connections, and grow their careers through peer learning.
      </p>
    </StaticPageShell>
  )
}
