import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function TermsPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link to="/" className="font-display text-sm font-medium text-primary hover:underline">← Back to Home</Link>
          <h1 className="mt-6 font-display text-4xl font-bold">Terms of Service</h1>
          <p className="mt-4 text-gray-500">Last updated: June 2024</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card mt-12 space-y-6 text-gray-600 dark:text-gray-300"
        >
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using SkillSwap, you agree to be bound by these Terms of Service
              and our Privacy Policy.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">2. User Accounts</h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities under your account. You must provide accurate information during registration.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">3. Acceptable Use</h2>
            <p className="mt-2">
              You agree not to misuse the platform, harass other users, post inappropriate content, or engage
              in fraudulent activity. Violations may result in account suspension or termination.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">4. Skill Exchanges</h2>
            <p className="mt-2">
              SkillSwap facilitates connections between learners and teachers. We are not responsible for
              the quality of skill exchanges, which are agreements between individual users.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">5. Intellectual Property</h2>
            <p className="mt-2">
              Content you create remains yours. By posting skills or profile content, you grant SkillSwap
              a license to display and distribute that content on the platform.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">6. Limitation of Liability</h2>
            <p className="mt-2">
              SkillSwap is provided &quot;as is&quot; without warranties. We are not liable for indirect,
              incidental, or consequential damages arising from your use of the service.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
