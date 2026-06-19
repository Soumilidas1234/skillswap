import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link to="/" className="font-display text-sm font-medium text-primary hover:underline">← Back to Home</Link>
          <h1 className="mt-6 font-display text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-gray-500">Last updated: June 2024</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card mt-12 space-y-6 text-gray-600 dark:text-gray-300"
        >
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">1. Information We Collect</h2>
            <p className="mt-2">
              We collect information you provide directly, including your name, email address, profile details,
              skills, and learning activity. We also collect usage data such as pages visited and features used.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h2>
            <p className="mt-2">
              Your information is used to provide and improve our services, match you with learning partners,
              send notifications, and personalize your experience. We never sell your personal data to third parties.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">3. Data Security</h2>
            <p className="mt-2">
              We implement industry-standard security measures including encryption, secure authentication,
              and regular security audits to protect your data.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">4. Your Rights</h2>
            <p className="mt-2">
              You have the right to access, update, or delete your personal information at any time through
              your profile settings or by contacting us at privacy@skillswap.ai.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">5. Cookies</h2>
            <p className="mt-2">
              We use essential cookies for authentication and session management. Analytics cookies help us
              understand how users interact with our platform.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
