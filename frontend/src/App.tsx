import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { store } from '@/store'
import { PublicLayout, AuthLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const MySkillsPage = lazy(() => import('@/pages/MySkillsPage'))
const AddSkillPage = lazy(() => import('@/pages/AddSkillPage'))
const BrowseSkillsPage = lazy(() => import('@/pages/BrowseSkillsPage'))
const SkillDetailPage = lazy(() => import('@/pages/SkillDetailPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const RequestsPage = lazy(() => import('@/pages/RequestsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'))
const CertificatesPage = lazy(() => import('@/pages/CertificatesPage'))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'))
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <DashboardSkeleton />
    </div>
  )
}

function SkillsBrowseRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/browse${search}`} replace />
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="features" element={<FeaturesPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="browse" element={<BrowseSkillsPage />} />
                  <Route path="skills" element={<SkillsBrowseRedirect />} />
                  <Route path="skills/:id" element={<SkillDetailPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                </Route>

                <Route element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                <Route element={<DashboardLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="my-skills" element={<MySkillsPage />} />
                  <Route path="skills/add" element={<AddSkillPage />} />
                  <Route path="requests" element={<RequestsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="achievements" element={<AchievementsPage />} />
                  <Route path="certificates" element={<CertificatesPage />} />
                  <Route path="admin" element={<AdminDashboardPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                duration: 4000,
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  )
}
