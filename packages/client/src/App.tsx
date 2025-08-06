import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NewProjectPage from './pages/NewProjectPage';
import EditorPage from './pages/EditorPage';

/**
 * Main application component with routing.
 */
function App() {
  return (
    <Router>
      <div className="h-screen w-screen bg-background text-foreground p-4 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Navigate to="/new-project" />} />
          <Route path="/new-project" element={<NewProjectPage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;