import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NewProjectPage from './pages/NewProjectPage';
import EditorPage from './pages/EditorPage';
import DashboardLayout from './components/DashboardLayout';
// Placeholders for other pages to restore the app structure
const DeployPage = () => <div>Deploy Page Content</div>;
const ServersPage = () => <div>Servers Page Content</div>;
const IpGuardPage = () => <div>IP Guard Page Content</div>;

/**
 * Main application component with routing.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* The root path now redirects to the new project flow, which is the intended starting point. */}
        <Route path="/" element={<Navigate to="/new-project" replace />} />

        {/* The New Project page is a standalone route without the dashboard layout. */}
        <Route path="/new-project" element={<div className="h-screen w-screen bg-background text-foreground p-4 flex items-center justify-center"><NewProjectPage /></div>} />
        
        {/* The main dashboard layout now lives under the /app path to avoid conflicts. */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/app/editor" replace />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="deploy" element={<DeployPage />} />
          <Route path="servers" element={<ServersPage />} />
          <Route path="ip-guard" element={<IpGuardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;