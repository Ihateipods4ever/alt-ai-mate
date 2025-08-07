import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NewProjectPage from './pages/NewProjectPage';
import EditorPage from './pages/EditorPage';
import DashboardLayout from './components/DashboardLayout';
import DeployPage from './pages/DeployPage';
import ServersPage from './pages/ServersPage';
import DashboardPage from './pages/DashboardPage';
import IpGuardPage from './pages/IpGuardPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Main application component with routing.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* The root path now redirects to the dashboard, which is the intended starting point. */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

        {/* The New Project page is a standalone route without the dashboard layout. */}
        <Route path="/new-project" element={<div className="h-screen w-screen bg-background text-foreground p-4 flex items-center justify-center"><NewProjectPage /></div>} />
        
        {/* The main dashboard layout now lives under the /app path to avoid conflicts. */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="deploy" element={<DeployPage />} />
          <Route path="servers" element={<ServersPage />} />
          <Route path="ip-guard" element={<IpGuardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;