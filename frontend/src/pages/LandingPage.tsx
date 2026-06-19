import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Users, Trophy, ArrowRight, ChevronDown,
  Star, Zap, Shield, MessageSquare, Award, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  statsService, skillService, categoryService, leaderboardService,
  Skill, Category, User,
} from '@/services'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { SkillCard } from '@/components/SkillCard'
import { Skeleton, SkillCardSkeleton } from '@/components/ui/Skeleton'
import { getInitials } from '@/lib/utils'
import { images, getCategoryImage } from '@/lib/images'

const features = [
  { icon: Sparkles, title: 'AI-Powered Matching', desc: 'Smart algorithms connect you with ideal learning partners.' },
  { icon: Users, title: 'Peer Learning', desc: 'Learn from real people with hands-on expertise.' },
  { icon: Trophy, title: 'Gamified Progress', desc: 'Earn points, badges, and climb the leaderboard.' },
  { icon: Shield, title: 'Verified Certificates', desc: 'Get QR-verified certificates for completed skills.' },
  { icon: Zap, title: 'Instant Requests', desc: 'Send learning requests with real-time notifications.' },
  { icon: MessageSquare, title: 'Rich Profiles', desc: 'Showcase skills, bio, and social links.' },
]

const steps = [
  { step: '01', title: 'Create Profile', desc: 'Sign up and tell us what you know and want to learn.' },
  { step: '02', title: 'Browse Skills', desc: 'Explore thousands of skills across categories.' },
  { step: '03', title: 'Send Request', desc: 'Connect with teachers and schedule your sessions.' },
  { step: '04', title: 'Learn & Earn', desc: 'Complete exchanges, earn points and certificates.' },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'Frontend Developer', avatar: images.avatars['Sarah Chen'], text: 'SkillSwap helped me learn Python while teaching React. The community is amazing!', rating: 5 },
  { name: 'Marcus Johnson', role: 'Data Scientist', avatar: images.avatars['Marcus Johnson'], text: 'I earned 3 certificates and climbed to top 50 on the leaderboard in just 2 months.', rating: 5 },
  { name: 'Priya Sharma', role: 'UX Designer', avatar: images.avatars['Priya Sharma'], text: 'The AI matching found me the perfect Figma mentor. Highly recommend!', rating: 5 },
]

const faqs = [
  { q: 'Is SkillSwap free to use?', a: 'Yes! Creating an account and browsing skills is completely free. Premium features may be added in the future.' },
  { q: 'How does skill matching work?', a: 'Our AI analyzes your profile, skills, and learning goals to recommend the best teachers and learners for you.' },
  { q: 'Are certificates verified?', a: 'Yes, all certificates include a unique QR code that can be verified on our platform.' },
  { q: 'Can I teach and learn simultaneously?', a: 'Absolutely! SkillSwap is built on reciprocity — teach what you know while learning what you need.' },
]

export default function LandingPage() {
  const [stats, setStats] = useState({ total_users: 0, total_skills: 0, total_requests: 0 })
  const [popularSkills, setPopularSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      statsService.getPublic(),
      skillService.getPopular(),
      categoryService.getTop(),
      leaderboardService.getPreview(),
    ])
      .then(([statsRes, skillsRes, catRes, lbRes]) => {
        setStats(statsRes.data?.data ?? { total_users: 0, total_skills: 0, total_requests: 0 })
        setPopularSkills(skillsRes.data?.data ?? [])
        setCategories(catRes.data?.data ?? [])
        setLeaderboard(lbRes.data?.data ?? [])
      })
      .catch(() => toast.error('Failed to load some content'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" /> AI-Powered Skill Exchange
              </span>
              <h1 className="mt-6 font-display text-5xl font-bold leading-tight lg:text-6xl">
                Learn Anything,{' '}
                <span className="gradient-text">Teach Everything</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                Join the peer-to-peer learning revolution. Swap skills, earn certificates,
                and grow with a global community of learners and teachers.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg">Get Started Free <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link to="/browse">
                  <Button variant="outline" size="lg">Browse Skills</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img
                src={images.hero}
                alt="People exchanging skills on SkillSwap"
                className="relative z-10 w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-y border-gray-200 bg-white/50 py-16 dark:border-gray-800 dark:bg-gray-950/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { label: 'Active Users', value: stats.total_users, suffix: '+' },
              { label: 'Skills Listed', value: stats.total_skills, suffix: '+' },
              { label: 'Learning Requests', value: stats.total_requests, suffix: '+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-4xl font-bold gradient-text">
                  {loading ? '—' : <AnimatedCounter value={stat.value} suffix={stat.suffix} />}
                </p>
                <p className="mt-2 text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Why Choose <span className="gradient-text">SkillSwap</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
              Everything you need for meaningful peer-to-peer learning
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="gradient-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold lg:text-4xl">How It Works</h2>
            <p className="mt-4 text-gray-500">Four simple steps to start your learning journey</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <img
                  src={images.steps[i]}
                  alt={s.title}
                  className="mx-auto h-24 w-24 rounded-2xl object-cover shadow-md"
                />
                <div className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-xs font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-3 font-display font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Explore Categories</h2>
              <p className="mt-2 text-gray-500">Find skills across diverse fields</p>
            </div>
            <Link to="/categories" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : (
              categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/browse?category_id=${cat.id}`}>
                    <Card className="group cursor-pointer overflow-hidden p-0">
                      {getCategoryImage(cat.slug) ? (
                        <img
                          src={getCategoryImage(cat.slug)}
                          alt={cat.name}
                          className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="flex h-28 items-center justify-center text-3xl"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          {cat.icon}
                        </div>
                      )}
                      <div className="p-4 text-center">
                        <h3 className="font-medium">{cat.name}</h3>
                        <p className="mt-1 text-xs text-gray-500">{cat.skill_count} skills</p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="bg-gray-50 py-20 dark:bg-gray-900/50 lg:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Popular Skills</h2>
              <p className="mt-2 text-gray-500">Trending skills loved by the community</p>
            </div>
            <Link to="/browse" className="text-sm font-medium text-primary hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkillCardSkeleton key={i} />)
            ) : (
              popularSkills.slice(0, 4).map((skill, i) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <SkillCard skill={skill} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold flex items-center gap-2">
                <Award className="h-8 w-8 text-warning" /> Top Learners
              </h2>
              <p className="mt-2 text-gray-500">Community leaders this month</p>
            </div>
            <Link to="/leaderboard" className="text-sm font-medium text-primary hover:underline">
              Full leaderboard →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            ) : (
              leaderboard.slice(0, 5).map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                      ) : getInitials(user.name)}
                    </div>
                    <p className="mt-3 font-medium line-clamp-1">{user.name}</p>
                    <p className="text-sm font-semibold text-primary">{user.points.toLocaleString()} pts</p>
                    <p className="text-xs text-gray-400">#{i + 1}</p>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="gradient-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">What Our Users Say</h2>
            <p className="mt-4 text-gray-500">Real stories from our community</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{faq.q}</h3>
                    <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 text-sm text-gray-500"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 text-center text-white lg:p-16"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.85), rgba(139,92,246,0.85)), url(${images.ctaBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative">
              <CheckCircle className="mx-auto h-12 w-12 opacity-80" />
              <h2 className="mt-6 font-display text-3xl font-bold lg:text-4xl">
                Ready to Start Learning?
              </h2>
              <p className="mx-auto mt-4 max-w-lg opacity-90">
                Join thousands of learners and teachers. Create your free account today.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
