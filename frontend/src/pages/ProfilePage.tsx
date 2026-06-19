import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Camera, Save, MapPin, Globe, AtSign, Link, Code } from 'lucide-react'
import toast from 'react-hot-toast'
import { userService, uploadService, User, UserLevel } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { getInitials } from '@/lib/utils'

type ProfileForm = Pick<User, 'name' | 'bio' | 'location' | 'website' | 'twitter' | 'linkedin' | 'github'>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>()

  useEffect(() => {
    userService.getProfile()
      .then(({ data }) => {
        const profile = data.data
        updateUser(profile)
        setUserLevel(profile.user_level ?? null)
        reset({
          name: profile.name,
          bio: profile.bio || '',
          location: profile.location || '',
          website: profile.website || '',
          twitter: profile.twitter || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [reset, updateUser])

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true)
    try {
      const { data: res } = await userService.updateProfile(data)
      updateUser(res.data)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await uploadService.avatar(file)
      const avatarUrl = (data.data as { avatar: string }).avatar
      const { data: res } = await userService.updateProfile({ avatar: avatarUrl })
      updateUser(res.data)
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl">
      <Card className="mb-6">
        <CardContent className="flex flex-col items-center pt-6 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : getInitials(user?.name || 'U')}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <h2 className="font-display text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="mt-2 text-sm text-primary">
              {user?.points} points · Rank #{user?.rank || '—'}
              {userLevel && (
                <> · Level {userLevel.level} ({userLevel.name})</>
              )}
            </p>
            {userLevel && userLevel.next_level_at && (
              <div className="mt-3 max-w-xs">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{userLevel.name}</span>
                  <span>{userLevel.progress}% to next level</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${userLevel.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Range: {userLevel.min_points}–{userLevel.max_points ?? '10000+'} pts
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <Input {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Bio</label>
              <textarea className="input-field px-4 min-h-[100px] resize-y" placeholder="Tell us about yourself..." {...register('bio')} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input className="pl-10" placeholder="City, Country" {...register('location')} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input className="pl-10" placeholder="https://yoursite.com" {...register('website')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Twitter</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input className="pl-10" placeholder="@username" {...register('twitter')} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">LinkedIn</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input className="pl-10" placeholder="linkedin.com/in/..." {...register('linkedin')} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">GitHub</label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input className="pl-10" placeholder="github.com/..." {...register('github')} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
