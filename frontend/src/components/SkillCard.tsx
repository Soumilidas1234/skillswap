import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Skill } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { images } from '@/lib/images'

interface SkillCardProps {
  skill: Skill
  className?: string
}

export function SkillCard({ skill, className }: SkillCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className={cn('overflow-hidden p-0', className)}>
        <div className="relative h-44 bg-gradient-to-br from-primary/20 to-secondary/20">
          <img
            src={skill.thumbnail || images.defaultSkill}
            alt={skill.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium dark:bg-gray-900/90">
            {skill.level}
          </span>
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {skill.category_name}
            </span>
            <span className={cn('text-xs',
              skill.availability === 'available' ? 'text-success' : 'text-warning')}>
              {skill.availability}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold line-clamp-1">{skill.title}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{skill.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs">
                {skill.teacher_name?.charAt(0)}
              </div>
              <span className="text-sm font-medium">{skill.teacher_name}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Star className="h-4 w-4 text-warning fill-warning" />
              {skill.rating || 'New'}
            </div>
          </div>
          <Link to={`/skills/${skill.id}`} className="mt-4 block">
            <Button className="w-full" size="sm">View Skill</Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <img src={images.emptyState} alt="" className="mb-6 h-40 w-auto object-contain" aria-hidden />
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
