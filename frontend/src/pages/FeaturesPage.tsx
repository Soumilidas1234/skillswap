import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Users, Trophy, Shield, Zap, BarChart3, Award, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { images } from '@/lib/images'

const features = [
  { icon: Sparkles, title: 'AI Skill Matching', desc: 'Smart algorithms connect you with the perfect teachers and learners based on your goals and expertise.' },
  { icon: Users, title: 'Peer-to-Peer Learning', desc: 'Learn directly from real people who have hands-on experience in the skills you want to master.' },
  { icon: Trophy, title: 'Gamified Progress', desc: 'Earn points, unlock achievements, and climb the leaderboard as you teach and learn.' },
  { icon: Shield, title: 'Verified Certificates', desc: 'Receive blockchain-ready certificates with QR verification upon completing skill exchanges.' },
  { icon: Zap, title: 'Instant Requests', desc: 'Send and receive learning requests with real-time notifications and status tracking.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track your learning journey with detailed stats, charts, and activity insights.' },
  { icon: Award, title: 'Achievement System', desc: 'Unlock badges across bronze, silver, gold, and platinum tiers as you hit milestones.' },
  { icon: MessageSquare, title: 'Rich Profiles', desc: 'Showcase your skills, bio, social links, and teaching portfolio to attract learners.' },
]

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link to="/" className="font-display text-sm font-medium text-primary hover:underline">← Back to Home</Link>
          <h1 className="mt-6 font-display text-4xl font-bold lg:text-5xl">
            Powerful <span className="gradient-text">Features</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Everything you need to teach, learn, and grow in one beautiful platform
          </p>
        </motion.div>

        <motion.img
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          src={images.featuresBanner}
          alt=""
          className="mt-12 w-full rounded-2xl object-cover shadow-lg"
          aria-hidden
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Link to="/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
