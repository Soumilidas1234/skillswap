import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Save, Upload, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { skillService, categoryService, uploadService, Category } from '@/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { Link } from 'react-router-dom'

interface SkillForm {
  title: string
  category_id: number
  description: string
  level: string
  availability: string
  experience_years: number
  tags: string
  thumbnail?: string
}

const levels = ['beginner', 'intermediate', 'advanced', 'expert']
const availabilityOptions = ['available', 'busy', 'unavailable']

export default function AddSkillPage() {
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!!editId)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [thumbnail, setThumbnail] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SkillForm>({
    defaultValues: { level: 'intermediate', availability: 'available', experience_years: 1 },
  })

  useEffect(() => {
    categoryService.getAll()
      .then(({ data }) => setCategories(data.data))
      .catch(() => toast.error('Failed to load categories'))
  }, [])

  useEffect(() => {
    if (!editId) return
    skillService.getById(Number(editId))
      .then(({ data }) => {
        const skill = data.data
        reset({
          title: skill.title,
          category_id: skill.category_id,
          description: skill.description,
          level: skill.level,
          availability: skill.availability,
          experience_years: skill.experience_years,
          tags: skill.tags?.join(', ') || '',
        })
        setThumbnail(skill.thumbnail)
      })
      .catch(() => toast.error('Failed to load skill'))
      .finally(() => setLoading(false))
  }, [editId, reset])

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await uploadService.thumbnail(file)
      const url = (data.data as { thumbnail: string }).thumbnail || (data.data as { url: string }).url
      setThumbnail(url)
      toast.success('Thumbnail uploaded')
    } catch {
      toast.error('Failed to upload thumbnail')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: SkillForm) => {
    setSaving(true)
    const payload = {
      title: data.title,
      category_id: Number(data.category_id),
      description: data.description,
      level: data.level,
      availability: data.availability,
      experience_years: Number(data.experience_years),
      tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
      thumbnail,
    }
    try {
      if (editId) {
        await skillService.update(Number(editId), payload)
        toast.success('Skill updated')
      } else {
        await skillService.create(payload)
        toast.success('Skill created')
      }
      navigate('/my-skills')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Failed to save skill')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl">
      <Link to="/my-skills" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to My Skills
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{editId ? 'Edit Skill' : 'Add New Skill'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input placeholder="e.g. React Development" {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'At least 3 characters' } })} />
              {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select className="input-field px-4" {...register('category_id', { required: 'Category is required' })}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-xs text-danger">{errors.category_id.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea
                className="input-field px-4 min-h-[120px] resize-y"
                placeholder="Describe what you can teach..."
                {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters' } })}
              />
              {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Level</label>
                <select className="input-field px-4" {...register('level')}>
                  {levels.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Availability</label>
                <select className="input-field px-4" {...register('availability')}>
                  {availabilityOptions.map((a) => <option key={a} value={a} className="capitalize">{a}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Experience (years)</label>
                <Input type="number" min={0} max={50} {...register('experience_years', { valueAsNumber: true })} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Tags (comma separated)</label>
              <Input placeholder="react, javascript, frontend" {...register('tags')} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Thumbnail</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-primary dark:border-gray-700 dark:bg-gray-900"
              >
                {thumbnail ? (
                  <img src={thumbnail} alt="Thumbnail" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Upload className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm">{uploading ? 'Uploading...' : 'Click to upload'}</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
            </div>

            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : editId ? 'Update Skill' : 'Create Skill'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
