import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderOpen, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService, certificateService, Category, CertificateMilestone } from '@/services'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/SkillCard'
import { getCategoryImage } from '@/lib/images'

const TIER_LABELS = ['Starter 10', 'Bronze 100', 'Silver 300', 'Gold 700', 'Platinum 1500', 'Diamond 5000', 'Legend 10000']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [milestones, setMilestones] = useState<CertificateMilestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([categoryService.getAll(), certificateService.getMilestones()])
      .then(([catRes, mileRes]) => {
        setCategories(catRes.data.data)
        setMilestones(mileRes.data.data)
      })
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  const milestonesFor = (categoryId: number) =>
    milestones.filter((m) => m.category_id === categoryId).sort((a, b) => a.min_points - b.min_points)

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!categories.length) {
    return <EmptyState title="No categories" description="Categories will appear here once added." />
  }

  return (
    <div>
      <p className="mb-4 text-gray-500">Browse skills organized by category</p>
      <Card className="mb-8">
        <div className="flex items-start gap-3">
          <Award className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-display font-semibold">Category milestone certificates</h3>
            <p className="mt-1 text-sm text-gray-500">
              Earn certificates in each category at: {TIER_LABELS.join(' · ')} category points.
            </p>
          </div>
        </div>
      </Card>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat, i) => {
          const catMilestones = milestonesFor(cat.id)
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/browse?category_id=${cat.id}`}>
                <Card className="group cursor-pointer overflow-hidden p-0 h-full">
                  {getCategoryImage(cat.slug) ? (
                    <img
                      src={getCategoryImage(cat.slug)}
                      alt={cat.name}
                      className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-32 items-center justify-center text-3xl"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      {cat.icon || <FolderOpen className="h-8 w-8" style={{ color: cat.color }} />}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-center">{cat.name}</h3>
                    {cat.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2 text-center">{cat.description}</p>
                    )}
                    <p className="mt-2 text-sm font-medium text-primary text-center">{cat.skill_count} skills</p>
                    {catMilestones.length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-1">
                        {catMilestones.map((m) => (
                          <span
                            key={m.id}
                            className="rounded-full px-2 py-0.5 text-[10px] capitalize"
                            style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                            title={`${m.name}: ${m.level_min}–${m.level_max === 999999 ? '10000+' : m.level_max} pts`}
                          >
                            {m.min_points}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
