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
import VitalsPage from './VitalsPage.jsx'

// Admin pages
import AdminDashboard from './AdminDashboard.jsx'
import AdminReports from './AdminReports.jsx'
import AdminSettings from './AdminSettings.jsx'
import AdminAuditLogs from './AdminAuditLogs.jsx'

// Import the new component for testing backend connection
import UserList from './components/UserList.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected: any logged-in user (patient or admin) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/vitals" element={<ProtectedRoute><VitalsPage /></ProtectedRoute>} />

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

          {/* Test Route for backend connection */}
          <Route path="/users" element={<UserList />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)