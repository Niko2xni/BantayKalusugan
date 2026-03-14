import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './landing_page.jsx'
import Login from './login.jsx'
import Register from './register.jsx'
import UserDashboard from './user_dashboard.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminReports from './AdminReports.jsx'
import AdminSettings from './AdminSettings.jsx'

// Import the new component for testing backend connection
import UserList from './components/UserList.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        {/* Test Route for backend connection */}
        <Route path="/users" element={<UserList />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)