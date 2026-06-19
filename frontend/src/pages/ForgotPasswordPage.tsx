import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/Logo'

interface ForgotForm {
  email: string
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotForm>()

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="mt-4">Reset your password</CardTitle>
          <CardDescription>
            {sent ? 'Check your inbox for the reset link' : 'Enter your email and we\'ll send you a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-sm text-gray-500">
                We sent a password reset link to <strong>{getValues('email')}</strong>
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                      })}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
