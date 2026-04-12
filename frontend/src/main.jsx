import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './landing_page.jsx'
import Login from './login.jsx'
import Register from './register.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

// User pages
import Dashboard from './Dashboard.jsx'
import AnalyticsPage from './AnalyticsPage.jsx'
import SchedulesPage from './SchedulesPage.jsx'
import ChatPage from './ChatPage.jsx'
import HelpPage from './HelpPage.jsx'
import ProfilePage from './ProfilePage.jsx'

// Admin pages
import AdminDashboard from './AdminDashboard.jsx'
import AdminReports from './AdminReports.jsx'
import AdminSettings from './AdminSettings.jsx'
import AdminAuditLogs from './AdminAuditLogs.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected: patient only */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="patient">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={<ProtectedRoute requiredRole="patient"><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute requiredRole="patient"><SchedulesPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute requiredRole="patient"><ChatPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute requiredRole="patient"><HelpPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute requiredRole="patient"><ProfilePage /></ProtectedRoute>} />
          <Route path="/vitals" element={<ProtectedRoute requiredRole="patient"><AnalyticsPage /></ProtectedRoute>} />

          {/* Protected: admin only */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAuditLogs />
            </ProtectedRoute>
          } />

        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)