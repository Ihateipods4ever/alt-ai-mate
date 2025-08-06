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
        {/* The New Project page is a standalone route */}
        <Route path="/new-project" element={<div className="h-screen w-screen bg-background text-foreground p-4 flex items-center justify-center"><NewProjectPage /></div>} />
        
        {/* All other pages are nested within the main dashboard layout */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/editor" />} />
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