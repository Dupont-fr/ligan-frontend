import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AdminActivitiesPage } from './pages/admin/AdminActivitiesPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminPlansPage } from './pages/admin/AdminPlansPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AuthLayout } from './pages/auth/AuthLayout'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { BrowsePage } from './pages/BrowsePage'
import { CategoriesPage } from './pages/CategoriesPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { PricingPage } from './pages/PricingPage'
import { BusinessPage } from './pages/BusinessPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trouver" element={<BrowsePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/tarifs" element={<PricingPage />} />
          <Route path="/business/:slug" element={<BusinessPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute requireRole={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/activities" element={<AdminActivitiesPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/plans" element={<AdminPlansPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App