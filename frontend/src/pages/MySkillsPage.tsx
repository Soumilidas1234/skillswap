import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { skillService, Skill } from '@/services'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SkillCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/SkillCard'
import { formatDate } from '@/lib/utils'
import { images } from '@/lib/images'

export default function MySkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const loadSkills = () => {
    setLoading(true)
    skillService.getMySkills()
      .then(({ data }) => setSkills(data.data))
      .catch(() => toast.error('Failed to load your skills'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadSkills() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this skill? This cannot be undone.')) return
    setDeleting(id)
    try {
      await skillService.delete(id)
      toast.success('Skill deleted')
      setSkills((prev) => prev.filter((s) => s.id !== id))
    } catch {
      toast.error('Failed to delete skill')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <SkillCardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-gray-500">{skills.length} skill{skills.length !== 1 ? 's' : ''} listed</p>
        <Link to="/skills/add">
          <Button><Plus className="h-4 w-4" /> Add Skill</Button>
        </Link>
      </div>

      {!skills.length ? (
        <EmptyState
          title="No skills yet"
          description="Start teaching by adding your first skill."
          action={<Link to="/skills/add"><Button><Plus className="h-4 w-4" /> Add Your First Skill</Button></Link>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, i) => (
            <motion.div key={skill.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden p-0">
                <div className="relative h-36 bg-gradient-to-br from-primary/20 to-secondary/20">
                  <img
                    src={skill.thumbnail || images.defaultSkill}
                    alt={skill.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium dark:bg-gray-900/90">
                    {skill.status}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold line-clamp-1">{skill.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{skill.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {skill.views}</span>
                    <span>{formatDate(skill.created_at)}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/skills/add?id=${skill.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deleting === skill.id}
                      onClick={() => handleDelete(skill.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
