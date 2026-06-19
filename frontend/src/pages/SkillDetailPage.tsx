import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, Eye, Send, X, User, Tag, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { skillService, requestService, Skill } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { images } from '@/lib/images'

interface RequestForm {
  message: string
  preferred_timing: string
}

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RequestForm>()

  useEffect(() => {
    if (!id) return
    skillService.getById(Number(id))
      .then(({ data }) => setSkill(data.data))
      .catch(() => toast.error('Skill not found'))
      .finally(() => setLoading(false))
  }, [id])

  const onSubmitRequest = async (data: RequestForm) => {
    if (!skill) return
    setSubmitting(true)
    try {
      await requestService.create({
        skill_id: skill.id,
        message: data.message,
        preferred_timing: data.preferred_timing,
      })
      toast.success('Request sent successfully!')
      setShowModal(false)
      reset()
      navigate('/requests')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to send a request')
      navigate('/login')
      return
    }
    if (user?.id === skill?.user_id) {
      toast.error('You cannot request your own skill')
      return
    }
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-display text-2xl font-semibold">Skill not found</h2>
        <Link to="/browse" className="mt-4 inline-block text-primary hover:underline">Browse skills</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative mb-8 h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
          <img
            src={skill.thumbnail || images.defaultSkill}
            alt={skill.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">{skill.category_name}</span>
            <h1 className="mt-2 font-display text-3xl font-bold">{skill.title}</h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="font-display text-lg font-semibold">About this skill</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{skill.description}</p>

              {skill.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {skill.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      <Tag className="h-3 w-3" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="font-display text-lg font-semibold">Details</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="font-medium capitalize">{skill.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium">{skill.experience_years} years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Views</p>
                    <p className="font-medium">{skill.views}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="font-medium">{skill.rating || 'New'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                  {skill.teacher_avatar ? (
                    <img src={skill.teacher_avatar} alt={skill.teacher_name} className="h-full w-full rounded-full object-cover" />
                  ) : skill.teacher_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-display font-semibold">{skill.teacher_name}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  skill.availability === 'available' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {skill.availability}
                </span>
              </div>
              <Button className="mt-6 w-full" onClick={handleRequestClick}>
                <Send className="h-4 w-4" /> Request to Learn
              </Button>
              <p className="mt-2 text-center text-xs text-gray-500">Posted {formatDate(skill.created_at)}</p>
            </Card>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Send Learning Request</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-4 text-sm text-gray-500">
                Request to learn <strong>{skill.title}</strong> from {skill.teacher_name}
              </p>
              <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Message</label>
                  <textarea
                    className="input-field px-4 min-h-[100px] resize-y"
                    placeholder="Introduce yourself and explain what you'd like to learn..."
                    {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'At least 10 characters' } })}
                  />
                  {errors.message && <p className="mt-1 text-xs text-danger">{errors.message.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Preferred Timing</label>
                  <Input placeholder="e.g. Weekday evenings" {...register('preferred_timing')} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  <User className="h-4 w-4" />
                  {submitting ? 'Sending...' : 'Send Request'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
