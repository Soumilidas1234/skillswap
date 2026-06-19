import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { images } from '@/lib/images'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        <img
          src={images.notFound}
          alt=""
          className="mx-auto mb-6 h-48 w-auto object-contain"
          aria-hidden
        />
        <motion.h1
          className="font-display text-6xl font-bold leading-none gradient-text sm:text-8xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          404
        </motion.h1>
        <h2 className="mt-4 font-display text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 max-w-md text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/">
            <Button><Home className="h-4 w-4" /> Go Home</Button>
          </Link>
          <Link to="/browse">
            <Button variant="outline"><Search className="h-4 w-4" /> Browse Skills</Button>
          </Link>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
