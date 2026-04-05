import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import AnalyticsPage from './AnalyticsPage';
import SchedulesPage from './SchedulesPage';
import ChatPage from './ChatPage';
import HelpPage from './HelpPage';
import ProfilePage from './ProfilePage.jsx';

import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;