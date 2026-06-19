import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, User, Send, MapPin, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>()

  const onSubmit = async (_data: ContactForm) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Message sent! We\'ll get back to you soon.')
    reset()
    setLoading(false)
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link to="/" className="font-display text-sm font-medium text-primary hover:underline">← Back to Home</Link>
          <h1 className="mt-6 font-display text-4xl font-bold">Contact Us</h1>
          <p className="mt-4 text-lg text-gray-500">We&apos;d love to hear from you</p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'hello@skillswap.ai' },
              { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
              { icon: MapPin, label: 'Address', value: '123 Learning Lane, San Francisco, CA' },
            ].map((item) => (
              <Card key={item.label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </Card>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input className="pl-10" placeholder="Your name" {...register('name', { required: 'Required' })} />
                      </div>
                      {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input type="email" className="pl-10" placeholder="you@example.com" {...register('email', { required: 'Required' })} />
                      </div>
                      {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Subject</label>
                    <Input placeholder="How can we help?" {...register('subject', { required: 'Required' })} />
                    {errors.subject && <p className="mt-1 text-xs text-danger">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Message</label>
                    <textarea
                      className="input-field px-4 min-h-[140px] resize-y"
                      placeholder="Tell us more..."
                      {...register('message', { required: 'Required', minLength: { value: 10, message: 'At least 10 characters' } })}
                    />
                    {errors.message && <p className="mt-1 text-xs text-danger">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" disabled={loading}>
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
